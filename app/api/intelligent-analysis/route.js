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
   - Their page views (path, time)
   - Their product clicks (productId, productName, time)
   - Their product views (productId, productName, time)
   - Their navigation events (if useful)
   - Device info (e.g. type, browser, screen)
   - Location info (e.g. timezone, language)
   - Last activity time

Use ONLY this tracking data. Do not refer to wishlists, comparisons, trending lists, or recommendation system data—only what is in the payload.

Your task is to produce a single, detailed markdown report with these sections (use ## for main sections, ### for subsections):

1. **Executive summary** – 2–4 sentences on overall tracking engagement (users, page views, product engagement) based on the summary stats.

2. **Most accessed pages** – From page views across all users: which paths/pages are visited most? List top paths with counts. Note patterns (e.g. home vs product pages).

3. **Trending / best liked products** – From product clicks and product views: which products are clicked or viewed most? Use productId and productName from the data. Which products appear in multiple users’ activity?

4. **User behaviour (per user)** – Summarise behaviour using the detailed activity: e.g. which users are most active, what do they view/click, device and location mix, any notable patterns (e.g. many page views but few product clicks).

5. **Recommendations for improvement** – Based only on this tracking data: what to improve (e.g. product discovery, CTAs, page layout, tracking coverage, mobile vs desktop). Be specific and actionable.

6. **Possible user challenges** – Inferred from the data: e.g. low product engagement vs page views, high navigation events vs few clicks, device/location patterns, or UX frictions. Only state what the data supports.

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

export async function POST() {
  try {
    const [pageViewsSnap, clicksSnap, productViewsSnap, navSnap] = await Promise.all([
      getDocs(query(collection(db, "userPageViews"), orderBy("createdAt", "desc"), limit(500))),
      getDocs(query(collection(db, "userClicks"), orderBy("createdAt", "desc"), limit(500))),
      getDocs(query(collection(db, "userProductViews"), orderBy("createdAt", "desc"), limit(500))),
      getDocs(query(collection(db, "userNavigation"), orderBy("createdAt", "desc"), limit(500))),
    ]);

    const pageViewsRaw = pageViewsSnap.docs.map((d) => ({ id: d.id, ...toJsonSafe(d.data()) }));
    const pageViews = pageViewsRaw.filter((p) => !(p.path || p.pagePath || "").startsWith("/admin"));
    const clicks = clicksSnap.docs.map((d) => ({ id: d.id, ...toJsonSafe(d.data()) }));
    const productViews = productViewsSnap.docs.map((d) => ({ id: d.id, ...toJsonSafe(d.data()) }));
    const navigation = navSnap.docs.map((d) => ({ id: d.id, ...toJsonSafe(d.data()) }));

    const userMap = new Map();

    [...pageViews, ...clicks, ...productViews, ...navigation].forEach((item) => {
      const userId = item.userId;
      if (!userId) return;

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId,
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
