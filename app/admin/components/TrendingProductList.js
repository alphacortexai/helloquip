"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function TrendingProductsTab() {
  const [trendingList, setTrendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const snapshot = await getDocs(collection(db, "trendingProducts"));
        const items = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const productRef = doc(db, "products", data.productId);
            const productSnap = await getDoc(productRef);

            const shopRef = doc(db, "shops", data.shopId);
            const shopSnap = await getDoc(shopRef);

            return {
              id: docSnap.id,
              ...productSnap.data(),
              shopName: shopSnap.exists() ? shopSnap.data().name : "Unknown Shop",
            };
          })
        );
        setTrendingList(items);
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) return <p>Loading trending products...</p>;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Trending Products</h2>
      {trendingList.length === 0 ? (
        <p>No trending products selected.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trendingList.map((item) => (
            <li key={item.id} className="border rounded-md p-4 bg-white shadow">
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
              <p className="text-sm mt-2 italic text-gray-500">
                From shop: <strong>{item.shopName}</strong>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
