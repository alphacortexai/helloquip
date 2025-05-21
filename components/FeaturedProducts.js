"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";

export default function FeaturedProducts({ onProductClick }) {
  const [products, setProducts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PRODUCTS_PER_PAGE = 6;

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      // Check if near bottom of the page (300px offset)
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loading &&
        hasMore
      ) {
        fetchProducts();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, lastDoc]);

  const fetchProducts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      let productQuery = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        limit(PRODUCTS_PER_PAGE)
      );

      if (lastDoc) {
        productQuery = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(PRODUCTS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(productQuery);
      const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setProducts(prev => [...prev, ...fetchedProducts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

      if (snapshot.docs.length < PRODUCTS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }

    setLoading(false);
  };

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Featured Products</h3>

        <div className="grid grid-cols-2 gap-4">
          {products.map(({ id, name, price, imageUrl }) => (
            <div
              key={id}
              className="bg-white rounded-lg overflow-hidden cursor-pointer"
              onClick={() => onProductClick?.(id)}
            >
              <div className="relative w-full h-48">
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4 text-left">
                <p className="text-sm text-gray-900 mt-2">{name}</p>
                <p className="text-base font-bold text-blue-800">UGX {price?.toLocaleString?.()}</p>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center mt-6 text-gray-600">Loading more products...</div>
        )}
      </div>
    </section>
  );
}
