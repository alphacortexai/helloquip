"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  writeBatch,
  getDoc,
} from "firebase/firestore";

export default function TrendingProductSelector() {
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [trendingProductIds, setTrendingProductIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchShops = async () => {
      const snapshot = await getDocs(collection(db, "shops"));
      setShops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchShops();
  }, []);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "trendingProducts"));
        const trendingIds = snapshot.docs.map(doc => doc.data().productId).filter(Boolean);
        setTrendingProductIds(trendingIds);
      } catch (error) {
        console.error("Error fetching trending products:", error);
      }
    };
    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedShopId) return;
      try {
        const q = query(collection(db, "products"), where("shopId", "==", selectedShopId));
        const snapshot = await getDocs(q);
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [selectedShopId]);

  const toggleTrending = async (productId) => {
    if (loading) return;
    setLoading(true);

    try {
      const trendingRef = doc(db, "trendingProducts", productId);
      const isTrending = trendingProductIds.includes(productId);

      if (isTrending) {
        // Remove from trending
        await deleteDoc(trendingRef);
        setTrendingProductIds(prev => prev.filter(id => id !== productId));
      } else {
        // Add to trending - store minimal data
        const product = products.find(p => p.id === productId);
        if (!product) {
          console.error("Product not found:", productId);
          return;
        }

        const trendingData = {
          productId,
          shopId: selectedShopId,
          addedAt: new Date(),
          // Store essential data for quick access
          name: product.name || "Unnamed",
          price: product.price || 0,
          imageUrl: product.imageUrl || null,
        };

        await setDoc(trendingRef, trendingData);
        setTrendingProductIds(prev => [...prev, productId]);
      }
    } catch (error) {
      console.error("Error toggling trending status:", error);
    } finally {
      setLoading(false);
    }
  };

  const cleanupOrphanedTrending = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Get all trending product IDs
      const trendingSnapshot = await getDocs(collection(db, "trendingProducts"));
      const trendingIds = trendingSnapshot.docs.map(doc => doc.data().productId).filter(Boolean);

      // Check which products still exist
      const batch = writeBatch(db);
      let removedCount = 0;

      for (const productId of trendingIds) {
        const productRef = doc(db, "products", productId);
        const productSnap = await getDoc(productRef);
        
        if (!productSnap.exists()) {
          // Product doesn't exist, remove from trending
          const trendingRef = doc(db, "trendingProducts", productId);
          batch.delete(trendingRef);
          removedCount++;
        }
      }

      if (removedCount > 0) {
        await batch.commit();
        // Refresh trending list
        const newSnapshot = await getDocs(collection(db, "trendingProducts"));
        const newTrendingIds = newSnapshot.docs.map(doc => doc.data().productId).filter(Boolean);
        setTrendingProductIds(newTrendingIds);
        alert(`Cleaned up ${removedCount} orphaned trending products.`);
      } else {
        alert("No orphaned trending products found.");
      }
    } catch (error) {
      console.error("Error cleaning up orphaned trending products:", error);
      alert("Error cleaning up orphaned trending products.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Select Trending Products</h2>
        <button
          onClick={cleanupOrphanedTrending}
          disabled={loading}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
        >
          {loading ? "Cleaning..." : "Clean Orphaned"}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">How it works:</h3>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Only product IDs are stored in trending collection</li>
          <li>• Product data is fetched from main products collection</li>
          <li>• Use "Clean Orphaned" to remove deleted products from trending</li>
          <li>• System automatically filters out non-existent products</li>
        </ul>
      </div>

      <select
        value={selectedShopId}
        onChange={(e) => setSelectedShopId(e.target.value)}
        className="w-full max-w-sm p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">Select a shop</option>
        {shops.map((shop) => (
          <option key={shop.id} value={shop.id}>
            {shop.name}
          </option>
        ))}
      </select>

      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm flex items-start space-x-4"
            >
              {product.imageUrl && (
                <img
                  src={typeof product.imageUrl === 'object' ? product.imageUrl['200x200'] || product.imageUrl.original : product.imageUrl}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  loading="lazy"
                />
              )}

              <div className="flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.description || "No description"}</p>
                <p className="text-sm text-gray-500 mt-1">Price: ${product.price || 0}</p>

                <label className="mt-auto flex items-center space-x-3 cursor-pointer select-none pt-2">
                  <input
                    type="checkbox"
                    checked={trendingProductIds.includes(product.id)}
                    onChange={() => toggleTrending(product.id)}
                    disabled={loading}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                  />
                  <span className="text-gray-900 font-medium">
                    {trendingProductIds.includes(product.id) ? "Trending" : "Mark as Trending"}
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {trendingProductIds.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-900 mb-2">Currently Trending ({trendingProductIds.length}):</h3>
          <div className="text-xs text-green-800">
            {trendingProductIds.join(", ")}
          </div>
        </div>
      )}
    </div>
  );
}
