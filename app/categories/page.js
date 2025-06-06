"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const allCategory = {
    id: "all",
    name: "All Products",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/7466/7466065.png",
  };

  const generateSlug = (name) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  useEffect(() => {
    const fetchCategoriesAndCounts = async () => {
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        const fetchedCategories = [];
        catSnap.forEach((doc) => {
          fetchedCategories.push({ id: doc.id, ...doc.data() });
        });

        const prodSnap = await getDocs(collection(db, "products"));
        const counts = {};

        prodSnap.forEach((doc) => {
          const data = doc.data();
          const catName = data.category || "Uncategorized";
          counts[catName] = (counts[catName] || 0) + 1;
        });

        setCategories([allCategory, ...fetchedCategories]);
        setProductCounts(counts);
      } catch (error) {
        console.error("Error fetching categories or products:", error);
      }
    };

    fetchCategoriesAndCounts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">Categories</h1>

      <div className="grid grid-cols-3 gap-x-4 gap-y-3">
        {categories.map((cat) => {
          const count =
            cat.id === "all"
              ? Object.values(productCounts).reduce((a, b) => a + b, 0)
              : productCounts[cat.name] || 0;
          return (
            <Link
              key={cat.id}
              href={`/category/${generateSlug(cat.name)}`}
              className="cursor-pointer text-center max-w-[90px] mx-auto p-1.5 bg-white rounded-md"
            >
              <div className="w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-1">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
              <p className="text-xs font-medium text-gray-700 truncate">{cat.name}</p>
              <p className="text-[10px] text-gray-500">{count} items</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}


