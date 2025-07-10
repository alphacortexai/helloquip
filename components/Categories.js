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
//     slug: "all-products",
//     imageUrl: "https://cdn-icons-png.flaticon.com/128/7466/7466065.png",
//   };

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "categories"));
//         const fetched = [];
//         querySnapshot.forEach((doc) => {
//           const data = doc.data();
//           if (data.parentId === null) {
//             fetched.push({ id: doc.id, ...data });
//           }
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
//     <div className="ml-1 mr-0 sm:mx-1 md:mx-1">
//       <div className="max-w-7xl py-2">
//         <div className="overflow-x-auto no-scrollbar">
//           <div
//             className="grid grid-flow-col grid-rows-2 auto-cols-[70px] gap-x-4 gap-y-3"
//             style={{ width: "max-content" }}
//           >
//             {categories.map((cat) => (
//               <Link href={`/category/${cat.slug}`} key={cat.id}>
//                 <div
//                   className="cursor-pointer text-center w-[70px]"
//                   onClick={() => handleCategoryClick(cat)}
//                 >
//                   <div
//                     className={`relative w-[60px] h-[60px] bg-gray-100 rounded-[18px] overflow-hidden mx-auto shadow-[0_2px_6px_rgba(0,0,0,0.15)] ${
//                       selectedCategoryId === cat.id
//                         ? "border-2 border-teal-400"
//                         : ""
//                     }`}
//                   >
//                     <img
//                       src={cat.imageUrl}
//                       alt={cat.name}
//                       className="w-full h-full object-contain"
//                       draggable={false}
//                     />
//                   </div>
//                   <p className="mt-1 text-[12px] font-medium text-gray-700 leading-tight line-clamp-2">
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
//     slug: "all-products",
//     imageUrl: "https://cdn-icons-png.flaticon.com/128/7466/7466065.png",
//   };

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const querySnapshot = await getDocs(collection(db, "categories"));
//         const fetched = [];
//         querySnapshot.forEach((doc) => {
//           const data = doc.data();
//           if (data.parentId === null) {
//             fetched.push({ id: doc.id, ...data });
//           }
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
//     <div className="md:flex md:flex-col md:w-56 md:overflow-y-auto md:h-full">
//       {/* Mobile: Horizontal scroll */}
//       <div className="block md:hidden ml-1 mr-0 sm:mx-1 md:mx-1 py-2">
//   <div className="overflow-x-auto no-scrollbar">
//     <div
//       className="grid grid-flow-col grid-rows-2 auto-cols-[70px] gap-x-4 gap-y-3"
//       style={{ width: "max-content" }}
//     >
//       {categories.map((cat) => (
//         <Link href={`/category/${cat.slug}`} key={cat.id}>
//           <div
//             className="cursor-pointer text-center w-[70px]"
//             onClick={() => handleCategoryClick(cat)}
//           >
//             <div
//               className={`w-[60px] h-[60px] bg-gray-100 rounded-[18px] overflow-hidden mx-auto shadow-md ${
//                 selectedCategoryId === cat.id
//                   ? "border-2 border-teal-400"
//                   : ""
//               }`}
//             >
//               <img
//                 src={cat.imageUrl}
//                 alt={cat.name}
//                 className="w-full h-full object-contain"
//                 draggable={false}
//               />
//             </div>
//             <p className="mt-1 text-[12px] font-medium text-gray-700 leading-tight line-clamp-2">
//               {cat.name}
//             </p>
//           </div>
//         </Link>
//       ))}
//     </div>
//   </div>
// </div>


//       {/* Tablet/Desktop: Vertical list */}
//       <div className="hidden md:block py-4 pl-2 pr-1">
//         <div className="flex flex-col gap-4">
//           {categories.map((cat) => (
//             <Link href={`/category/${cat.slug}`} key={cat.id}>
//               <div
//                 className="cursor-pointer flex items-center gap-3"
//                 onClick={() => handleCategoryClick(cat)}
//               >
//                 <div
//                   className={`w-[50px] h-[50px] bg-gray-100 rounded-xl overflow-hidden shadow-md ${
//                     selectedCategoryId === cat.id
//                       ? "border-2 border-teal-400"
//                       : ""
//                   }`}
//                 >
//                   <img
//                     src={cat.imageUrl}
//                     alt={cat.name}
//                     className="w-full h-full object-contain"
//                     draggable={false}
//                   />
//                 </div>
//                 <span className="text-[14px] font-medium text-gray-800 line-clamp-2">
//                   {cat.name}
//                 </span>
//               </div>
//             </Link>
//           ))}
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



function cleanFirebaseUrl(url) {
  if (!url || typeof url !== "string") return "";

  try {
    // Decode twice (handles %252F -> %2F)
    let cleaned = decodeURIComponent(decodeURIComponent(url));

    // Then re-encode once to ensure spaces and other special chars are valid
    const [baseUrl, query] = cleaned.split("?");
    const reEncodedPath = encodeURIComponent(baseUrl.split("/o/")[1]); // only encode the storage path
    return `https://firebasestorage.googleapis.com/v0/b/${baseUrl.split("/b/")[1].split("/")[0]}/o/${reEncodedPath}?${query}`;
  } catch (err) {
    console.warn("Failed to clean Firebase URL:", url);
    return url;
  }
}


export default function Categories({ onCategorySelect }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");

  const allCategory = {
    id: "all",
    name: "All Products",
    slug: "all-products",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/7466/7466065.png",
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "categories"));
        const fetched = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.parentId === null) {
            fetched.push({ id: doc.id, ...data });
          }
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

  // 🔥 Get 90x90 if available, fallback to original
const getImageSrc = (cat) => {
  if (cat.id === "all") return cat.imageUrl;

  if (typeof cat.imageUrl === "string") {
    return cleanFirebaseUrl(cat.imageUrl);
  }

  if (typeof cat.imageUrl === "object" && cat.imageUrl["90x90"]) {
    return cleanFirebaseUrl(cat.imageUrl["90x90"]);
  }

  if (typeof cat.imageUrl === "object" && cat.imageUrl.original) {
    return cleanFirebaseUrl(cat.imageUrl.original);
  }

  return "";
};


  return (
    <div className="md:flex md:flex-col md:w-56 md:overflow-y-auto md:h-full">
      {/* Mobile: Horizontal scroll */}
      <div className="block md:hidden ml-1 mr-0 sm:mx-1 md:mx-1 py-2">
        <div className="overflow-x-auto no-scrollbar">
          <div
            className="grid grid-flow-col grid-rows-2 auto-cols-[70px] gap-x-4 gap-y-3"
            style={{ width: "max-content" }}
          >
            {categories.map((cat) => (
              <Link href={`/category/${cat.slug}`} key={cat.id}>
                <div
                  className="cursor-pointer text-center w-[70px]"
                  onClick={() => handleCategoryClick(cat)}
                >
                  <div
                    className={`w-[60px] h-[60px] bg-gray-100 rounded-[18px] overflow-hidden mx-auto shadow-md ${
                      selectedCategoryId === cat.id
                        ? "border-2 border-teal-400"
                        : ""
                    }`}
                  >
                    <img
                      src={getImageSrc(cat)}
                      alt={cat.name}
                      className="w-full h-full object-contain"
                      draggable={false}
                    />
                  </div>
                  <p className="mt-1 text-[12px] font-medium text-gray-700 leading-tight line-clamp-2">
                    {cat.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tablet/Desktop: Vertical list */}
      <div className="hidden md:block py-4 pl-2 pr-1">
        <div className="flex flex-col gap-4">
          {categories.map((cat) => (
            <Link href={`/category/${cat.slug}`} key={cat.id}>
              <div
                className="cursor-pointer flex items-center gap-3"
                onClick={() => handleCategoryClick(cat)}
              >
                <div
                  className={`w-[50px] h-[50px] bg-gray-100 rounded-xl overflow-hidden shadow-md ${
                    selectedCategoryId === cat.id
                      ? "border-2 border-teal-400"
                      : ""
                  }`}
                >
                  <img
                    src={getImageSrc(cat)}
                    alt={cat.name}
                    className="w-full h-full object-contain"
                    draggable={false}
                  />
                </div>
                <span className="text-[14px] font-medium text-gray-800 line-clamp-2">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
