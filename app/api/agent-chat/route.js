import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { db } from "@/lib/firebase";
import { collection, getDocs, getDoc, doc, query, where, limit } from "firebase/firestore";

const systemPrompt =
  "You are HelloQuip's customer service assistant. Be concise, friendly, and helpful. " +
  "Answer questions about products, quotes, orders, shipping, returns, and account issues. " +
  "When 'Products in database' is provided in the context, use that list to answer product and catalog questions. Do not say you do not have product data when it is provided—always use the list. " +
  "Product data may include description, warranty, manufacturer, and attributes (name/description pairs). Use these when answering questions about a product's features, warranty, or specifications. " +
  "Use database lookup results when provided and never invent order or product details. " +
  "If a user asks about an order, request the order number and email used at checkout. " +
  "If you are unsure or need human help, ask a clarifying question and offer to connect them. " +
  "Do not ask for sensitive payment details. " +
  // Anti-hallucination: only claim what the system actually does.
  "IMPORTANT—do not invent processes or promise outcomes this chat cannot deliver: " +
  "This chat does NOT save conversations, log requests, or forward them to any team. " +
  "Do NOT say you have 'noted', 'logged', 'recorded', or 'submitted' the user's request, or that it is 'available to our sales team' or 'in our system'. " +
  "Do NOT promise that 'a team member will contact you' or 'we will be in touch' for requests made only in this chat. " +
  "For quote requests: you can only look up existing quote requests by email (from the Request Quote form). If the user wants to get a NEW quote, tell them to add items to their cart and use the 'Request Quote' button on the cart or checkout page—that is how quote requests are actually submitted and reach the sales team. Do not claim their in-chat message creates or submits a quote request. " +
  "In general: only describe actions and systems that exist. If you are not sure whether something happens in the background, do not claim it does.";

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
  return /available products|what products|show products|list products|catalog|inventory|what do you have|what do you sell|what's available|do you have|looking for|items you|offer|sell/i.test(text);
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
  const attrs = Array.isArray(product.attributes) && product.attributes.length
    ? product.attributes
        .filter((a) => (a && (a.name || a.description)))
        .map((a) => ({ name: String(a.name || ""), description: String(a.description || "") }))
    : [];
  return {
    id: product.id,
    name: product.name,
    description: product.description || "—",
    warranty: product.warranty || "—",
    manufacturer: product.manufacturer || "—",
    attributes: attrs,
    price: formatCurrency(price),
    category: product.categoryName || product.category || "N/A",
    sku: product.sku || "N/A",
    stock: typeof product.qty === "number" ? product.qty : "N/A",
    status: product.status || "unknown",
    discount: product.discount ? Number(product.discount) : 0,
  };
}

const DESC_MAX = 100;

function summarizeProductShort(product) {
  const price = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;
  const rawDesc = product.description || "";
  const description = rawDesc
    ? rawDesc.slice(0, DESC_MAX) + (rawDesc.length > DESC_MAX ? "…" : "")
    : "—";
  return {
    id: product.id,
    name: product.name,
    description,
    warranty: product.warranty || "—",
    manufacturer: product.manufacturer || "—",
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
    const wantsProduct = /product|price|availability|stock|warranty|description|specification|spec|feature|attributes|manufacturer/i.test(message);
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

    // Use the same Firestore client as the rest of the app (lib/firebase) — no service account / private key
    // --- RAG: Always fetch products from Firestore so the LLM has real data (do not guess) ---
    let productSnap = await getDocs(
      query(collection(db, "products"), where("status", "==", "active"), limit(50))
    );
    if (productSnap.empty) {
      productSnap = await getDocs(query(collection(db, "products"), limit(50)));
    }
    const productList = productSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const productSummaries = productList.map(summarizeProductShort);
    if (productSummaries.length > 0) {
      contextNotes.push(
        `Products in database (use for product/catalog questions, do not guess): ${JSON.stringify(productSummaries)}`
      );
    } else {
      contextNotes.push("Products in database: none.");
    }
    if (wantsCatalog && productSummaries.length === 0) {
      return Response.json({
        reply:
          "I couldn't find any active products right now. Please try again later.",
      });
    }

    if (wantsOrder) {
      if (orderId && email) {
        const orderSnap = await getDoc(doc(db, "orders", orderId));
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
        const direct = await getDocs(
          query(collection(db, "orders"), where("userEmail", "==", email), limit(5))
        );
        direct.docs.forEach((d) => orders.push({ id: d.id, ...d.data() }));

        const byAddress = await getDocs(
          query(collection(db, "orders"), where("address.email", "==", email), limit(5))
        );
        byAddress.docs.forEach((d) => {
          if (!orders.find((existing) => existing.id === d.id)) {
            orders.push({ id: d.id, ...d.data() });
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
      const quoteRequests = await getDocs(
        query(collection(db, "quoteRequests"), where("userEmail", "==", email), limit(3))
      );
      const quoteSummaries = quoteRequests.docs.map((d) => ({
        id: d.id,
        status: d.data().status || "pending",
        createdAt: d.data().createdAt || null,
        total: formatCurrency(d.data().totalAmount),
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
        const snapshot = await getDocs(
          query(collection(db, "products"), where("sku", "==", sku), limit(1))
        );
        if (!snapshot.empty) {
          productDoc = snapshot.docs[0];
        }
      }
      if (!productDoc && productCode) {
        const snapshot = await getDocs(
          query(collection(db, "products"), where("productCode", "==", productCode), limit(1))
        );
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
