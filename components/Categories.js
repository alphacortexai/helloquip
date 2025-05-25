"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function Categories({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  const allCategory = {
    id: "all",
    name: "All Products",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/7466/7466065.png",
  };

  const generateSlug = (name) =>
  name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const fetched = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() });
        });
        setCategories([allCategory, ...fetched]);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (cat) => {
    setSelectedCategoryId(cat.id);
    if (onCategorySelect) onCategorySelect(cat.name);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-2">
      {/* <div className="w-full bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
        Browse Categories
      </div> */}

      {/* Grid layout with smaller cards */}
      <div className="grid grid-cols-4 gap-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4">

      {categories.map((cat) => (
        
        // <Link href={`/category/${encodeURIComponent(cat.name)}`} key={cat.id}>
          <Link href={`/category/${generateSlug(cat.name)}`} key={cat.id}>


          <div
            className={`cursor-pointer text-center max-w-[100px] mx-auto
              ${selectedCategoryId === cat.id ? "border border-teal-400 rounded-xl" : ""}
            `}
            onClick={() => setSelectedCategoryId(cat.id)}
          >
            <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-gray-700">{cat.name}</p>
          </div>
        </Link>
      ))}




        {/* {categories.map((cat) => (
          <div
            key={cat.id}
            className={`cursor-pointer text-center max-w-[100px] mx-auto
              ${selectedCategoryId === cat.id ? "border border-teal-400 rounded-xl" : ""}
            `}
            onClick={() => handleCategoryClick(cat)}
          >
            <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            <p className="mt-2 text-xs font-medium text-gray-700">{cat.name}</p>
          </div>
        ))} */}
      </div>
    </div>
  );
}
