// components/Categories.js
"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
// import { db } from "../firebase"; // adjust path as needed
import { db } from "@/lib/firebase"; // ✅ correct path using alias


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
    <div id="categories-grid" className="grid grid-cols-4 gap-6 justify-items-center">
      {categories.map(cat => (
        <div
          key={cat.id}
          className="text-center cursor-pointer hover:scale-105 transition-transform"
          onClick={() => console.log("Clicked category:", cat.name)}
        >
          <img
            src={cat.imageUrl}
            alt={cat.name}
            className="w-24 h-24 object-cover mx-auto rounded-full mb-2"
          />
          <p className="text-sm font-medium text-gray-700">{cat.name}</p>
        </div>
      ))}
    </div>
  );
}
