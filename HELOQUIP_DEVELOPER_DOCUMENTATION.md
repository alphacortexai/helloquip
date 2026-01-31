# HeloQuip – Developer Documentation

A concise technical reference for developing, extending, debugging, and understanding the HeloQuip medical e‑commerce and support system.

---

## 1. Overview

**HeloQuip** is a Next.js 15 (App Router) medical e‑commerce app with:

- Product catalog, categories, search, cart, checkout, and orders
- Admin panel (products, categories, orders, carousel, legal, notifications)
- AI support agent (LangChain + Google Gemini) with RAG over Firestore
- Firebase: Firestore, Auth, Storage, FCM (push + in-app)
- PWA, multi‑currency, wishlist, compare, testimonials, quote requests

**Tech stack:** Next.js 15, React 19, Tailwind CSS 4, Firebase (Auth, Firestore, Storage, Messaging), LangChain, Google Gemini, NextAuth, TipTap, DOMPurify, jsPDF.

---

## 2. Project Structure

```
app/
├── layout.js                 # Root layout, metadata, Roboto, PWA
├── page.js                   # Home: Trending, Categories, Featured, Latest, Recently Viewed, Testimonials
├── globals.css               # Tailwind, animations (search glow, etc.)
├── account/                  # User profile, orders
├── admin/                    # Admin dashboard (withAdminAuth)
│   ├── login/                # Admin login (Google)
│   ├── page.js               # Tabbed UI; routes to admin components
│   └── components/           # ProductForm, OrderManager, CarouselSettings, LegalSettings, etc.
├── agent-chat/               # AI support chat UI
├── api/
│   ├── agent-chat/route.js   # LLM + RAG (products, orders, quotes)
│   ├── send-notification/    # FCM + in‑app (Firebase Admin)
│   ├── mark-fcm-read/, mark-notification-read/
│   ├── products/, trending/
│   └── ug-location/
├── categories/               # Category browse
├── category/[slug]/          # Products by category
├── compare/                  # Product comparison
├── feedback/                 # Share Your Experience (Testimonials)
├── order/                    # Cart + checkout (OrderClient)
│   └── [id]/                 # Order detail
├── product/[id]/             # Product detail + views, cart add
├── privacy/, terms/          # Legal (from settings/legal)
├── register/                 # Customer sign‑up (Google)
├── search/                   # Search results
├── shipments/                # Orders list
├── wishlist/
└── utils/withAdminAuth.js    # Admin guard (email allowlist)

components/                   # Navbar, Footer, ProductCard, SearchBar, AgentChat, etc.
hooks/                        # useProductSettings, useCurrency, useProductSuggestions
lib/
├── firebase.js               # Firebase app, db, storage, auth, messaging
├── cacheUtils.js             # SessionStorage cache (keys, TTLs)
├── intelligentProductSearch.js  # Shared search: productSearchableText, runIntelligentSearch, etc.
├── customerExperienceService.js # Wishlist, recentViews, productComparisons, recommendations
├── useDisplaySettings.js     # settings/display
└── ...
```

---

## 3. Firebase & Firestore

### 3.1 Configuration

- **Client:** `lib/firebase.js` – `initializeApp`, `getFirestore`, `getStorage`, `getAuth`, `getMessaging` (client-only).
- **Admin (FCM):** `app/api/send-notification/route.js` – Firebase Admin from `FIREBASE_SERVICE_ACCOUNT` or `FIREBASE_SERVICE_ACCOUNT_PATH` or `server/firebase/*.json`. `private_key` is normalized (`\\n` → `\n`) to fix PEM errors.

### 3.2 Firestore Collections

| Collection | Purpose | Key fields / notes |
|------------|---------|--------------------|
| **products** | Catalog | `name`, `description`, `price`, `category`, `categoryName`, `subCategory`, `imageUrl` (object with `90x90`, `100x100`, etc.), `extraImageUrls`, `shopId`, `shopName`, `attributes[]`, `tags[]`, `discount`, `qty`, `warranty`, `manufacturer`, `sku`, `productCode`, `slug`, `status` (`active`/`draft`), `createdAt`, `updatedAt` |
| **categories** | Taxonomy | `name`, `slug`, `parentId` (null = root), `order` |
| **trendingProducts** | Homepage carousel | `productId`, `order`; or carousel uses `settings/display` custom images |
| **orders** | Customer orders | `userId`, `items[]`, `address{}`, `totalAmount`, `status`, `createdAt`, `userName`, `userEmail`, `userPhone`, `paymentMethod`, `paymentStatus`. Lookup by `userEmail` or `address.email` for agent. |
| **carts/{userId}/items** | Cart per user | Subcollection; product-like docs with `quantity` |
| **users** | Profiles | `address`, `fcmToken`, etc. |
| **settings/display** | Display + carousel | `carouselMode` (`"trending"` \| `"images"`), `carouselImages[]` (`{url, link}`), etc. |
| **settings/productDisplay** | Product UI | `showMOQ`, `showSKU`, `productNameCase` |
| **settings/legal** | Privacy & ToS | `privacyPolicy`, `termsOfService` (HTML or file refs) |
| **quoteRequests** | Quote requests from cart | `userEmail`, `items`, `totalAmount`, `status`, `createdAt` |
| **quotations** | Admin-created quotes | From QuoteRequestManager / ConvertToQuotation |
| **feedback** | Testimonials | `name`, `feedback`, `rating`, `createdAt` |
| **messages** | In‑app + system | `from`, `to`, `title`, `text`, `type` (`notification`), `orderId`, `target`, `read`, `chatId`, `timestamp` |
| **notifications** | In‑app notification tracking | `userId`, `title`, `body`, `target`, `orderId`, `read`, `messageId` |
| **adminNotifications** | Admin alerts | `type` (`order_submitted`), `orderId`, `userId`, `title`, `text`, `totalAmount`, `target`, `read` |
| **recentViews** | Recently viewed | `userId`, `productId`, `product`, `viewedAt` |
| **wishlist** | Saved products | `userId`, `productId`, `product` |
| **productComparisons** | Compare feature | `{userId}` doc with compared product ids |
| **productViews** | Analytics | `{productId}/weeks/{weekKey}` for view counts |
| **productSuggestions** | User suggestions | `productId`, `suggestion`, status |
| **shops** | Shop/location | Used in products and admin |

### 3.3 Indexes

- `firestore.indexes.json`: often empty; add composite indexes as Firestore errors suggest.
- Order-by-email: `(userEmail, createdAt)`, `(address.email, createdAt)`. Agent route falls back to in-memory sort if `orderBy` fails.

### 3.4 Security

- **firestore.rules:** Time-bound open rules for development; `quoteRequests`/`quotations` require `request.auth != null`. **TODO:** tighten before production.
- **storage.rules:** `allow read, write: if false`; configure as needed for uploads.

---

## 4. Key Flows

### 4.1 Authentication

- **Customer:** Firebase Auth (Google) via `register` and `AutoSignIn`; `SessionProvider` + NextAuth for session.
- **Admin:** `withAdminAuth` HOC; allowlist in `app/utils/withAdminAuth.js` (`adminEmails`). Non‑admin → `/admin/login`.

### 4.2 Cart & Orders

- **Cart:** `CartContext` (localStorage) and/or Firestore `carts/{uid}/items`. `ClientLayoutWrapper` and `Navbar` use `onSnapshot` on `carts/{uid}/items` for badge.
- **Checkout:** `app/order/OrderClient.js`. Loads `users/{uid}`, `carts/{uid}/items`, `orders` (q: `userId`, `orderBy('createdAt','desc')`). `placeOrder`:
  1. Builds `orderData` (userId, items, address, totalAmount, status, userEmail, etc.).
  2. `setDoc(doc(collection(db,"orders")), orderData)` (auto ID).
  3. Deletes cart items in `carts/{uid}/items`.
  4. Fetches `users/{uid}.fcmToken`; calls `/api/send-notification` (FCM).
  5. `addDoc(collection(db,"messages"), { type: "notification", orderId, target, ... })`.
  6. `addDoc(collection(db,"adminNotifications"), { type: "order_submitted", orderId, ... })`.
- **Order IDs:** Shown in full, UPPERCASE (e.g. `Order #0NO20PBGDP1XUGM9AAU4`). `summarizeOrder` in agent includes `orderIdDisplay: (order.id||"").toUpperCase()`.

### 4.3 Product Search (UI & Agent)

- **`lib/intelligentProductSearch.js`** (shared):
  - `productSearchableText(p)`: name, description, sku, productCode, manufacturer, tags, attributes → one string.
  - `productMatchesSearch(product, term)`: `productSearchableText(p).includes(term)`.
  - `buildSearchTerms(phrase, words, keywords)`: normalizes (e.g. "AlphaMeds" → "alphamed"); used for include‑style filter.
  - `extractProductSearchPhrase(text)`, `extractSearchKeywords(text)`: from natural language.
  - `calculateRelevanceScore`, `runIntelligentSearch`: score and rank by phrase, keywords, category, tags, manufacturer.
- **UI:** `SearchBar`, `SearchResults`, `RelatedProducts`, etc. use `productSearchableText` / `productMatchesSearch`; no hard 50 limit on fetch; display limits (e.g. 10 suggestions, 6 related) are separate.
- **Agent:** Uses same helpers; fetch limit 50 or 1000 when `wantsAllProducts`, `searchTerms`, `wantsCatalog`, etc. Search‑first filter + `runIntelligentSearch` when appropriate.

### 4.4 AI Agent (`/api/agent-chat`)

- **Stack:** LangChain `ChatGoogleGenerativeAI` (Gemini), `@langchain/core` Messages. Env: `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY`.
- **Intent / extractors:** `wantsOrder`, `wantsQuote`, `wantsProduct`, `wantsCatalog`, `wantsAllProducts`, `wantsProductCount`; `extractEmail`, `extractOrderId`, `extractSku`, `extractProductCode`, `extractSearchKeywords`, `extractProductSearchPhrase`.
- **Order vs product:** If `wantsOrder` and `productCode`/`sku` looks like an order ID (12+ alphanumeric, no hyphens), it is not used as product code. `extractOrderId` also matches “order … code/id/number : X”. Email can be taken from recent user `messages` when `orderId` is present.
- **RAG:**
  - **Products:** Fetch from `products` (status `active`), limit 50 or 1000. If `searchTerms`: filter with `productSearchableText`; if `needIntelligentSearch`: `runIntelligentSearch`. Inject `Product search (priority)` or `Products in database` (or “none”) into context. For order‑only/quote‑only, product context can be skipped.
  - **Orders:** If `orderId` + `email`: `getDoc(orders, orderId)`, check `userEmail`/`address.email`, push `Order lookup: {summarizeOrder}`. Else if `email`: query `userEmail` and `address.email` (with `orderBy('createdAt','desc')`, limit 25, fallback without `orderBy`), merge, sort, up to 25, push `Recent orders (N): [...]`.
  - **Quotes:** `quoteRequests` by `userEmail`, limit 3.
  - **SKU/productCode:** Direct product lookup when not treated as order ID; fallbacks (no hyphens, sku↔productCode). Early “not found” only when a product lookup was actually performed.
- **System prompt:** Use DB results; never invent; order numbers in UPPERCASE; no “noted”/“logged”/“we’ll contact you” for in‑chat-only; quote requests: only look up existing; new quotes via cart “Request Quote”.
- **`summarizeOrder`:** `id`, `orderIdDisplay`, `status`, `createdAt`, `total`, `summary`, `paymentStatus`. `summarizeProduct` / `summarizeProductShort` / `summarizeProductMinimal` for different context sizes.

### 4.5 Agent Chat UI (`/agent-chat`, `AgentChat.js`)

- **Layout:** No navbar/footer on `/agent-chat`; floating FAB on other pages; mobile bottom nav hidden.
- **Persistence:** Anonymous: `localStorage` `helloquip_agent_chat_uuid`, `helloquip_agent_chat_messages`. Logged‑in: no persistence in this component.
- **API:** `POST /api/agent-chat` with `{ message, messages }` (last 10). Response `{ reply }` or `{ reply, retryAfterSeconds }` on 429.

### 4.6 Notifications (FCM + In‑App)

- **FCM:** `/api/send-notification` (Firebase Admin). Expects `fcmToken`, `title`, `body`; optional `target`, `link`, `data`. Builds `dataPayload` with `target`, `link` for client navigation. Production link base: `https://helloquip.vercel.app` (overridable for admin‑manual).
- **In‑app:** `messages` (type `notification`) and `notifications`. `Navbar`/`ClientLayoutWrapper` listen to `messages` for unread. `firebase-messaging-sw.js` handles `NAVIGATE_TO`; `ClientLayoutWrapper` listens for `message` and `router.push`.
- **Order status:** `OrderManager` on status change writes to `messages` and `notifications`, and calls `/api/send-notification` with user’s `fcmToken`.

---

## 5. Caching & Performance

- **`lib/cacheUtils.js`:** SessionStorage, TTLs: `MAIN_PRODUCTS` 30m, `TRENDING_PRODUCTS` 10m, `SEARCH_PRODUCTS` 5m, `CATEGORIES` 15m, `SETTINGS` 30m. Keys: `CACHE_KEYS.MAIN_PRODUCTS`, etc.
- **Home:** `page.js` uses `cacheUtils` and `useDisplaySettings`; progressive loading (Trending, Featured, Categories, etc.) with `dynamic` and `SkeletonLoader`.
- **Images:** `next/config.mjs` `remotePatterns` for Firebase Storage, Google, Flaticon; `formats`: avif, webp; `minimumCacheTTL`, `Cache-Control` headers.

---

## 6. Admin Panel

- **Entry:** `/admin` (withAdminAuth), `/admin/login` (Google).
- **Tabs (high level):** Add/Edit Products, Categories, Subcategories, Shops, Set/View Trending, Auto Trending (Views), Product Search, Shipments (OrderManager), Drafts, Recommendation Analytics, Quotations, Quote Requests, Feedback, Notifications, User Messenger, Admin Chat, Display Settings, Carousel Settings, Notification Tracker, Latest Products, Product Control, Product Suggestions, Product Reorder, Legal (Privacy & ToS).
- **OrderManager:** List orders, `orderBy`/filters; select order → detail, status update, delete. On status change: FCM + `messages` + `notifications`. `paymentStatus` can be set to `paid`.
- **CarouselSettings:** `settings/display` – `carouselMode` (trending | images), `carouselImages[]` with `url`, `link`.
- **LegalSettings:** TipTap editor; `settings/legal` – `privacyPolicy`, `termsOfService` (HTML or stored file refs). `/privacy`, `/terms` read and render (DOMPurify for HTML).

---

## 7. UI & Theming

- **Layout:** `ClientLayoutWrapper`: Navbar (with search), main, Footer, Toaster, floating agent FAB, mobile bottom nav (Orders, Messenger badges). Hide navbar/footer on `/register`, `/login`, `/messenger`, `/admin`, `/agent-chat` (and `/admin/*`).
- **Colors:** Primary blue `#0865ff`, `#255cdc` (e.g. main background, links). Roboto from Google Fonts.
- **Product names:** `hooks/useProductSettings` – `productNameCase`: titlecase, uppercase, lowercase, normal; `toTitleCase` handles hyphens.

---

## 8. Environment & Config

- **Firebase (client):** In `lib/firebase.js` (replace in production as needed).
- **Agent:** `GOOGLE_GENERATIVE_AI_API_KEY` or `GEMINI_API_KEY`.
- **FCM / Firebase Admin:** `FIREBASE_SERVICE_ACCOUNT` (JSON string) or `FIREBASE_SERVICE_ACCOUNT_PATH` or `server/firebase/*.json`. `PUBLIC_BASE_URL` for links.
- **Next:** `next.config.mjs` – `images.remotePatterns`, `formats`, `headers`.

---

## 9. Debugging Tips

- **Agent not finding products:** Check `searchTerms`, `extractProductSearchPhrase`, `extractSearchKeywords`; ensure `productSearchableText` includes the fields you expect (e.g. `manufacturer`). For “order” vs “product”, confirm `wantsOrder` and the 12+ alphanumeric rule for not using order-like codes as product code.
- **Order lookup failures:** Verify `orderId` extraction (“order … code : X”) and email from `messages`. Firestore `orderSnap.exists()` (method, not property). `userEmail` and `address.email` must match.
- **FCM / “Invalid PEM”:** `private_key` in service account: replace `\\n` with `\n` (done in `send-notification`). Ensure `fcmToken` stored in `users/{uid}.fcmToken` and passed correctly.
- **Firestore permission / index:** Check `firestore.rules` and `firestore.indexes.json`; use error links to create composite indexes.
- **Cart/orders mismatch:** Order flow uses Firestore `carts/{uid}/items`; `CartContext` is localStorage. If both are used, ensure add/remove/placeOrder keep them in sync where intended.
- **Caching:** Clear `sessionStorage` or use `cacheUtils.clearAllCaches` when debugging stale products/categories.

---

## 10. Extending the System

- **New Firestore collection:** Add in `lib` or `app` with `collection`/`doc`; update `firestore.rules` and add indexes if queried.
- **New agent intents:** In `agent-chat/route.js` add `wantsX`, extractors, and a RAG block that pushes to `contextNotes`. Keep product vs order/quote handling consistent.
- **New admin tab:** Add tab in `admin/page.js` and a component in `admin/components/`; guard with `withAdminAuth` (already on the page).
- **New API route:** Under `app/api/`; use `db` from `@/lib/firebase` for client SDK or Firebase Admin in `send-notification`-style routes.
- **Search:** Reuse `intelligentProductSearch.js`; for new filters, extend `productSearchableText` or add parameters to `runIntelligentSearch`/`buildSearchTerms`.

---

## 11. File Reference (Quick)

| Area | Files |
|------|-------|
| Firebase | `lib/firebase.js` |
| Search | `lib/intelligentProductSearch.js` |
| Cache | `lib/cacheUtils.js` |
| Product display | `hooks/useProductSettings.js`, `lib/useDisplaySettings.js` |
| Cart | `components/CartContext.js` |
| Layout | `components/ClientLayoutWrapper.js`, `components/ClientWrapper.js` |
| Agent API | `app/api/agent-chat/route.js` |
| Agent UI | `components/AgentChat.js`, `app/agent-chat/page.js` |
| Orders | `app/order/OrderClient.js`, `app/order/[id]/page.js`, `app/admin/components/OrderManager.js` |
| FCM | `app/api/send-notification/route.js`, `public/firebase-messaging-sw.js` |
| Admin | `app/admin/page.js`, `app/utils/withAdminAuth.js` |
| Legal | `app/admin/components/LegalSettings.js`, `app/privacy/page.js`, `app/terms/page.js` |

---

*Last updated to reflect the codebase as of this documentation. Firestore field names and routes should be kept in sync when changing the app.*
