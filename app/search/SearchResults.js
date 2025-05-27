"use client";

export const dynamic = "force-dynamic";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SearchResults() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q")?.toLowerCase() || "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const all = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtered = all.filter((product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        );

        setProducts(filtered);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchProducts();
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Searching...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <button onClick={() => router.back()} className="text-blue-600 mb-4">
        ← Back
      </button>

      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Search Results for "{query}"
      </h2>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden border">
              <div className="relative w-full h-48">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-gray-800">{product.name}</p>
                <p className="text-blue-700 font-bold text-sm">
                  UGX {product.price?.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
