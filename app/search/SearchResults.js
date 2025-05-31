"use client";

export const dynamic = "force-dynamic";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function SearchResults() {
  const [products, setProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
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

        // Prepare similarity logic
        const filteredIds = new Set(filtered.map((p) => p.id));
        const keywords = query.split(" ");
        const filteredCategories = new Set(filtered.map((p) => p.category));
        const basePrice = filtered[0]?.price;

        const suggestions = all.filter((product) => {
          if (filteredIds.has(product.id)) return false;

          const matchesCategory = filteredCategories.has(product.category);
          const matchesPrice = basePrice
            ? product.price >= basePrice * 0.8 && product.price <= basePrice * 1.2
            : false;
          const text = `${product.name} ${product.description}`.toLowerCase();
          const matchesText = keywords.some((word) => text.includes(word));

          return matchesCategory || matchesPrice || matchesText;
        }).slice(0, 6); // Limit to 6 similar items

        setSimilarProducts(suggestions);
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
      <button
        onClick={() => router.back()}
        className="top-[130px] right-2 z-50 px-4 py-2 bg-blue-100 text-blue-700 text-sm  shadow-sm hover:bg-blue-200 transition-all"
      >
        ← Back
      </button>



      <h3 className="mt-4 text-xl  mb-4 text-gray-700">
        Search Results for <span className="font-semibold">  "{query}" </span>
      </h3>

      {products.length === 0 ? (
        <p className="text-gray-500 mb-6">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="bg-white rounded-lg overflow-hidden cursor-pointer"
            >
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
            </Link>
          ))}
        </div>
      )}

      {similarProducts.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            Similar Products You Might Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {similarProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white rounded-lg overflow-hidden cursor-pointer"
              >
                 <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                     className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800">{product.name}</p>
                  <p className="text-blue-700 font-bold text-sm">
                    UGX {product.price?.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}



              // <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
              //   <img
              //     src={imageUrl}
              //     alt={name}
              //     className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              //   />
              // </div>
              // <div className="pt-2">
              //   <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
              //   <p className="text-sm font-semibold text-gray-700 mt-1">
              //     UGX {price?.toLocaleString?.()}
              //   </p>
              // </div>