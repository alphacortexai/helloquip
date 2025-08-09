"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collectionGroup,
  getDocs,
  where,
  query,
  doc,
  getDoc,
  setDoc,
  writeBatch,
} from "firebase/firestore";

function getCurrentWeekStartKey() {
  const now = new Date();
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = d.getUTCDay(); // 0=Sun..6=Sat
  const diffToMonday = (day === 0 ? -6 : 1) - day; // move to Monday
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
  return key;
}

export default function TrendingFromViews() {
  const [loading, setLoading] = useState(false);
  const [topProducts, setTopProducts] = useState([]); // {productId, count, product?}
  const [selectedIds, setSelectedIds] = useState(new Set());
  const weekKey = useMemo(() => getCurrentWeekStartKey(), []);

  const fetchTopViewed = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all week docs for the current week across all products
      const q = query(collectionGroup(db, "weeks"), where("weekStart", "==", weekKey));
      const snap = await getDocs(q);

      const items = [];
      for (const ds of snap.docs) {
        const count = ds.data().count || 0;
        // parent is collection 'weeks', its parent is document 'productViews/{productId}'
        const productViewDocRef = ds.ref.parent.parent; // DocumentReference
        const productId = productViewDocRef?.id;
        if (!productId) continue;
        items.push({ productId, count });
      }

      // Sort and take top 10
      items.sort((a, b) => (b.count || 0) - (a.count || 0));
      const top10 = items.slice(0, 10);

      // Enrich with product data for display
      const enriched = await Promise.all(
        top10.map(async (it) => {
          try {
            const pRef = doc(db, "products", it.productId);
            const pSnap = await getDoc(pRef);
            const p = pSnap.exists() ? pSnap.data() : null;
            return { ...it, product: p };
          } catch {
            return { ...it, product: null };
          }
        })
      );

      setTopProducts(enriched);
      setSelectedIds(new Set(enriched.map((e) => e.productId))); // preselect all
    } catch (e) {
      console.error("Failed to fetch top viewed products:", e);
      alert("Failed to fetch top viewed products.");
    } finally {
      setLoading(false);
    }
  }, [weekKey]);

  useEffect(() => {
    fetchTopViewed();
  }, [fetchTopViewed]);

  const toggleSelect = (productId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const addSelectedToTrending = async () => {
    if (loading) return;
    setLoading(true);
    try {
      let added = 0;
      for (const { productId, product } of topProducts) {
        if (!selectedIds.has(productId)) continue;
        const tRef = doc(db, "trendingProducts", productId);
        const tSnap = await getDoc(tRef);
        // Preserve manual trending
        if (tSnap.exists() && tSnap.data()?.source === "manual") {
          continue;
        }
        const imageUrl = typeof product?.imageUrl === 'object'
          ? (product?.imageUrl?.['200x200'] || product?.imageUrl?.['100x100'] || product?.imageUrl?.original)
          : product?.imageUrl;

        const data = {
          productId,
          addedAt: new Date(),
          source: "auto",
          name: product?.name || "Unnamed",
          price: product?.price || 0,
          imageUrl: imageUrl || null,
        };
        await setDoc(tRef, data, { merge: true });
        added++;
      }
      alert(`Added ${added} product(s) to trending.`);
    } catch (e) {
      console.error("Failed to add to trending:", e);
      alert("Failed to add selected to trending.");
    } finally {
      setLoading(false);
    }
  };

  const resetCurrentWeekCounts = async () => {
    if (!confirm(`Reset view counts for week ${weekKey}?`)) return;
    setLoading(true);
    try {
      const q = query(collectionGroup(db, "weeks"), where("weekStart", "==", weekKey));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      let opCount = 0;
      for (const ds of snap.docs) {
        batch.delete(ds.ref);
        opCount++;
        if (opCount % 400 === 0) {
          await batch.commit();
        }
      }
      if (opCount % 400 !== 0) {
        await batch.commit();
      }
      alert("Current week view counts reset.");
      setTopProducts([]);
      setSelectedIds(new Set());
    } catch (e) {
      console.error("Failed to reset current week counts:", e);
      alert("Failed to reset current week counts.");
    } finally {
      setLoading(false);
    }
  };

  const resetAllCounts = async () => {
    if (!confirm("Reset ALL historical view counts for all products? This cannot be undone.")) return;
    setLoading(true);
    try {
      const q = query(collectionGroup(db, "weeks"));
      const snap = await getDocs(q);
      let batch = writeBatch(db);
      let opCount = 0;
      for (const ds of snap.docs) {
        batch.delete(ds.ref);
        opCount++;
        if (opCount % 400 === 0) {
          await batch.commit();
          batch = writeBatch(db);
        }
      }
      if (opCount % 400 !== 0) {
        await batch.commit();
      }
      alert("All view counts reset.");
      setTopProducts([]);
      setSelectedIds(new Set());
    } catch (e) {
      console.error("Failed to reset all counts:", e);
      alert("Failed to reset all counts.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Top Viewed (Week starting {weekKey})</h3>
          <p className="text-xs text-gray-600">Shows the 10 most viewed products this week based on product detail page visits.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTopViewed}
            disabled={loading}
            className="px-3 py-2 text-sm rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            onClick={addSelectedToTrending}
            disabled={loading || selectedIds.size === 0}
            className="px-3 py-2 text-sm rounded-md bg-[#2e4493] text-white hover:bg-[#131a2f] disabled:opacity-50"
          >
            Add Selected to Trending
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        {topProducts.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No views recorded for this week yet.</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {topProducts.map(({ productId, count, product }) => (
              <li key={productId} className="p-3 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(productId)}
                  onChange={() => toggleSelect(productId)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                {product?.imageUrl && (
                  <img
                    src={typeof product.imageUrl === 'object' ? (product.imageUrl['200x200'] || product.imageUrl['100x100'] || product.imageUrl.original) : product.imageUrl}
                    alt={product?.name || 'Product'}
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product?.name || productId}</p>
                  <p className="text-xs text-gray-500">Views (this week): <span className="font-semibold">{count || 0}</span></p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-red-800 mb-2">Reset View Counts</h4>
        <p className="text-xs text-red-700 mb-3">Use with caution. This will delete weekly view counters.</p>
        <div className="flex items-center gap-2">
          <button
            onClick={resetCurrentWeekCounts}
            disabled={loading}
            className="px-3 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            Reset Current Week
          </button>
          <button
            onClick={resetAllCounts}
            disabled={loading}
            className="px-3 py-2 text-sm rounded-md bg-red-200 text-red-900 hover:bg-red-300 disabled:opacity-50"
          >
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}


