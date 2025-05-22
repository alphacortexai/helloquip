// "use client";

// import { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// export default function Categories() {
//   const [categories, setCategories] = useState([]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "categories"));
//         const fetched = [];
//         querySnapshot.forEach(doc => {
//           fetched.push({ id: doc.id, ...doc.data() });
//         });
//         setCategories(fetched);
//       } catch (err) {
//         console.error("Error loading categories:", err);
//       }
//     };

//     fetchCategories();
//   }, []);

//   return (
//     <div
//       id="categories-grid"
//       className="max-w-7xl mx-auto px-8 grid grid-cols-3 gap-3 justify-items-center"
//     >
//       {categories.map(cat => (
//         <div
//           key={cat.id}
//           className="w-full max-w-[160px] cursor-pointer"
//           onClick={() => console.log("Clicked category:", cat.name)}
//         >
//           <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
//             <img
//               src={cat.imageUrl}
//               alt={cat.name}
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <p className="mt-2 text-sm font-normal text-gray-700 text-center">
//             {cat.name}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useRef } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const fetched = [];
        querySnapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() });
        });
        setCategories(fetched);
      } catch (err) {
        console.error("Error loading categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const visibleCards = 4;
  const cardSpacing = 12;

  const scroll = (direction) => {
    if (!containerRef.current) return;
    const card = containerRef.current.querySelector("div");
    const cardWidth = card.offsetWidth + cardSpacing;
    containerRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-8 relative py-2">
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Categories</h2>
        <div className="w-12 h-1 bg-blue-500 mx-auto mt-1 rounded-full" />
      </div>

      {/* Arrows (mobile only) */}
      <button
        aria-label="Scroll Left"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow rounded-full p-2 z-10 md:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        aria-label="Scroll Right"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow rounded-full p-2 z-10 md:hidden"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Mobile: Horizontal scroll */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto no-scrollbar space-x-3 scroll-smooth md:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex-shrink-0 w-[calc((100vw-64px)/4)] cursor-pointer scroll-snap-align-start"
            onClick={() => console.log("Clicked category:", cat.name)}
          >
            <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <img
                src={cat.imageUrl}
                alt={cat.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            <p className="mt-2 text-xs font-normal text-gray-700 text-center">
              {cat.name}
            </p>
          </div>
        ))}
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-3 justify-items-center mt-4">
        {categories.map((cat) => (
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
                draggable={false}
              />
            </div>
            <p className="mt-2 text-sm font-normal text-gray-700 text-center">
              {cat.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
