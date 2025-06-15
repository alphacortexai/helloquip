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

  // return (
  //   <div className="mx-1 sm:mx-1 md:mx-2 ">
  //     <div className="max-w-7xl py-2">

  //     <div className="overflow-x-auto no-scrollbar">
  //       <div
  //         className="inline-grid grid-rows-1 gap-x-3 gap-y-1"
  //         style={{
  //           gridAutoFlow: "column",
  //           gridAutoColumns: "75px", // You can increase this too for larger images
  //         }}
  //       >
  //         {categories.map((cat) => (
  //           <Link href={`/category/${generateSlug(cat.name)}`} key={cat.id}>
  //             <div
  //               className="cursor-pointer text-center max-w-[80px] mx-auto"
  //               onClick={() => handleCategoryClick(cat)}
  //             >

  //               <div
  //                 className={`w-full aspect-square bg-gray-100 rounded-[25px] p-0 overflow-hidden
  //                   ${selectedCategoryId === cat.id ? "border-2 border-teal-400" : ""}
  //                 `}
  //               >
  //                 <img
  //                   src={cat.imageUrl}
  //                   alt={cat.name}
  //                   className="w-full h-full object-contain"
  //                   draggable={false}
  //                 />
  //               </div>

  //               <p className="mt-2 text-[13px] leading-[14px] font-regular text-gray-500">{cat.name}</p>
  //             </div>
  //           </Link>
  //         ))}
  //       </div>
  //     </div>

  //     </div>
  //   </div>
  // );


return (
  <div className="ml-1 mr-0 sm:mx-1 md:mx-1">
    <div className="max-w-7xl py-2">
      {/* Make this flex + center + scroll */}
      {/* <div className="flex overflow-x-auto no-scrollbar gap-x-5"> */}
        <div className="grid grid-cols-4 gap-4">

        {categories.map((cat) => (
          <Link href={`/category/${generateSlug(cat.name)}`} key={cat.id}>
            <div
              className="cursor-pointer text-center max-w-[70px] flex-shrink-0"
              onClick={() => handleCategoryClick(cat)}
            >
              {/* Icon Image */}
              <div
                className={`relative w-[60px] h-[60px] bg-gray-100 rounded-[18px] overflow-hidden mx-auto
                  ${selectedCategoryId === cat.id ? "border-2 border-teal-400" : ""}
                `}
              >
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>

              {/* Text Below */}
              <p className="mt-1 text-[12px] font-medium text-gray-700 leading-tight line-clamp-2">
                {cat.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </div>
);



}



