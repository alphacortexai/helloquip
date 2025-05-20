// components/TrendingProductSelector.js
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
} from "firebase/firestore";

export default function TrendingProductSelector() {
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [trendingProductIds, setTrendingProductIds] = useState([]);

  useEffect(() => {
    const fetchShops = async () => {
      const snapshot = await getDocs(collection(db, "shops"));
      setShops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchShops();
  }, []);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      const snapshot = await getDocs(collection(db, "trendingProducts"));
      setTrendingProductIds(snapshot.docs.map(doc => doc.data().productId));
    };
    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedShopId) return;
      const q = query(collection(db, "products"), where("shopId", "==", selectedShopId));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, [selectedShopId]);

  const toggleTrending = async (productId) => {
    const trendingRef = doc(db, "trendingProducts", productId);
    const isTrending = trendingProductIds.includes(productId);
    if (isTrending) {
      await deleteDoc(trendingRef);
      setTrendingProductIds(prev => prev.filter(id => id !== productId));
    } else {
      await setDoc(trendingRef, { productId, shopId: selectedShopId });
      setTrendingProductIds(prev => [...prev, productId]);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select Trending Products</h2>

      <select
        value={selectedShopId}
        onChange={(e) => setSelectedShopId(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">Select a shop</option>
        {shops.map((shop) => (
          <option key={shop.id} value={shop.id}>{shop.name}</option>
        ))}
      </select>

      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product.id} className="border p-4 rounded shadow">
              <h3 className="font-semibold">{product.name}</h3>
              <p>{product.description}</p>
              <label className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  checked={trendingProductIds.includes(product.id)}
                  onChange={() => toggleTrending(product.id)}
                />
                <span>Mark as Trending</span>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
