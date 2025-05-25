// 'use client';

// import { useEffect, useState } from "react";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import Link from "next/link";

// export default function CategoriesPage() {
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // This category for "All Products"
//   const allCategory = {
//     id: "all",
//     name: "All Products",
//     imageUrl: "https://cdn-icons-png.flaticon.com/128/7466/7466065.png",
//     productCount: 0,
//   };

//   // Helper: slug generator for URLs
//   const generateSlug = (name) =>
//     name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

//   useEffect(() => {
//     const fetchCategoriesWithCounts = async () => {
//       setLoading(true);

//       try {
//         // 1. Fetch all categories
//         const categoriesSnapshot = await getDocs(collection(db, "categories"));
//         const fetchedCategories = [];
        
//         // 2. Fetch all products count (for All Products count)
//         const productsSnapshot = await getDocs(collection(db, "products"));
//         const totalProductsCount = productsSnapshot.size;

//         // 3. For each category, fetch number of products belonging to it
//         for (const doc of categoriesSnapshot.docs) {
//           const catData = doc.data();
//           const catName = catData.name;

//           // Query to count products in this category
//           const productsInCatQuery = query(
//             collection(db, "products"),
//             where("category", "==", catName)
//           );
//           const productsInCatSnapshot = await getDocs(productsInCatQuery);
//           const productCount = productsInCatSnapshot.size;

//           fetchedCategories.push({
//             id: doc.id,
//             name: catName,
//             imageUrl: catData.imageUrl || "https://cdn-icons-png.flaticon.com/128/616/616408.png",
//             productCount,
//           });
//         }

//         setCategories([ {...allCategory, productCount: totalProductsCount }, ...fetchedCategories]);
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//       }

//       setLoading(false);
//     };

//     fetchCategoriesWithCounts();
//   }, []);

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-6">
//       <h1 className="text-2xl font-bold mb-6 text-gray-800">Categories</h1>

//       {loading ? (
//         <p>Loading categories...</p>
//       ) : categories.length === 0 ? (
//         <p>No categories found.</p>
//       ) : (
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
//           {categories.map(({ id, name, imageUrl, productCount }) => (
//             <Link
//               key={id}
//               href={`/category/${generateSlug(name)}`}
//               className="cursor-pointer text-center border rounded-xl p-4 hover:shadow-lg transition"
//             >
//               <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2">
//                 <img
//                   src={imageUrl}
//                   alt={name}
//                   className="w-full h-full object-cover"
//                   draggable={false}
//                 />
//               </div>
//               <p className="text-sm font-semibold text-gray-900">{name}</p>
//               <p className="text-xs text-gray-600">{productCount} items</p>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [productCounts, setProductCounts] = useState({});
  const allCategory = {
    id: "all",
    name: "All Products",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/7466/7466065.png",
  };

  const generateSlug = (name) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  useEffect(() => {
    const fetchCategoriesAndCounts = async () => {
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        const fetchedCategories = [];
        catSnap.forEach((doc) => {
          fetchedCategories.push({ id: doc.id, ...doc.data() });
        });

        const prodSnap = await getDocs(collection(db, "products"));
        const counts = {};

        prodSnap.forEach((doc) => {
          const data = doc.data();
          const catName = data.category || "Uncategorized";
          counts[catName] = (counts[catName] || 0) + 1;
        });

        setCategories([allCategory, ...fetchedCategories]);
        setProductCounts(counts);
      } catch (error) {
        console.error("Error fetching categories or products:", error);
      }
    };

    fetchCategoriesAndCounts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">Categories</h1>

      <div className="grid grid-cols-3 gap-x-4 gap-y-3">
        {categories.map((cat) => {
          const count =
            cat.id === "all"
              ? Object.values(productCounts).reduce((a, b) => a + b, 0)
              : productCounts[cat.name] || 0;
          return (
            <Link
              key={cat.id}
              href={`/category/${generateSlug(cat.name)}`}
              className="cursor-pointer text-center max-w-[110px] mx-auto p-2 bg-white rounded-lg"
            >
              <div className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden mb-1">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              <p className="text-sm font-medium text-gray-700 truncate">{cat.name}</p>
              <p className="text-xs text-gray-500">{count} items</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
