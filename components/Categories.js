"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Categories() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const fetched = [];
        querySnapshot.forEach(doc => {
          fetched.push({ id: doc.id, ...doc.data() });
        });
        setCategories(fetched);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div
      id="categories-grid"
      className="max-w-7xl mx-auto px-8 grid grid-cols-3 gap-3 justify-items-center"
    >
      {categories.map(cat => (
        <div
          key={cat.id}
          className="w-full max-w-[160px] cursor-pointer"
          onClick={() => console.log("Clicked category:", cat.name)}
        >
          <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
            <img
              src={cat.imageUrl}
              alt={cat.name}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-2 text-sm font-normal text-gray-700 text-center">
            {cat.name}
          </p>
        </div>
      ))}
    </div>
  );
}
