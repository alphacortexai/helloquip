import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import admin from "firebase-admin";
import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";

const systemPrompt =
  "You are HelloQuip's customer service assistant. Be concise, friendly, and helpful. " +
  "Answer questions about products, quotes, orders, shipping, returns, and account issues. " +
  "Use database lookup results when provided and never invent order or product details. " +
  "If a user asks about an order, request the order number and email used at checkout. " +
  "If you are unsure or need human help, ask a clarifying question and offer to connect them. " +
  "Do not ask for sensitive payment details.";

let adminInitError = null;

function parseInlineServiceAccount(value) {
  if (!value) return null;
  const trimmed = value.trim().replace(/^"(.*)"$/, "$1");
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    // If it's a path, load the file
    if (existsSync(trimmed)) {
      const content = readFileSync(trimmed, "utf-8");
      return JSON.parse(content);
    }
    // Try base64-encoded JSON
    try {
      const decoded = Buffer.from(trimmed, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch {
      throw error;
    }
  }
}

function getAdminDb() {
  if (admin.apps.length) {
    return { db: admin.firestore(), error: null };
  }

  try {
    let serviceAccount = null;
    const inline = process.env.FIREBASE_SERVICE_ACCOUNT;
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (inline) {
      serviceAccount = parseInlineServiceAccount(inline);
    } else if (filePath) {
      const resolved = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);
      const content = readFileSync(resolved, "utf-8");
      serviceAccount = JSON.parse(content);
    } else {
      const defaultDir = path.join(process.cwd(), "server/firebase");
      if (existsSync(defaultDir)) {
        const jsonFiles = readdirSync(defaultDir).filter((f) => f.endsWith(".json"));
        if (jsonFiles.length > 0) {
          const candidate = path.join(defaultDir, jsonFiles[0]);
          const content = readFileSync(candidate, "utf-8");
          serviceAccount = JSON.parse(content);
        } else {
          adminInitError =
            "Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH (no JSON found in server/firebase)";
        }
      } else {
        adminInitError =
          "Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH (server/firebase not found)";
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      return { db: admin.firestore(), error: null };
    }

    return { db: null, error: adminInitError };
  } catch (error) {
    adminInitError = `Failed to initialize Firebase Admin: ${error.message}`;
    return { db: null, error: adminInitError };
  }
}

function extractEmail(text = "") {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : null;
}

function extractOrderId(text = "") {
  const orderMatch = text.match(/order\s*(id|#)?\s*([A-Za-z0-9]{6,})/i);
  if (orderMatch?.[2]) return orderMatch[2];
  const hashMatch = text.match(/#([A-Za-z0-9]{8,})/);
  return hashMatch ? hashMatch[1] : null;
}

function extractSku(text = "") {
  const match = text.match(/\bsku[:\s]*([A-Za-z0-9-]{3,})/i);
  return match ? match[1] : null;
}

function extractProductCode(text = "") {
  const match = text.match(/\bproduct\s*code[:\s]*([A-Za-z0-9-]{3,})/i);
  return match ? match[1] : null;
}

function wantsCatalogList(text = "") {
  return /available products|what products|show products|list products|catalog|inventory/i.test(text);
}

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return "N/A";
  return `UGX ${Number(value).toLocaleString()}`;
}

function summarizeOrder(order) {
  const createdAt = order.createdAt?.toDate
    ? order.createdAt.toDate()
    : order.createdAt
    ? new Date(order.createdAt)
    : null;
  const items = Array.isArray(order.items) ? order.items : [];
  const total =
    order.totalAmount ??
    items.reduce((sum, item) => {
      const price = item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price;
      return sum + (price || 0) * (item.quantity || 1);
    }, 0);
  const summary = items
    .slice(0, 3)
    .map((item) => `${item.name} x ${item.quantity || 1}`)
    .join(", ");

  return {
    id: order.id,
    status: order.status || "unknown",
    createdAt: createdAt ? createdAt.toISOString() : null,
    total: formatCurrency(total),
    summary: summary || "No items",
    paymentStatus: order.paymentStatus || "unknown",
  };
}

function summarizeProduct(product) {
  const price = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;
  return {
    id: product.id,
    name: product.name,
    price: formatCurrency(price),
    category: product.categoryName || product.category || "N/A",
    sku: product.sku || "N/A",
    stock: typeof product.qty === "number" ? product.qty : "N/A",
    status: product.status || "unknown",
  };
}

function summarizeProductShort(product) {
  const price = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;
  return {
    id: product.id,
    name: product.name,
    price: formatCurrency(price),
    category: product.categoryName || product.category || "N/A",
    sku: product.sku || "N/A",
  };
}

export async function POST(req) {
  try {
    const { message, messages } = await req.json();

    if (!message || typeof message !== "string") {
      return Response.json(
        { reply: "Please send a valid message." },
        { status: 400 }
      );
    }

    const llm = new ChatGoogleGenerativeAI({
      model: "gemini-3-flash-preview",
      temperature: 0.4,
    });

    const contextNotes = [];
    const wantsOrder = /order|shipping|delivery|track|status/i.test(message);
    const wantsQuote = /quote|quotation/i.test(message);
    const wantsProduct = /product|price|availability|stock/i.test(message);
    const wantsCatalog = wantsCatalogList(message);
    const email = extractEmail(message);
    const orderId = extractOrderId(message);
    const sku = extractSku(message);
    const productCode = extractProductCode(message);

    let productLookupPerformed = false;
    let productFound = false;
    let orderLookupFailed = false;
    let orderEmailMismatch = false;
    let quoteLookupFailed = false;

    if (wantsOrder || wantsQuote || wantsProduct || wantsCatalog) {
      const { db, error } = getAdminDb();
      if (!db) {
        contextNotes.push(
          `Database lookups are unavailable (${error || "Firebase Admin not configured"}).`
        );
        if (
          (wantsProduct && (sku || productCode)) ||
          (wantsOrder && (orderId || email)) ||
          (wantsQuote && email) ||
          wantsCatalog
        ) {
          return Response.json({
            reply:
              "I can't access the live database right now to verify that. Please try again in a moment or contact support.",
          });
        }
      } else {
        if (wantsCatalog) {
          const snapshot = await db
            .collection("products")
            .where("status", "==", "active")
            .limit(8)
            .get();

          const products = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          if (products.length > 0) {
            const list = products.map(summarizeProductShort);
            contextNotes.push(`Catalog sample: ${JSON.stringify(list)}`);
          } else {
            return Response.json({
              reply:
                "I couldn't find any active products right now. Please try again later.",
            });
          }
        }

        if (wantsOrder) {
          if (orderId && email) {
            const orderSnap = await db.collection("orders").doc(orderId).get();
            if (orderSnap.exists) {
              const order = { id: orderSnap.id, ...orderSnap.data() };
              const matchesEmail =
                order.userEmail === email || order.address?.email === email;
              if (matchesEmail) {
                contextNotes.push(
                  `Order lookup: ${JSON.stringify(summarizeOrder(order))}`
                );
              } else {
                orderEmailMismatch = true;
              }
            } else {
              orderLookupFailed = true;
            }
          } else if (email) {
            const orders = [];
            const direct = await db
              .collection("orders")
              .where("userEmail", "==", email)
              .limit(5)
              .get();
            direct.forEach((doc) => orders.push({ id: doc.id, ...doc.data() }));

            const byAddress = await db
              .collection("orders")
              .where("address.email", "==", email)
              .limit(5)
              .get();
            byAddress.forEach((doc) => {
              if (!orders.find((existing) => existing.id === doc.id)) {
                orders.push({ id: doc.id, ...doc.data() });
              }
            });

            if (orders.length > 0) {
              const summaries = orders.slice(0, 3).map(summarizeOrder);
              contextNotes.push(`Recent orders: ${JSON.stringify(summaries)}`);
            } else {
              orderLookupFailed = true;
            }
          }
        }

        if (wantsQuote && email) {
          const quoteRequests = await db
            .collection("quoteRequests")
            .where("userEmail", "==", email)
            .limit(3)
            .get();
          const quoteSummaries = quoteRequests.docs.map((doc) => ({
            id: doc.id,
            status: doc.data().status || "pending",
            createdAt: doc.data().createdAt || null,
            total: formatCurrency(doc.data().totalAmount),
          }));
          if (quoteSummaries.length > 0) {
            contextNotes.push(`Quote requests: ${JSON.stringify(quoteSummaries)}`);
          } else {
            quoteLookupFailed = true;
          }
        }

        if (wantsProduct && (sku || productCode)) {
          productLookupPerformed = true;
          let productDoc = null;
          if (sku) {
            const snapshot = await db
              .collection("products")
              .where("sku", "==", sku)
              .limit(1)
              .get();
            if (!snapshot.empty) {
              productDoc = snapshot.docs[0];
            }
          }
          if (!productDoc && productCode) {
            const snapshot = await db
              .collection("products")
              .where("productCode", "==", productCode)
              .limit(1)
              .get();
            if (!snapshot.empty) {
              productDoc = snapshot.docs[0];
            }
          }
          if (productDoc) {
            const product = { id: productDoc.id, ...productDoc.data() };
            contextNotes.push(
              `Product lookup: ${JSON.stringify(summarizeProduct(product))}`
            );
            productFound = true;
          } else {
            productFound = false;
          }
        }
      }
    }

    if (orderEmailMismatch) {
      return Response.json({
        reply:
          "I found the order ID, but the email didn't match. Please confirm the email used at checkout.",
      });
    }

    if (wantsOrder && (orderId || email) && orderLookupFailed) {
      return Response.json({
        reply:
          "I couldn't find an order with that information. Please double-check the order ID and email.",
      });
    }

    if (wantsQuote && email && quoteLookupFailed) {
      return Response.json({
        reply:
          "I couldn't find any quote requests for that email. Please double-check the address you used.",
      });
    }

    if (wantsProduct && productLookupPerformed && !productFound) {
      return Response.json({
        reply:
          "I couldn't find that SKU or product code in our catalog. Please check the code or share the product name.",
      });
    }

    const history = Array.isArray(messages)
      ? messages
          .filter((m) => m && typeof m.content === "string" && m.role !== "system")
          .slice(-10)
          .map((m) =>
            m.role === "assistant"
              ? new AIMessage(m.content)
              : new HumanMessage(m.content)
          )
      : [];

    const systemWithContext =
      contextNotes.length > 0
        ? `${systemPrompt}\n\nDatabase context:\n${contextNotes.join("\n")}`
        : systemPrompt;

    const response = await llm.invoke([
      new SystemMessage(systemWithContext),
      ...history,
      new HumanMessage(message),
    ]);

    return Response.json({ reply: response.content });
  } catch (error) {
    const status = error?.status || error?.response?.status;
    const message = String(error?.message || "");
    if (status === 429 || message.includes("429")) {
      const retryMatch = message.match(/retry in\s+([\d.]+)s/i);
      const retrySeconds = retryMatch ? Number(retryMatch[1]) : null;
      return Response.json(
        {
          reply:
            "The AI is temporarily rate-limited. Please wait a few seconds and try again.",
          retryAfterSeconds: retrySeconds,
        },
        { status: 429 }
      );
    }

    console.error("Agent chat error:", error);
    return Response.json(
      { reply: "Sorry, something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
