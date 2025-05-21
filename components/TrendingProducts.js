

// "use client";

// import { useEffect, useState } from "react";
// // import { db } from "@/firebase"; // Adjust path based on your setup
// import { db } from "@/lib/firebase"; // ✅ correct path using alias
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
//               name: productData.name,
//               price: productData.price,
//               imageUrl: productData.imageUrl,
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
//       <div className="max-w-7xl mx-auto px-8">
//         <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">Trending Products</h3>

//         <div className="grid grid-cols-2 gap-4">
//           {products.map(({ id, name, price, imageUrl }) => (
//             <div key={id} className="bg-white rounded-lg overflow-hidden p-3 flex flex-col items-center">
//               <img src={imageUrl} alt={name} className="w-full aspect-square object-cover rounded-md mb-1" />
//               <p className="text-xs text-gray-800 text-center truncate w-full">{name}</p>
//               <p className="text-sm font-medium text-blue-700 text-center truncate w-full mt-0.5">
//                 {price.toLocaleString("en-UG", { style: "currency", currency: "UGX" })}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }




























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
//       <div className="max-w-7xl mx-auto px-8">
//         <h3 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
//           Trending Products
//         </h3>

//         <div className="grid grid-cols-2 gap-4">
//           {products.map(({ id, name, price, imageUrl }) => (
//             <Link key={id} href={`/product/${id}`}>
//               <div className="bg-white rounded-lg overflow-hidden p-4 cursor-pointer hover:shadow-md transition flex flex-col">
//                 <img
//                   src={imageUrl}
//                   alt={name}
//                   className="w-full aspect-square object-cover rounded-md mb-3"
//                 />
//                 <p className="text-base text-gray-900 truncate w-full text-left">{name}</p>
//                 <p className="text-lg font-bold text-blue-800 truncate w-full mt-1 text-left">
//                   {typeof price === "number"
//                     ? price.toLocaleString("en-UG", { style: "currency", currency: "UGX" })
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



























"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);

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

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Trending Products
        </h3>

       <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {products.map(({ id, name, price, imageUrl }) => (
            <Link key={id} href={`/product/${id}`}>
              <div className="bg-white rounded-lg overflow-hidden cursor-pointer p-4 flex flex-col">
                <div className="relative w-full h-48 mb-3">
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <p className="text-lg text-gray-900 truncate w-full text-left">{name}</p>
                <p className="text-xl font-bold text-blue-800 truncate w-full mt-1 text-left">
                  {typeof price === "number"
                    ? price.toLocaleString("en-UG", { style: "currency", currency: "UGX" })
                    : price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
