// "use client";

// import { useEffect, useState, useRef } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// export default function Categories({ onCategorySelect }) {
//   const [categories, setCategories] = useState([]);
//   const [selectedCategoryId, setSelectedCategoryId] = useState("all");
//   const containerRef = useRef(null);

//   // Manual "All Products" category
//   const allCategory = {
//     id: "all",
//     name: "All Products",
//     imageUrl: "https://cdn-icons-png.flaticon.com/128/7466/7466065.png",
//   };


//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "categories"));
//         const fetched = [];
//         querySnapshot.forEach((doc) => {
//           fetched.push({ id: doc.id, ...doc.data() });
//         });
//         setCategories([allCategory, ...fetched]); // Add "All Products" first
//       } catch (err) {
//         console.error("Error loading categories:", err);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const cardSpacing = 12; // spacing between cards (in pixels)

//   const scroll = (direction) => {
//     if (!containerRef.current || categories.length === 0) return;

//     const currentIndex = categories.findIndex(cat => cat.id === selectedCategoryId);
//     let newIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

//     // Clamp index within range
//     if (newIndex < 0) newIndex = 0;
//     if (newIndex >= categories.length) newIndex = categories.length - 1;

//     const newCategory = categories[newIndex];
//     setSelectedCategoryId(newCategory.id);
//     if (onCategorySelect) onCategorySelect(newCategory.name);

//     const card = containerRef.current.querySelector("div");
//     const cardWidth = card.offsetWidth + cardSpacing;

//     containerRef.current.scrollBy({
//       left: direction === "left" ? -cardWidth : cardWidth,
//       behavior: "smooth",
//     });
//   };

//   const handleCategoryClick = (cat) => {
//     setSelectedCategoryId(cat.id);
//     if (onCategorySelect) onCategorySelect(cat.name);
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-4 relative py-2">
//       <div className="w-full bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
//         Browse Categories
//       </div>

//       {/* Arrows - visible only on mobile */}
//       <button
//         aria-label="Scroll Left"
//         onClick={() => scroll("left")}
//         className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow rounded-full p-2 z-10 md:hidden"
//       >
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//           <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
//         </svg>
//       </button>

//       <button
//         aria-label="Scroll Right"
//         onClick={() => scroll("right")}
//         className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow rounded-full p-2 z-10 md:hidden"
//       >
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//           <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//         </svg>
//       </button>

//       {/* Mobile View - Horizontal Scrollable Categories */}
//       <div
//         ref={containerRef}
//         className="flex overflow-x-auto no-scrollbar space-x-3 scroll-smooth md:hidden"
//         style={{ scrollSnapType: "x mandatory" }}
//       >
//         {categories.map((cat) => (
//           <div
//             key={cat.id}
//             className={`flex-shrink-0 w-[calc((100vw-64px)/4)] cursor-pointer scroll-snap-align-start
//               ${selectedCategoryId === cat.id ? "border border-teal-400 rounded-xl" : ""}
//             `}
//             onClick={() => handleCategoryClick(cat)}
//           >
//             <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
//               <img
//                 src={cat.imageUrl}
//                 alt={cat.name}
//                 className="w-full h-full object-cover"
//                 draggable={false}
//               />
//             </div>
//             <p className="mt-2 text-xs font-normal text-gray-700 text-center">{cat.name}</p>
//           </div>
//         ))}
//       </div>

//       {/* Desktop View - Grid Layout */}
//       <div className="hidden md:grid md:grid-cols-3 gap-3 justify-items-center mt-4">
//         {categories.map((cat) => (
//           <div
//             key={cat.id}
//             className={`w-full max-w-[160px] cursor-pointer
//               ${selectedCategoryId === cat.id ? "border border-teal-400 rounded-xl" : ""}
//             `}
//             onClick={() => handleCategoryClick(cat)}
//           >
//             <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden">
//               <img
//                 src={cat.imageUrl}
//                 alt={cat.name}
//                 className="w-full h-full object-cover"
//                 draggable={false}
//               />
//             </div>
//             <p className="mt-2 text-sm font-normal text-gray-700 text-center">{cat.name}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }



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
