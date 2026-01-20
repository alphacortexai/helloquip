/**
 * Intelligent product search – shared logic used by SearchBar, SearchResults,
 * ProductSearch, RelatedProducts, and the agent chat. Supports:
 * - Relevance scoring (word/phrase matches, category, tags, manufacturer)
 * - Multi-field includes (name, description, sku, productCode, manufacturer, tags, attributes)
 * - Product-type phrase extraction from natural language
 */

/** Build searchable text from a product (name, description, sku, productCode, manufacturer, tags, attributes). */
export function productSearchableText(p) {
  const tags = Array.isArray(p.tags) ? p.tags.map((t) => String(t || "")).join(" ") : "";
  const attrs = (Array.isArray(p.attributes) ? p.attributes : [])
    .map((a) => (a && (a.name || a.description)) ? String(a.name || "") + " " + String(a.description || "") : "")
    .filter(Boolean)
    .join(" ");
  const parts = [p.name, p.description, p.sku, p.productCode, p.manufacturer, tags, attrs].filter(Boolean);
  return parts.join(" ").toLowerCase();
}

/**
 * ProductSearch/SearchBar-style: does the product match the term in any field?
 * Uses productSearchableText for a single includes check.
 */
export function productMatchesSearch(product, term) {
  if (!term || !String(term).trim()) return true;
  const t = String(term).toLowerCase().trim();
  return productSearchableText(product).includes(t);
}

/**
 * Relevance scoring (adapted from RelatedProducts). Criteria: { name, category, manufacturer, tags, keywords }.
 * - name: product-type phrase, e.g. "BP machine"
 * - keywords: string[] from brand/description, e.g. ["AlphaMed"]
 * Higher score = better match. Products with no match tend to score 0.
 */
export function calculateRelevanceScore(product, criteria = {}) {
  let score = 0;
  const { name, category, manufacturer, tags = [], keywords = [] } = criteria;
  const searchable = productSearchableText(product);
  const cat = (product.categoryName || product.category || "").toLowerCase();
  const productTags = Array.isArray(product.tags) ? product.tags.map((t) => String(t || "").toLowerCase()) : [];

  // ----- Name / phrase (product-type) -----
  if (name && product.name) {
    const productWords = product.name.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
    const searchWords = name.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);

    const exactFull = searchWords.filter((w) => productWords.includes(w));
    score += exactFull.length * 100;
    if (exactFull.length > 0) score += 80;
    if (exactFull.length >= 2) score += 60;

    if (product.name.toLowerCase().includes(name.toLowerCase())) score += 120;

    const partial = searchWords.filter((w) => productWords.some((pw) => pw.includes(w) || w.includes(pw)));
    score += partial.length * 40;
  }

  // ----- Keywords (brand, manufacturer, "in description") in searchable text -----
  for (const k of keywords) {
    if (k && searchable.includes(String(k).toLowerCase().trim())) score += 50;
  }

  // ----- Category -----
  if (category && cat) {
    if (cat === category.toLowerCase()) score += 30;
    else {
      const cw = category.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
      const pcw = cat.split(/\s+/).filter((w) => w.length >= 2);
      const match = cw.filter((w) => pcw.includes(w)).length;
      score += match * 15;
    }
  }

  // ----- Tags -----
  if (tags && tags.length > 0 && productTags.length > 0) {
    const st = tags.map((t) => String(t).toLowerCase());
    const match = st.filter((t) => productTags.includes(t)).length;
    score += match * 25;
    if (match > 0) score += 20;
  }

  // ----- Description (phrase/name in description) -----
  if (product.description && name) {
    const desc = product.description.toLowerCase();
    const nw = name.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
    const dw = desc.split(/\s+/).filter((w) => w.length >= 2);
    const dm = nw.filter((w) => dw.includes(w)).length;
    score += dm * 20;
    if (desc.includes(name.toLowerCase())) score += 30;
  }

  // ----- Manufacturer -----
  if (manufacturer && product.manufacturer && String(product.manufacturer).toLowerCase() === String(manufacturer).toLowerCase()) {
    score += 15;
  }

  // ----- Phrase or any keyword in searchable (broad fallback) -----
  if (name && searchable.includes(name.toLowerCase().trim())) score += 25;
  for (const k of keywords) {
    if (k && searchable.includes(String(k).toLowerCase().trim())) score += 10; // already +50 above; this is extra for phrase+keyword
  }

  return score;
}

/**
 * Build search terms from phrase, words, and keywords. Used as 1st-priority product search
 * (SearchBar-style: any term in name/description/sku/productCode/manufacturer/tags/attributes).
 * - Adds normalized forms: e.g. "AlphaMeds" → also "AlphaMed" so "AlphaMed" in description matches.
 */
export function buildSearchTerms(phrase = "", words = [], keywords = []) {
  const set = new Set();
  const add = (s) => {
    const t = String(s || "").trim().toLowerCase();
    if (t.length >= 2) set.add(t);
  };
  if (phrase) add(phrase);
  (words || []).forEach(add);
  (keywords || []).forEach((k) => {
    add(k);
    if (k && k.length > 2 && k.endsWith("s")) add(k.slice(0, -1));
  });
  return [...set];
}

/**
 * Extract a product-type search phrase from natural language.
 * E.g. "do you have a BP machine by AlphaMed" → { phrase: "BP machine", words: ["bp","machine"] }
 * "do we have BP Machine BY AlphaMeds" → { phrase: "BP Machine", words: ["bp","machine"] }
 */
export function extractProductSearchPhrase(text = "") {
  const patterns = [
    /(?:do you have|do we have|have you got|do you sell|sell|looking for|find|find me|any|show me|I need|need|get me|search for|search|products like|something like)\s+(?:a\s+|an\s+)?([A-Za-z0-9][A-Za-z0-9\s\-]{2,60}?)(?=\s+by\s|\s+from\s|\s+with\s|,|\.|\?|$)/gi,
    /(?:do you have|do we have|have you got|do you sell|looking for|find|any|show me|I need|get me|search for)\s+([A-Za-z0-9][A-Za-z0-9\s\-]{2,60}?)(?=\s|,|\.|\?|$)/gi,
  ];
  for (const re of patterns) {
    re.lastIndex = 0;
    const m = re.exec(text);
    if (m && m[1]) {
      const phrase = m[1].trim();
      if (phrase.length >= 2) {
        const words = phrase
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length >= 2 && !/^(the|and|for|are|you|have|with|from|that|this)$/i.test(w));
        return { phrase, words: words.length ? words : [phrase.toLowerCase()] };
      }
    }
  }
  return { phrase: "", words: [] };
}

/**
 * Run intelligent search: score products by phrase, words, and keywords, then return top N by relevance.
 * @param {object[]} products
 * @param {{ phrase?: string, words?: string[], keywords?: string[] }} opts
 * @param {number} topN
 * @param {number} minScore
 */
export function runIntelligentSearch(products, opts = {}, topN = 50, minScore = 20) {
  const { phrase = "", words = [], keywords = [] } = opts;
  const hasQuery = phrase || words.length > 0 || keywords.length > 0;
  if (!hasQuery || !products.length) return products;

  const criteria = {
    name: phrase,
    category: "",
    manufacturer: "",
    tags: [],
    keywords: Array.isArray(keywords) ? keywords : [keywords].filter(Boolean),
  };

  const scored = products.map((p) => ({
    ...p,
    _relevanceScore: calculateRelevanceScore(p, criteria),
  }));

  scored.sort((a, b) => (b._relevanceScore || 0) - (a._relevanceScore || 0));
  const filtered = scored.filter((p) => (p._relevanceScore || 0) >= minScore);
  const top = filtered.slice(0, topN);

  // Drop internal score before returning
  return top.map(({ _relevanceScore, ...p }) => p);
}
