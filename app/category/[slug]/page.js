"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function CategoryPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  const decodeSlug = (slug) => slug.replace(/-/g, " ").toLowerCase();

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true);

      try {
        if (slug === "all-products") {
          // 🟢 Handle All Products (virtual category)
          setCategoryName("All Products");
          const allSnapshot = await getDocs(collection(db, "products"));
          const allProducts = allSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(allProducts);
        } else {
          // 🔍 Fetch actual categories to resolve slug
          const categorySnapshot = await getDocs(collection(db, "categories"));
          let resolvedName = "";

          categorySnapshot.forEach((doc) => {
            const name = doc.data().name;
            const generatedSlug = name
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "");

            if (generatedSlug === slug) {
              resolvedName = name;
            }
          });

          if (resolvedName) {
            setCategoryName(resolvedName);

            const q = query(
              collection(db, "products"),
              where("category", "==", resolvedName)
            );
            const querySnapshot = await getDocs(q);
            const filteredProducts = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setProducts(filteredProducts);
          } else {
            setCategoryName("Unknown Category");
            setProducts([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setCategoryName("Error");
        setProducts([]);
      }

      setLoading(false);
    };

    fetchProductsByCategory();
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* <button
        onClick={() => router.back()}
        className="text-sm text-blue-600 mb-4 flex items-center"
      >
        ← Back 
      </button> */}

      <button
        onClick={() => router.back()}
        className="mb-4 top-[130px] right-2 z-50 px-4 py-2 bg-blue-100 text-blue-700 text-sm  shadow-sm hover:bg-blue-200 transition-all"
      >
        ← Back
      </button>




      <h2 className="text-2xl font-bold mb-4 text-gray-800">{categoryName}</h2>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(({ id, name, price, imageUrl }) => (
            <Link key={id} href={`/product/${id}`} className="group">
              <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="pt-2">
                <p className="text-sm font-regular text-gray-900 truncate">{name}</p>
                <p className="text-sm font-semibold text-gray-700">
                  UGX {price?.toLocaleString?.()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
