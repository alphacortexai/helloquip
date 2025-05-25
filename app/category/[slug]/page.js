// // app/category/[categoryName]/page.js
// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import Link from "next/link";

// export default function CategoryPage({ params }) {
//   const categoryName = decodeURIComponent(params.categoryName);
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     const fetchCategoryProducts = async () => {
//       const q = query(
//         collection(db, "products"),
//         where("category", "==", categoryName)
//       );
//       const snapshot = await getDocs(q);
//       const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setProducts(fetched);
//     };

//     fetchCategoryProducts();
//   }, [categoryName]);

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-4">
//       <button onClick={() => history.back()} className="mb-4 text-blue-500">← Back</button>
//       <h2 className="text-xl font-semibold mb-4">{categoryName}</h2>
      
//       {products.length === 0 ? (
//         <p>No products found in this category.</p>
//       ) : (
//         <div className="grid grid-cols-2 gap-4">
//           {products.map((product) => (
//             <Link key={product.id} href={`/product/${product.id}`}>
//               <div className="bg-white rounded-xl overflow-hidden shadow-sm">
//                 <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
//                 <div className="p-2">
//                   <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
//                   <p className="text-sm font-semibold text-blue-600">UGX {product.price?.toLocaleString?.()}</p>
//                 </div>
//               </div>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }














// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import Link from "next/link";

// export default function CategoryPage() {
//   const { categoryName } = useParams();
//   const router = useRouter();
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCategoryProducts = async () => {
//       setLoading(true);
//       try {
//         const q = query(
//           collection(db, "products"),
//           where("category", "==", categoryName)
//         );
//         const querySnapshot = await getDocs(q);
//         const categoryProducts = [];
//         querySnapshot.forEach((doc) => {
//           categoryProducts.push({ id: doc.id, ...doc.data() });
//         });
//         setProducts(categoryProducts);
//       } catch (err) {
//         console.error("Error fetching category products:", err);
//         setProducts([]);
//       }
//       setLoading(false);
//     };

//     fetchCategoryProducts();
//   }, [categoryName]);

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-4">
//       {/* Back button */}
//       <button onClick={() => router.back()} className="text-sm text-blue-600 mb-4 flex items-center">
//         ← Back
//       </button>

//       <h2 className="text-2xl font-bold mb-4 text-gray-800">{categoryName}</h2>

//       {loading ? (
//         <p>Loading...</p>
//       ) : products.length === 0 ? (
//         <p>No products found in this category.</p>
//       ) : (
//         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {products.map(({ id, name, price, imageUrl }) => (
//             <Link key={id} href={`/product/${id}`} className="group">
//               <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
//                 <img
//                   src={imageUrl}
//                   alt={name}
//                   className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                 />
//               </div>
//               <div className="pt-2">
//                 <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
//                 <p className="text-sm font-semibold text-gray-700 mt-1">
//                   UGX {price?.toLocaleString?.()}
//                 </p>
//               </div>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function CategoryPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  // Slug decoder helper (must match your slug creation logic)
  const decodeSlug = (slug) => slug.replace(/-/g, " ");

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      setLoading(true);

      try {
        // 1. Fetch all categories
        const categorySnapshot = await getDocs(collection(db, "categories"));
        let actualCategoryName = "";

        categorySnapshot.forEach((doc) => {
          const name = doc.data().name;
          const generatedSlug = name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");

          if (generatedSlug === slug) {
            actualCategoryName = name;
          }
        });

        // If not found, treat it as "All Products"
        if (slug === "all") {
          setCategoryName("All Products");

          const allSnapshot = await getDocs(collection(db, "products"));
          const allProducts = allSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(allProducts);
        } else if (actualCategoryName) {
          setCategoryName(actualCategoryName);

          const q = query(
            collection(db, "products"),
            where("category", "==", actualCategoryName)
          );
          const querySnapshot = await getDocs(q);
          const categoryProducts = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(categoryProducts);
        } else {
          setProducts([]);
          setCategoryName("Unknown Category");
        }
      } catch (err) {
        console.error("Error fetching category products:", err);
        setProducts([]);
        setCategoryName("Error");
      }

      setLoading(false);
    };

    fetchCategoryProducts();
  }, [slug]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <button onClick={() => router.back()} className="text-sm text-blue-600 mb-4 flex items-center">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">{categoryName}</h2>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found in this category.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(({ id, name, price, imageUrl }) => (
            <Link key={id} href={`/product/${id}`} className="group">
              <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="pt-2">
                <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                <p className="text-sm font-semibold text-gray-700 mt-1">
                  UGX {price?.toLocaleString?.()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
