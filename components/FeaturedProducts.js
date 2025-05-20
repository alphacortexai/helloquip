// // components/FeaturedProducts.js
// "use client";
// import ProductCard from './ProductCard';

// const featuredProducts = [
//   {
//     id: 0,
//     name: "Patient Trolley",
//     price: "UGX 500,000",
//     imageUrl: "/patienttrolley.png",
//     description: "Strong and adjustable trolley for patient transportation.",
//   },
//   {
//     id: 1,
//     name: "Autoscope",
//     price: "UGX 120,000",
//     imageUrl: "/autoscope.png",
//     description: "Compact and precise autoscope for ear and throat exams.",
//   },
//   {
//     id: 2,
//     name: "Oxygen Cylinders",
//     price: "UGX 300,000",
//     imageUrl: "/oxygencylinders.png",
//     description: "Reliable oxygen storage for emergency and regular care.",
//   },
//   {
//     id: 3,
//     name: "Wheelchair",
//     price: "UGX 450,000",
//     imageUrl: "/wheelchair.png",
//     description: "Comfortable and lightweight wheelchair for mobility.",
//   },
//   {
//     id: 4,
//     name: "Walking Frame",
//     price: "UGX 150,000",
//     imageUrl: "/walkingframe.png",
//     description: "Supportive walking frame to aid patient mobility.",
//   },
//   {
//     id: 5,
//     name: "Oxygen Concentrator",
//     price: "UGX 320,000",
//     imageUrl: "/oxygenconcentrator.png",
//     description: "Concentrates oxygen for continuous supply to patients.",
//   },
//   {
//     id: 6,
//     name: "Epoxy Coated Hospital Bed",
//     price: "UGX 1,000,000",
//     imageUrl: "/hospitalbed.png",
//     description: "Durable hospital bed with epoxy coating and adjustments.",
//   },
//   {
//     id: 7,
//     name: "Anesthesia Machine",
//     price: "UGX 1,500,000",
//     imageUrl: "/anesthesiamachine.png",
//     description: "Advanced anesthesia delivery system for operating rooms.",
//   },
//   {
//     id: 8,
//     name: "CBC Machine",
//     price: "UGX 1,200,000",
//     imageUrl: "/cbcmachine.png",
//     description: "Complete blood count testing machine for labs.",
//   },
//   {
//     id: 9,
//     name: "Double Crank ABS Bed with Drip",
//     price: "UGX 850,000",
//     imageUrl: "/hospitalbed.png",
//     description: "Adjustable double crank hospital bed with drip holder.",
//   },
// ];

// export default function FeaturedProducts({ onProductClick }) {
//   return (
//     <section className="bg-gray-50 py-12">
//       <div className="max-w-7xl mx-auto px-4">
//         <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Featured Products</h3>

//         <div className="grid grid-cols-2 gap-3">
//           {featuredProducts.map(({ id, name, price, imageUrl }) => (
//             <div
//               key={id}
//               className="bg-white border-2 border-teal-100 rounded-lg overflow-hidden cursor-pointer"
//               onClick={() => onProductClick(id)}
//             >
//               <div className="relative w-full h-48">
//                 <img src={imageUrl} alt={name} className="w-full h-full object-cover rounded-t-lg" />
//               </div>
//               <div className="p-3 text-center">
//                 <p className="text-sm font-medium text-blue-700">{price}</p>
//                 <p className="text-xs text-gray-800 mt-1">{name}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";

export default function FeaturedProducts({ onProductClick }) {
  const [products, setProducts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const PRODUCTS_PER_PAGE = 6;

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      let productQuery = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        limit(PRODUCTS_PER_PAGE)
      );

      if (lastDoc) {
        productQuery = query(
          collection(db, "products"),
          orderBy("createdAt", "desc"),
          startAfter(lastDoc),
          limit(PRODUCTS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(productQuery);
      const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setProducts(prev => [...prev, ...fetchedProducts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

      if (snapshot.docs.length < PRODUCTS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }

    setLoading(false);
  };

  return (
    <section className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Featured Products</h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {products.map(({ id, name, price, imageUrl }) => (
            <div
              key={id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer shadow-sm"
              onClick={() => onProductClick?.(id)}
            >
              <div className="relative w-full h-48">
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 text-center">
                <p className="text-sm font-medium text-blue-700">UGX {price?.toLocaleString?.()}</p>
                <p className="text-xs text-gray-800 mt-1">{name}</p>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={fetchProducts}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
