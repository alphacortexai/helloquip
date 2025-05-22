// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   getDocs,
//   doc,
//   getDoc,
// } from "firebase/firestore";

// export default function TrendingProducts() {
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     const fetchTrendingProducts = async () => {
//       try {
//         const trendingSnapshot = await getDocs(collection(db, "trendingProducts"));
//         const trendingItems = [];

//         for (const docSnap of trendingSnapshot.docs) {
//           const { productId } = docSnap.data();
//           const productRef = doc(db, "products", productId);
//           const productSnap = await getDoc(productRef);

//           if (productSnap.exists()) {
//             const productData = productSnap.data();
//             trendingItems.push({
//               id: productSnap.id,
//               name: productData.name || "Unnamed Product",
//               price: productData.price || 0,
//               imageUrl: productData.imageUrl || "/placeholder.png",
//             });
//           }
//         }

//         setProducts(trendingItems);
//       } catch (error) {
//         console.error("Error loading trending products:", error);
//       }
//     };

//     fetchTrendingProducts();
//   }, []);

//   return (
//     <section className="bg-gray-50 py-12">
//       <div className="max-w-7xl mx-auto px-4">
//         <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
//           Trending Products
//         </h3>

//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//           {products.map(({ id, name, price, imageUrl }) => (
//             <Link
//               key={id}
//               href={`/product/${id}`}
//               className="flex flex-col items-start cursor-pointer"
//             >
//               <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden group">
//                 <img
//                   src={imageUrl}
//                   alt={name}
//                   className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                 />
//               </div>
//               <div className="pt-2 w-full">
//                 <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
//                 <p className="text-xs text-gray-500 mt-0.5 truncate">Top trending now</p>
//                 <p className="text-base font-bold text-blue-800 mt-1">
//                   {typeof price === "number"
//                     ? price.toLocaleString("en-UG", {
//                         style: "currency",
//                         currency: "UGX",
//                       })
//                     : price}
//                 </p>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }














// "use client";

// import { useEffect, useState, useRef } from "react";
// import Link from "next/link";
// import { db } from "@/lib/firebase";
// import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// export default function TrendingProducts() {
//   const [products, setProducts] = useState([]);
//   const DISPLAY_COUNT = 4;

//   // Will hold indexes of products currently visible
//   const [currentIndexes, setCurrentIndexes] = useState([]);
//   const fadeRefs = useRef([]);

//   // Fetch trending products from Firestore
//   useEffect(() => {
//     const fetchTrendingProducts = async () => {
//       try {
//         const trendingSnapshot = await getDocs(collection(db, "trendingProducts"));
//         const trendingItems = [];

//         for (const docSnap of trendingSnapshot.docs) {
//           const { productId } = docSnap.data();
//           const productRef = doc(db, "products", productId);
//           const productSnap = await getDoc(productRef);

//           if (productSnap.exists()) {
//             const productData = productSnap.data();
//             trendingItems.push({
//               id: productSnap.id,
//               name: productData.name || "Unnamed Product",
//               price: productData.price || 0,
//               imageUrl: productData.imageUrl || "/placeholder.png",
//             });
//           }
//         }

//         setProducts(trendingItems);
//       } catch (error) {
//         console.error("Error loading trending products:", error);
//       }
//     };

//     fetchTrendingProducts();
//   }, []);

//   // Initialize currentIndexes only after products are loaded
//   useEffect(() => {
//     if (products.length >= DISPLAY_COUNT) {
//       setCurrentIndexes([0, 1, 2, 3]);
//     }
//   }, [products]);

//   // Every 3 seconds, replace one product in currentIndexes
//   useEffect(() => {
//     if (currentIndexes.length < DISPLAY_COUNT) return; // wait for initialization

//     const interval = setInterval(() => {
//       setCurrentIndexes((prevIndexes) => {
//         // Choose one index to replace
//         const replacePos = Math.floor(Math.random() * DISPLAY_COUNT);

//         // Build a set of indexes currently displayed
//         const currentSet = new Set(prevIndexes);

//         // Find possible candidates not already displayed
//         const candidates = products
//           .map((_, idx) => idx)
//           .filter((idx) => !currentSet.has(idx));

//         if (candidates.length === 0) {
//           // All products displayed, no change
//           return prevIndexes;
//         }

//         // Pick a random candidate to show
//         const newIndex = candidates[Math.floor(Math.random() * candidates.length)];

//         // Create new indexes array with replacement
//         const newIndexes = [...prevIndexes];
//         newIndexes[replacePos] = newIndex;

//         return newIndexes;
//       });
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [currentIndexes, products]);

//   // Map indexes to actual products safely
//   const visibleProducts = currentIndexes
//     .map((idx) => products[idx])
//     .filter(Boolean); // skip undefined just in case

//   return (
//     <section className="bg-gray-50 py-12">
//       <div className="max-w-7xl mx-auto px-4">
//         <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
//           Trending Products
//         </h3>

//         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6">
//           {visibleProducts.map((product, idx) => {
//             const { id, name, price, imageUrl } = product;

//             return (
//               <Link
//                 key={`${id}-${idx}`}
//                 href={`/product/${id}`}
//                 className="flex flex-col items-start cursor-pointer transition-opacity duration-700 ease-in-out opacity-100"
//               >
//                 <div className="relative w-full aspect-square mb-3 rounded-md overflow-hidden bg-gray-200">
//                   <img
//                     src={imageUrl}
//                     alt={name}
//                     className="w-full h-full object-cover rounded-md"
//                   />
//                 </div>
//                 <p className="text-lg text-gray-900 truncate w-full text-left">{name}</p>
//                 <p className="text-xl font-bold text-blue-800 truncate w-full mt-1 text-left">
//                   {typeof price === "number"
//                     ? price.toLocaleString("en-UG", {
//                         style: "currency",
//                         currency: "UGX",
//                       })
//                     : price}
//                 </p>
//               </Link>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }







"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const DISPLAY_COUNT = 2;
  const [currentIndexes, setCurrentIndexes] = useState([]);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const trendingSnapshot = await getDocs(collection(db, "trendingProducts"));
        const trendingItems = [];

        for (const docSnap of trendingSnapshot.docs) {
          const { productId } = docSnap.data();
          const productRef = doc(db, "products", productId);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            const productData = productSnap.data();
            trendingItems.push({
              id: productSnap.id,
              name: productData.name || "Unnamed Product",
              description: productData.description || "No description available.",
              price: productData.price || 0,
              imageUrl: productData.imageUrl || "/placeholder.png",
            });
          }
        }

        setProducts(trendingItems);
      } catch (error) {
        console.error("Error loading trending products:", error);
      }
    };

    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    if (products.length >= DISPLAY_COUNT) {
      setCurrentIndexes([0, 1]);
    }
  }, [products]);

  useEffect(() => {
    if (currentIndexes.length < DISPLAY_COUNT) return;

    const interval = setInterval(() => {
      setCurrentIndexes((prevIndexes) => {
        const replacePos = Math.floor(Math.random() * DISPLAY_COUNT);
        const currentSet = new Set(prevIndexes);
        const candidates = products
          .map((_, idx) => idx)
          .filter((idx) => !currentSet.has(idx));
        if (candidates.length === 0) return prevIndexes;
        const newIndex = candidates[Math.floor(Math.random() * candidates.length)];
        const newIndexes = [...prevIndexes];
        newIndexes[replacePos] = newIndex;
        return newIndexes;
      });
    }, 5000); // 5 seconds now

    return () => clearInterval(interval);
  }, [currentIndexes, products]);

  const visibleProducts = currentIndexes.map((idx) => products[idx]).filter(Boolean);

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center">
          <p className="text-3xl font-medium text-blue-700">Trending Products</p>
          <div className="w-28 h-0.5 bg-blue-600 mt-2"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12 px-4 md:px-14">
          {visibleProducts.map(({ id, name, description, price, imageUrl }) => (
            <Link
              key={id}
              href={`/product/${id}`}
              className="relative group rounded-lg overflow-hidden shadow-lg cursor-pointer"
            >
              {/* Image */}
              <div className="relative w-full aspect-[4/5]">
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  className="object-cover group-hover:brightness-75 transition duration-300"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Overlay Text */}
              <div className="absolute bottom-8 left-8 text-white space-y-2 transform group-hover:-translate-y-4 transition duration-300">
                <h3 className="font-medium text-xl lg:text-2xl">{name}</h3>
                <p className="text-sm lg:text-base leading-5 max-w-xs">
                  {description}
                </p>
                <p className="font-bold text-blue-400">
                  {typeof price === "number"
                    ? price.toLocaleString("en-UG", {
                        style: "currency",
                        currency: "UGX",
                      })
                    : price}
                </p>
                <button className="flex items-center gap-1.5 bg-blue-600 px-4 py-2 rounded">
                  Buy now
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
