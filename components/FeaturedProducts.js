// "use client";

// import { useEffect, useState } from "react";
// import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// export default function FeaturedProducts({ onProductClick }) {
//   const [products, setProducts] = useState([]);
//   const [lastDoc, setLastDoc] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);

//   const PRODUCTS_PER_PAGE = 6;

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (
//         window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
//         !loading &&
//         hasMore
//       ) {
//         fetchProducts();
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [loading, hasMore, lastDoc]);

//   const fetchProducts = async () => {
//     if (loading || !hasMore) return;

//     setLoading(true);
//     try {
//       let productQuery = query(
//         collection(db, "products"),
//         orderBy("createdAt", "desc"),
//         limit(PRODUCTS_PER_PAGE)
//       );

//       if (lastDoc) {
//         productQuery = query(
//           collection(db, "products"),
//           orderBy("createdAt", "desc"),
//           startAfter(lastDoc),
//           limit(PRODUCTS_PER_PAGE)
//         );
//       }

//       const snapshot = await getDocs(productQuery);
//       const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//       setProducts(prev => [...prev, ...fetchedProducts]);
//       setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

//       if (snapshot.docs.length < PRODUCTS_PER_PAGE) {
//         setHasMore(false);
//       }
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }

//     setLoading(false);
//   };

//   return (
//     <section className="bg-gray-50 py-3">
//       <div className="max-w-7xl mx-auto px-4">
//       {/* Title */}
//       <div className="text-center mb-6">
//         <h2 className="text-lg font-semibold text-gray-800">Featured</h2>
//         <div className="w-12 h-1 bg-blue-500 mx-auto mt-1 rounded-full" />
//       </div>

//         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {products.map(({ id, name, description, price, imageUrl }) => (
//             <div
//               key={id}
//               onClick={() => onProductClick?.(id)}
//               className="flex flex-col items-start cursor-pointer"
//             >
//               <div className="relative w-full h-60 bg-gray-100 rounded-xl overflow-hidden group">
//                 <img
//                   src={imageUrl}
//                   alt={name}
//                   className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                 />
//               </div>
//               <div className="pt-2 w-full">
//                 <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
//                 <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p>
//                 <p className="text-base font-bold text-blue-800 mt-1">
//                   UGX {price?.toLocaleString?.()}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {loading && (
//           <div className="flex justify-center mt-6 text-gray-600">
//             Loading more products...
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }













// "use client";

// import { useEffect, useState } from "react";
// import { collection, getDocs, query, orderBy, limit, startAfter } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// export default function FeaturedProducts({ onProductClick }) {
//   const [products, setProducts] = useState([]);
//   const [lastDoc, setLastDoc] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [hasMore, setHasMore] = useState(true);

//   const PRODUCTS_PER_PAGE = 6;

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => {
//       if (
//         window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
//         !loading &&
//         hasMore
//       ) {
//         fetchProducts();
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, [loading, hasMore, lastDoc]);

//   const fetchProducts = async () => {
//     if (loading || !hasMore) return;

//     setLoading(true);
//     try {
//       let productQuery = query(
//         collection(db, "products"),
//         orderBy("createdAt", "desc"),
//         limit(PRODUCTS_PER_PAGE)
//       );

//       if (lastDoc) {
//         productQuery = query(
//           collection(db, "products"),
//           orderBy("createdAt", "desc"),
//           startAfter(lastDoc),
//           limit(PRODUCTS_PER_PAGE)
//         );
//       }

//       const snapshot = await getDocs(productQuery);
//       const fetchedProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

//       setProducts(prev => [...prev, ...fetchedProducts]);
//       setLastDoc(snapshot.docs[snapshot.docs.length - 1]);

//       if (snapshot.docs.length < PRODUCTS_PER_PAGE) {
//         setHasMore(false);
//       }
//     } catch (error) {
//       console.error("Error fetching products:", error);
//     }

//     setLoading(false);
//   };


//   return (
//     <section className="bg-gray-50 py-3">
//       <div className="max-w-7xl mx-auto px-4">
//         {/* Title */}
//         <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
//           All Products
//         </div>


//         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {products.map(({ id, name, description, price, imageUrl }) => (
//             <div
//               key={id}
//               onClick={() => onProductClick?.(id)}
//               className="flex flex-col items-start cursor-pointer"
//             >
//               <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden group">
//                 <img
//                   src={imageUrl}
//                   alt={name}
//                   className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                 />
//               </div>
//               <div className="pt-2 w-full">
//                 <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
//                 {/* <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p> */}
//                 <p className="text-sm font-semibold text-gray-700 mt-1">
//                   UGX {price?.toLocaleString?.()}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {loading && (
//           <div className="flex justify-center mt-6 text-gray-600">
//             Loading more products...
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }


//************************* */

// "use client";

// import { useEffect, useState } from "react";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// export default function FeaturedProducts({ selectedCategory }) {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);

//       try {
//         let q;

//         // ✅ Fix logic here
//         if (selectedCategory && selectedCategory !== "All Products") {
//           q = query(
//             collection(db, "products"),
//             where("category", "==", selectedCategory)
//           );
//         } else {
//           q = collection(db, "products");
//         }


//         const querySnapshot = await getDocs(q);
//         const fetchedProducts = [];
//         querySnapshot.forEach((doc) => {
//           fetchedProducts.push({ id: doc.id, ...doc.data() });
//         });
//         setProducts(fetchedProducts);
//       } catch (err) {
//         console.error("Error fetching products:", err);
//         setProducts([]);
//       }

//       setLoading(false);
//     };

//     fetchProducts();
//   }, [selectedCategory]);

//   if (loading) {
//     return <p className="text-center py-4">Loading products...</p>;
//   }

//   if (products.length === 0) {
//     return (
//       <div>
//         <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
//           {selectedCategory}
//         </div>
//           <p className="text-center py-4">No products found.</p>;
//       </div>
//     );  
//   }

  
//   return (
//     <section className="bg-gray-50 py-3">
//     <div className="max-w-7xl mx-auto px-4">
//         {/* Title */}
//         <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
//           {selectedCategory}
//          </div>
//          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {products.map(({ id, name, description, price, imageUrl }) => (
//             <div
//               key={id}
//               onClick={() => onProductClick?.(id)}
//               className="flex flex-col items-start cursor-pointer"
//             >
//               <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden group">
//                 <img
//                   src={imageUrl}
//                   alt={name}
//                   className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
//                 />
//               </div>
//               <div className="pt-2 w-full">
//                 <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
//                 {/* <p className="text-xs text-gray-500 mt-0.5 truncate">{description}</p> */}
//                 <p className="text-sm font-semibold text-gray-700 mt-1">
//                   UGX {price?.toLocaleString?.()}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//     </div>
//     </section>
//   );


// }




"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FeaturedProducts({ selectedCategory }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q;

        if (selectedCategory && selectedCategory !== "All Products") {
          q = query(
            collection(db, "products"),
            where("category", "==", selectedCategory)
          );
        } else {
          q = collection(db, "products");
        }

        const querySnapshot = await getDocs(q);
        const fetchedProducts = [];
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() });
        });
        setProducts(fetchedProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [selectedCategory]);

  if (loading) {
    return <p className="text-center py-4">Loading products...</p>;
  }

  if (products.length === 0) {
    return (
      <div>
        <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
          {selectedCategory}
        </div>
        <p className="text-center py-4">No products found.</p>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-3">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
          {selectedCategory}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(({ id, name, description, price, imageUrl }) => (
            <Link
              key={id}
              href={`/product/${id}`}
              className="flex flex-col items-start cursor-pointer group"
            >
              <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="pt-2 w-full">
                <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                <p className="text-sm font-semibold text-gray-700 mt-1">
                  UGX {price?.toLocaleString?.()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
