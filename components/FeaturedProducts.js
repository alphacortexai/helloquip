

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FeaturedProducts({ selectedCategory }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q;

        if (selectedCategory && selectedCategory !== "All Products") {
          q = query(
            collection(db, "products"),
            where("category", "==", selectedCategory)
          );
        } else {
          q = collection(db, "products");
        }

        const querySnapshot = await getDocs(q);
        const fetchedProducts = [];
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() });
        });
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [selectedCategory]);

  if (loading) {
    return <p className="text-center py-4">Loading products...</p>;
  }

  if (products.length === 0) {
    return (
      <div>
        <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
          {selectedCategory}
        </div>
        <p className="text-center py-4">No products found.</p>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-3">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
          {selectedCategory}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(({ id, name, description, price, imageUrl }) => (
            <Link
              key={id}
              href={`/product/${id}`}
              className="flex flex-col items-start cursor-pointer group"
            >
              <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="pt-2 w-full">
                <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                <p className="text-sm font-semibold text-gray-700 mt-1">
                  UGX {price?.toLocaleString?.()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
