// "use client";

// import { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import Link from "next/link";

// export default function Categories({ onCategorySelect }) {
//   const [categories, setCategories] = useState([]);
//   const [selectedCategoryId, setSelectedCategoryId] = useState("all");

//   const allCategory = {
//     id: "all",
//     name: "All Products",
//     imageUrl: "https://cdn-icons-png.flaticon.com/128/7466/7466065.png",
//   };

//   const generateSlug = (name) =>
//   name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");


//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "categories"));
//         const fetched = [];
//         querySnapshot.forEach((doc) => {
//           fetched.push({ id: doc.id, ...doc.data() });
//         });
//         setCategories([allCategory, ...fetched]);
//       } catch (err) {
//         console.error("Error loading categories:", err);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const handleCategoryClick = (cat) => {
//     setSelectedCategoryId(cat.id);
//     if (onCategorySelect) onCategorySelect(cat.name);
//   };

//   return (
//     <div className="mx-4 sm:mx-8 md:mx-16">
//       <div className="max-w-7xl mx-auto px-4 py-2">
//         {/* Grid layout with smaller cards */}
//         <div className="grid grid-cols-4 gap-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4">

//           {categories.map((cat) => (
            
//               <Link href={`/category/${generateSlug(cat.name)}`} key={cat.id}>

//                   <div
//                     className="cursor-pointer text-center max-w-[80px] mx-auto"
//                     onClick={() => handleCategoryClick(cat)}
//                   >
//                   <div
//                     className={`w-full aspect-square bg-gray-100 rounded-lg p-2 overflow-hidden
//                       ${selectedCategoryId === cat.id ? "border-2 border-teal-400" : ""}
//                     `}
//                   >
//                   <img
//                     src={cat.imageUrl}
//                     alt={cat.name}
//                     className="w-full h-full object-cover object-contain"
//                     draggable={false}
//                   />
//                 </div>
//                 <p className="mt-2 text-xs font-regular text-gray-500">{cat.name}</p>
//               </div>
//             </Link>
//           ))}

//         </div>
//       </div>
//     </div>

//   );
// }




// "use client";

// import { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import Link from "next/link";

// export default function Categories({ onCategorySelect }) {
//   const [categories, setCategories] = useState([]);
//   const [selectedCategoryId, setSelectedCategoryId] = useState("all");

//   const allCategory = {
//     id: "all",
//     name: "All Products",
//     imageUrl: "https://cdn-icons-png.flaticon.com/128/7466/7466065.png",
//   };

//   const generateSlug = (name) =>
//     name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "categories"));
//         const fetched = [];
//         querySnapshot.forEach((doc) => {
//           fetched.push({ id: doc.id, ...doc.data() });
//         });
//         setCategories([allCategory, ...fetched]);
//       } catch (err) {
//         console.error("Error loading categories:", err);
//       }
//     };

//     fetchCategories();
//   }, []);

//   const handleCategoryClick = (cat) => {
//     setSelectedCategoryId(cat.id);
//     if (onCategorySelect) onCategorySelect(cat.name);
//   };

//   return (
//     <div className="mx-2 sm:mx-2 md:mx-6">
//       <div className="max-w-7xl mx-auto px-4 py-2">
//         {/* Horizontally scrollable 2-row grid */}
//         <div className="overflow-x-auto">
//           <div
//             className="grid grid-rows-2 gap-x-3 gap-y-3"
//             style={{
//               gridAutoFlow: "column",
//               gridAutoColumns: "75px",
//               minWidth: `${(75 + 12) * categories.length}px`,
//             }}
//           >
//             {categories.map((cat) => (
//               <Link href={`/category/${generateSlug(cat.name)}`} key={cat.id}>
//                 <div
//                   className="cursor-pointer text-center max-w-[70px] mx-auto"
//                   onClick={() => handleCategoryClick(cat)}
//                 >
//                   <div
//                     className={`w-full aspect-square bg-gray-100 rounded-lg p-2 overflow-hidden ${
//                       selectedCategoryId === cat.id ? "border-2 border-teal-400" : ""
//                     }`}
//                   >
//                     <img
//                       src={cat.imageUrl}
//                       alt={cat.name}
//                       className="w-full h-full"
//                       draggable={false}
//                     />
//                   </div>
//                   <p className="mt-1 text-[10px] font-regular text-gray-500 truncate">
//                     {cat.name}
//                   </p>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }






"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";

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
    <div className="mx-2 sm:mx-2 md:mx-6">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="overflow-x-auto">
          <div
            className="grid grid-rows-2 gap-x-3 gap-y-3"
            style={{
              gridAutoFlow: "column",
              gridAutoColumns: "75px",
              minWidth: `${(75 + 12) * categories.length}px`,
            }}
          >
            {categories.map((cat) => (
              <Link href={`/category/${generateSlug(cat.name)}`} key={cat.id}>
                <div
                  className="cursor-pointer text-center max-w-[70px] mx-auto"
                  onClick={() => handleCategoryClick(cat)}
                >
                  <div
                    className={`w-full aspect-square bg-gray-100 rounded-lg p-2 overflow-hidden ${
                      selectedCategoryId === cat.id
                        ? "border-2 border-teal-400"
                        : ""
                    }`}
                  >
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      width={100}
                      height={100}
                      quality={30}
                      className="w-full h-full object-contain"
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <p className="mt-1 text-[10px] font-regular text-gray-500 truncate">
                    {cat.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
