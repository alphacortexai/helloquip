import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

const SYSTEM_PROMPT = `You are an expert e-commerce analytics analyst for HeloQuip. You will receive a JSON payload containing ONLY:

1. **Detailed User Tracking Analytics** – Summary totals:
   - Total Users Tracked
   - Page Views
   - Product Clicks
   - Product Views
   - Navigation Events

2. **Detailed Activity for every user** – For each tracked user:
   - Their userId AND (when available) userName and userEmail
   - Their page views (path, time)
   - Their product clicks (productId, productName, time)
   - Their product views (productId, productName, time)
   - Their navigation events (if useful)
   - Device info (e.g. type, browser, screen)
   - Location info (e.g. timezone, language)
   - Last activity time

3. **Traffic trends and search analytics** derived from tracking data:
   - Visits and unique users per day/week/month
   - What users searched for (from /search?q=... URLs), top search terms and trends over time

Use ONLY this tracking data. Do not refer to wishlists, comparisons, trending lists, or recommendation system data—only what is in the payload.

Your task is to produce a single, detailed markdown report with these sections (use ## for main sections, ### for subsections):

1. **Executive summary** – 2–4 sentences on overall tracking engagement (users, page views, product engagement) based on the summary stats.

2. **Visits over time** – Visits and unique users per day/week/month (from tracking). Highlight growth/declines and spikes.

3. **Most accessed pages** – From page views across all users: which paths/pages are visited most? List top paths with counts. Note patterns (e.g. home vs product pages).

4. **Search insights** – What users searched for (top search terms), trends by day/week/month, and what looks related (terms commonly searched by the same users).

5. **Trending / best liked products** – From product clicks and product views: which products are clicked or viewed most? Use productId and productName from the data. Which products appear in multiple users’ activity?

6. **User behaviour (per user)** – Summarise behaviour using the detailed activity: e.g. which users are most active, what do they view/click, device and location mix, any notable patterns (e.g. many page views but few product clicks).

7. **Recommendations for improvement** – Based only on this tracking data: what to improve (e.g. product discovery, CTAs, page layout, tracking coverage, mobile vs desktop). Be specific and actionable.

8. **Possible user challenges** – Inferred from the data: e.g. low product engagement vs page views, high navigation events vs few clicks, device/location patterns, or UX frictions. Only state what the data supports.

Output only the markdown report, no preamble. Use bullet points and short paragraphs. Be concise but thorough.`;

function toJsonSafe(value) {
  if (value === undefined) return null;
  if (value && typeof value.toDate === "function") return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(toJsonSafe);
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const out = {};
    for (const k of Object.keys(value)) {
      try {
        out[k] = toJsonSafe(value[k]);
      } catch (_) {
        out[k] = String(value[k]);
      }
    }
    return out;
  }
  return value;
}

function dayKeyUTC(isoOrDate) {
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function monthKeyUTC(isoOrDate) {
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function weekKeyMondayUTC(isoOrDate) {
  const now = new Date(isoOrDate);
  if (Number.isNaN(now.getTime())) return null;
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay(); // 0=Sun..6=Sat
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function safeParseUrl(fullUrl) {
  if (!fullUrl || typeof fullUrl !== "string") return null;
  try {
    return new URL(fullUrl);
  } catch {
    // If it's a relative URL, try to add a dummy base
    try {
      return new URL(fullUrl, "https://helloquip.local");
    } catch {
      return null;
    }
  }
}

function normalizeSearchTerm(term) {
  if (!term) return null;
  const t = String(term).trim().replace(/\s+/g, " ");
  if (!t) return null;
  if (t.length > 80) return t.slice(0, 80);
  return t;
}

export async function POST() {
  try {
    const [pageViewsSnap, clicksSnap, productViewsSnap, navSnap, usersSnap] = await Promise.all([
      getDocs(query(collection(db, "userPageViews"), orderBy("createdAt", "desc"), limit(500))),
      getDocs(query(collection(db, "userClicks"), orderBy("createdAt", "desc"), limit(500))),
      getDocs(query(collection(db, "userProductViews"), orderBy("createdAt", "desc"), limit(500))),
      getDocs(query(collection(db, "userNavigation"), orderBy("createdAt", "desc"), limit(500))),
      // Used only to map known userId -> name/email (NOT for analytics metrics)
      getDocs(collection(db, "users")),
    ]);

    const pageViewsRaw = pageViewsSnap.docs.map((d) => ({ id: d.id, ...toJsonSafe(d.data()) }));
    const pageViews = pageViewsRaw.filter((p) => !(p.path || p.pagePath || "").startsWith("/admin"));
    const clicks = clicksSnap.docs.map((d) => ({ id: d.id, ...toJsonSafe(d.data()) }));
    const productViews = productViewsSnap.docs.map((d) => ({ id: d.id, ...toJsonSafe(d.data()) }));
    const navigation = navSnap.docs.map((d) => ({ id: d.id, ...toJsonSafe(d.data()) }));

    const knownUsers = {};
    usersSnap.forEach((d) => {
      const data = toJsonSafe(d.data()) || {};
      knownUsers[d.id] = {
        name: data.name || null,
        email: data.email || data.address?.email || null,
      };
    });

    const userMap = new Map();

    [...pageViews, ...clicks, ...productViews, ...navigation].forEach((item) => {
      const userId = item.userId;
      if (!userId) return;

      if (!userMap.has(userId)) {
        const info = knownUsers[String(userId)] || null;
        userMap.set(userId, {
          userId,
          userName: info?.name || null,
          userEmail: info?.email || null,
          pageViews: [],
          clicks: [],
          productViews: [],
          navigation: [],
          deviceInfo: item.deviceInfo || {},
          locationInfo: item.locationInfo || {},
          lastActivity: null,
        });
      }

      const userData = userMap.get(userId);
      if (item.path) userData.pageViews.push(item);
      if (item.type === "product_click" || item.type === "button_click") userData.clicks.push(item);
      if (item.type === "product_view") userData.productViews.push(item);
      if (item.type === "navigation" || item.type === "page_hidden" || item.type === "page_visible") {
        userData.navigation.push(item);
      }
      if (item.deviceInfo) userData.deviceInfo = item.deviceInfo;
      if (item.locationInfo) userData.locationInfo = item.locationInfo;

      const itemTime = item.createdAt || item.timestamp || null;
      if (itemTime && (!userData.lastActivity || new Date(itemTime) > new Date(userData.lastActivity))) {
        userData.lastActivity = itemTime;
      }
    });

    const users = Array.from(userMap.values()).sort((a, b) => {
      const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
      const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
      return bTime - aTime;
    });

    // --- Visits over time (based on page views) ---
    const visitsByDay = {};
    const visitsByWeek = {};
    const visitsByMonth = {};
    const uniqueUsersByDay = {};
    const uniqueUsersByWeek = {};
    const uniqueUsersByMonth = {};

    pageViews.forEach((p) => {
      const ts = p.createdAt || p.timestamp || null;
      const uid = p.userId ? String(p.userId) : null;
      if (!ts || !uid) return;

      const dk = dayKeyUTC(ts);
      const wk = weekKeyMondayUTC(ts);
      const mk = monthKeyUTC(ts);

      if (dk) {
        visitsByDay[dk] = (visitsByDay[dk] || 0) + 1;
        uniqueUsersByDay[dk] = uniqueUsersByDay[dk] || new Set();
        uniqueUsersByDay[dk].add(uid);
      }
      if (wk) {
        visitsByWeek[wk] = (visitsByWeek[wk] || 0) + 1;
        uniqueUsersByWeek[wk] = uniqueUsersByWeek[wk] || new Set();
        uniqueUsersByWeek[wk].add(uid);
      }
      if (mk) {
        visitsByMonth[mk] = (visitsByMonth[mk] || 0) + 1;
        uniqueUsersByMonth[mk] = uniqueUsersByMonth[mk] || new Set();
        uniqueUsersByMonth[mk].add(uid);
      }
    });

    const serializeUniqueUserSets = (obj) =>
      Object.fromEntries(
        Object.entries(obj).map(([k, set]) => [k, set instanceof Set ? set.size : 0])
      );

    // --- Search analytics (from /search?q=... in fullUrl) ---
    const searchTermCounts = {};
    const searchesByDay = {};
    const searchesByWeek = {};
    const searchesByMonth = {};
    const perUserSearchTerms = {}; // userId -> Set(term)

    pageViews.forEach((p) => {
      const path = p.path || p.pagePath || "";
      if (path !== "/search") return;
      const url = safeParseUrl(p.fullUrl);
      const q = url?.searchParams?.get("q");
      const term = normalizeSearchTerm(q);
      if (!term) return;

      const uid = p.userId ? String(p.userId) : null;
      const ts = p.createdAt || p.timestamp || null;

      searchTermCounts[term] = (searchTermCounts[term] || 0) + 1;

      if (uid) {
        perUserSearchTerms[uid] = perUserSearchTerms[uid] || new Set();
        perUserSearchTerms[uid].add(term);
      }

      const dk = ts ? dayKeyUTC(ts) : null;
      const wk = ts ? weekKeyMondayUTC(ts) : null;
      const mk = ts ? monthKeyUTC(ts) : null;
      if (dk) searchesByDay[dk] = (searchesByDay[dk] || 0) + 1;
      if (wk) searchesByWeek[wk] = (searchesByWeek[wk] || 0) + 1;
      if (mk) searchesByMonth[mk] = (searchesByMonth[mk] || 0) + 1;
    });

    const topSearchTerms = Object.entries(searchTermCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 30)
      .map(([term, count]) => ({ term, count }));

    // Simple "related searches": terms co-searched by the same users (top co-occurrences for top terms)
    const related = {}; // term -> { otherTerm: count }
    Object.values(perUserSearchTerms).forEach((set) => {
      if (!(set instanceof Set)) return;
      const terms = Array.from(set);
      for (let i = 0; i < terms.length; i++) {
        const a = terms[i];
        related[a] = related[a] || {};
        for (let j = 0; j < terms.length; j++) {
          if (i === j) continue;
          const b = terms[j];
          related[a][b] = (related[a][b] || 0) + 1;
        }
      }
    });
    const relatedSearchTerms = topSearchTerms.slice(0, 10).map(({ term }) => {
      const rel = related[term] || {};
      const topRel = Object.entries(rel)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([otherTerm, count]) => ({ otherTerm, count }));
      return { term, related: topRel };
    });

    const pathCounts = {};
    pageViews.forEach((p) => {
      const path = p.path || p.pagePath || "unknown";
      pathCounts[path] = (pathCounts[path] || 0) + 1;
    });
    const topPaths = Object.entries(pathCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 25)
      .map(([path, count]) => ({ path, count }));

    const detailedActivityPerUser = users.map((u) => ({
      userId: u.userId,
      userName: u.userName || null,
      userEmail: u.userEmail || null,
      lastActivity: u.lastActivity,
      deviceInfo: u.deviceInfo,
      locationInfo: u.locationInfo,
      pageViewsCount: u.pageViews.length,
      pageViews: u.pageViews.slice(0, 50).map((p) => ({ path: p.path || p.pagePath, createdAt: p.createdAt })),
      productClicksCount: u.clicks.length,
      productClicks: u.clicks.slice(0, 30).map((c) => ({
        productId: c.productId,
        productName: c.productName,
        type: c.type,
        createdAt: c.createdAt,
      })),
      productViewsCount: u.productViews.length,
      productViews: u.productViews.slice(0, 30).map((v) => ({
        productId: v.productId,
        productName: v.productName,
        createdAt: v.createdAt || v.timestamp,
      })),
      navigationEventsCount: u.navigation.length,
    }));

    const payload = {
      detailedUserTrackingAnalytics: {
        totalUsersTracked: users.length,
        pageViews: pageViews.length,
        productClicks: clicks.length,
        productViews: productViews.length,
        navigationEvents: navigation.length,
      },
      visitsOverTime: {
        visitsByDay,
        visitsByWeek,
        visitsByMonth,
        uniqueUsersByDay: serializeUniqueUserSets(uniqueUsersByDay),
        uniqueUsersByWeek: serializeUniqueUserSets(uniqueUsersByWeek),
        uniqueUsersByMonth: serializeUniqueUserSets(uniqueUsersByMonth),
      },
      searchAnalytics: {
        topSearchTerms,
        searchesByDay,
        searchesByWeek,
        searchesByMonth,
        relatedSearchTerms,
      },
      topPaths,
      detailedActivityForEveryUser: detailedActivityPerUser,
    };

    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-3-flash-preview",
      temperature: 0.3,
    });

    const response = await llm.invoke([
      new SystemMessage(SYSTEM_PROMPT),
      new HumanMessage(`Tracking data (JSON):\n${JSON.stringify(payload, null, 2)}\n\nGenerate the full markdown report using only this tracking data.`),
    ]);

    const report = typeof response.content === "string" ? response.content : (response.content && response.content[0]?.text) || JSON.stringify(response.content);

    return Response.json({ report });
  } catch (error) {
    console.error("Intelligent analysis error:", error);
    const status = error?.status || error?.response?.status;
    const message = String(error?.message || "");
    if (status === 429 || message.includes("429")) {
      return Response.json(
        { error: "Rate limited. Please try again in a minute.", report: null },
        { status: 429 }
      );
    }
    return Response.json(
      { error: message || "Failed to generate report.", report: null },
      { status: 500 }
    );
  }
}
