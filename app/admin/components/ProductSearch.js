"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/firebase";
import { cleanFirebaseUrl } from "@/lib/urlUtils";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";

function normalizeText(v) {
  return (v || "").toString().toLowerCase();
}

function productMatchesFilters(product, term, attributeTerm) {
  const t = normalizeText(term);
  const at = normalizeText(attributeTerm);
  const name = normalizeText(product.name);
  const description = normalizeText(product.description);
  const sku = normalizeText(product.sku);
  const productCode = normalizeText(product.productCode);
  const manufacturer = normalizeText(product.manufacturer);
  const tags = Array.isArray(product.tags) ? product.tags.map(normalizeText).join(" ") : normalizeText(product.tags);

  const textMatch = !t ||
    name.includes(t) ||
    description.includes(t) ||
    sku.includes(t) ||
    productCode.includes(t) ||
    manufacturer.includes(t) ||
    tags.includes(t);

  if (!textMatch) return false;

  if (!at) return true;
  const attrs = Array.isArray(product.attributes) ? product.attributes : [];
  return attrs.some(a => normalizeText(a?.name).includes(at) || normalizeText(a?.description).includes(at));
}

function getThumbUrl(imageUrl) {
  if (!imageUrl) return null;
  if (typeof imageUrl === "object") {
    const raw = imageUrl.original || imageUrl["680x680"] || imageUrl["200x200"] || imageUrl["100x100"] || null;
    return typeof raw === 'string' ? cleanFirebaseUrl(raw) : raw;
  }
  return cleanFirebaseUrl(imageUrl);
}

export default function ProductSearch() {
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [term, setTerm] = useState("");
  const [attributeTerm, setAttributeTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [detail, setDetail] = useState(null);

  // Load shops for filter
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "shops"));
        setShops(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch {}
    })();
  }, []);

  const baseQuery = useMemo(() => {
    const base = [collection(db, "products")];
    if (selectedShopId) {
      return query(collection(db, "products"), where("shopId", "==", selectedShopId), orderBy("createdAt", "desc"), limit(50));
    }
    return query(collection(db, "products"), orderBy("createdAt", "desc"), limit(50));
  }, [selectedShopId]);

  const runSearch = async (reset = true) => {
    if (loading) return;
    setLoading(true);
    try {
      let qRef = baseQuery;
      if (!reset && lastVisible) {
        // Append pagination
        if (selectedShopId) {
          qRef = query(collection(db, "products"), where("shopId", "==", selectedShopId), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(50));
        } else {
          qRef = query(collection(db, "products"), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(50));
        }
      }

      const snap = await getDocs(qRef);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      const filtered = docs.filter(p => productMatchesFilters(p, term, attributeTerm));
      setResults(prev => reset ? filtered : [...prev, ...filtered]);

      const lv = snap.docs[snap.docs.length - 1] || null;
      setLastVisible(lv);
      setHasMore(Boolean(lv));
    } catch (e) {
      console.error("Search failed", e);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setResults([]);
    setLastVisible(null);
    setHasMore(false);
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-gray-700 mb-1">Search term (name, sku, code, tags, manufacturer)</label>
          <input
            type="text"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="e.g. syringe, H-ABC-01, XYZ"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Attribute contains</label>
          <input
            type="text"
            value={attributeTerm}
            onChange={(e) => setAttributeTerm(e.target.value)}
            placeholder="e.g. size, sterile"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Shop</label>
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All shops</option>
            {shops.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => { clearSearch(); runSearch(true); }}
          disabled={loading}
          className="px-4 py-2 bg-[#2e4493] text-white text-sm font-medium rounded-md hover:bg-[#131a2f] disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
        <button
          onClick={() => { setTerm(""); setAttributeTerm(""); setSelectedShopId(""); clearSearch(); }}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50"
        >
          Clear
        </button>
      </div>

      {/* Results */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {results.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No results. Enter search criteria and click Search.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {results.map((p) => (
              <li key={p.id} className="p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50" onClick={() => setDetail(p)}>
                {getThumbUrl(p.imageUrl) && (
                  <img src={getThumbUrl(p.imageUrl)} alt={p.name} className="w-12 h-12 object-cover rounded-md" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name || p.id}</p>
                  <p className="text-xs text-gray-500 truncate">SKU: {p.sku} • CODE: {p.productCode}</p>
                </div>
                <div className="text-sm font-semibold text-gray-900">UGX {Number(p.price || 0).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => runSearch(false)}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-3xl mx-4 max-h-[85vh] overflow-auto">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              <button onClick={() => setDetail(null)} className="text-sm text-gray-600 hover:underline">Close</button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                {getThumbUrl(detail.imageUrl) && (
                  <img src={getThumbUrl(detail.imageUrl)} alt={detail.name} className="w-full h-auto rounded-lg border" />
                )}
              </div>
              <div className="md:col-span-2 space-y-2">
                <p className="text-base font-semibold text-gray-900">{detail.name}</p>
                <p className="text-sm text-gray-500">SKU: {detail.sku} • CODE: {detail.productCode}</p>
                <p className="text-sm text-gray-700">UGX {Number(detail.price || 0).toLocaleString()}</p>
                {detail.manufacturer && <p className="text-sm text-gray-600">Manufacturer: {detail.manufacturer}</p>}
                {Array.isArray(detail.tags) && detail.tags.length > 0 && (
                  <p className="text-sm text-gray-600">Tags: {detail.tags.join(", ")}</p>
                )}
                {detail.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-800 mb-1">Description</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.description}</p>
                  </div>
                )}
                {Array.isArray(detail.attributes) && detail.attributes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-800 mb-1">Attributes</p>
                    <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                      {detail.attributes.map((a, i) => (
                        <li key={i}><span className="font-medium">{a.name}:</span> {a.description}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


