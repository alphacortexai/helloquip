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
    className="inline-grid grid-rows-2 gap-x-3 gap-y-3"
    style={{
      gridAutoFlow: "column",
      gridAutoColumns: "75px", // You can increase this too for larger images
    }}
  >
    {categories.map((cat) => (
      <Link href={`/category/${generateSlug(cat.name)}`} key={cat.id}>
        <div
          className="cursor-pointer text-center max-w-[80px] mx-auto"
          onClick={() => handleCategoryClick(cat)}
        >
          <div
            className={`w-full aspect-square bg-gray-100 rounded-lg p-2 overflow-hidden
              ${selectedCategoryId === cat.id ? "border-2 border-teal-400" : ""}
            `}
          >
            <img
              src={cat.imageUrl}
              alt={cat.name}
              className="w-full h-full object-cover object-contain"
              draggable={false}
            />
          </div>
          <p className="mt-2 text-xs font-regular text-gray-500">{cat.name}</p>
        </div>
      </Link>
    ))}
  </div>
</div>




      </div>
    </div>
  );
}




// "use client";

// import { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import Link from "next/link";
// import Image from "next/image";
// import { ChevronLeft, ChevronRight } from "lucide-react"; // or use any icon

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




// {/* <div className="overflow-x-auto">
//   <div
//     className="grid grid-rows-2 gap-x-4 gap-y-4"
//     style={{
//       gridAutoFlow: "column",
//       gridAutoColumns: "minmax(90px, 1fr)", // Slightly wider for better visibility
//       width: "max-content",
//     }}
//   >
//     {categories.map((cat) => (
//       <Link href={`/category/${generateSlug(cat.name)}`} key={cat.id}>
//         <div
//           className="cursor-pointer text-center w-[90px]"
//           onClick={() => handleCategoryClick(cat)}
//         >
//           <div
//             className={`bg-white p-2 rounded-full border border-gray-200 shadow-sm w-20 h-20 mx-auto flex items-center justify-center overflow-hidden
//               ${selectedCategoryId === cat.id ? "border-teal-400 ring-2 ring-teal-300" : ""}
//             `}
//           >
//             <img
//               src={cat.imageUrl}
//               alt={cat.name}
//               className="w-full h-full object-contain"
//               draggable={false}
//             />
//           </div>
//           <p className="mt-2 text-[12px] text-gray-700 font-medium line-clamp-2">
//             {cat.name}
//           </p>
//         </div>
//       </Link>
//     ))}
//   </div>
// </div> */}


// <div className="overflow-x-auto">
//   <div
//     className="grid grid-rows-2 gap-x-2 gap-y-3"
//     style={{
//       gridAutoFlow: "column",
//       gridAutoColumns: "110px", // width per column (adjusted for better spacing)
//       width: "calc(4 * (110px + 0.5rem))", // 4 columns width + gaps (0.5rem = 8px gap-x-2)
//     }}
//   >
//     {categories.map((cat) => (
//       <Link href={`/category/${generateSlug(cat.name)}`} key={cat.id}>
//         <div
//           className="cursor-pointer text-center w-[110px]"
//           onClick={() => handleCategoryClick(cat)}
//         >
//           <div
//             className={`bg-white p-2 rounded-xl border border-gray-200 shadow-sm w-24 h-24 mx-auto flex items-center justify-center overflow-hidden
//               ${selectedCategoryId === cat.id ? "border-teal-400 ring-2 ring-teal-300" : ""}
//             `}
//           >
//             <img
//               src={cat.imageUrl}
//               alt={cat.name}
//               className="w-full h-full object-contain"
//               draggable={false}
//             />
//           </div>
//           <p className="mt-2 text-[12px] text-gray-700 font-medium line-clamp-2">
//             {cat.name}
//           </p>
//         </div>
//       </Link>
//     ))}
//   </div>
// </div>








//       </div>
//     </div>
//   );
// }
