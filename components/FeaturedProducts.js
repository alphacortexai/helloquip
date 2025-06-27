



"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";

export default function FeaturedProducts({ selectedCategory, keyword, tags, manufacturer, name }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const scrollListenerAdded = useRef(false);
  const router = useRouter();
  const batchSize = 6;

  const fetchProducts = useCallback(
    async (startAfterDoc = null, reset = false) => {
      setLoading(true);
      try {
        const constraints = [orderBy("name")]; // No category filtering anymore

        if (startAfterDoc) {
          constraints.push(startAfter(startAfterDoc));
        }

        constraints.push(limit(batchSize));

        const q = query(collection(db, "products"), ...constraints);
        const querySnapshot = await getDocs(q);

        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter by similarity
        let filteredProducts = fetchedProducts;

        if (keyword || name || manufacturer || (tags && tags.length)) {
          const lowerKeyword = keyword?.trim().toLowerCase();
          const lowerName = name?.trim().toLowerCase();
          const lowerManufacturer = manufacturer?.trim().toLowerCase();
          const tagSet = new Set((tags || []).map((tag) => tag.toLowerCase()));

          filteredProducts = fetchedProducts.filter((product) => {
            const nameMatch =
              lowerKeyword && product.name?.toLowerCase().includes(lowerKeyword);
            const descMatch =
              lowerKeyword && product.description?.toLowerCase().includes(lowerKeyword);
            const nameSimMatch =
              lowerName && product.name?.toLowerCase().includes(lowerName);
            const manufacturerMatch =
              lowerManufacturer &&
              product.manufacturer?.toLowerCase().includes(lowerManufacturer);
            const tagMatch =
              product.tags &&
              Array.isArray(product.tags) &&
              product.tags.some((tag) => tagSet.has(tag.toLowerCase()));

            return (
              nameMatch ||
              descMatch ||
              nameSimMatch ||
              manufacturerMatch ||
              tagMatch
            );
          });
        }

        if (reset) {
          setProducts(filteredProducts);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newUnique = filteredProducts.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newUnique];
          });
        }

        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        setHasMore(querySnapshot.docs.length === batchSize);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
      setLoading(false);
    },
    [keyword, tags, manufacturer, name] // removed selectedCategory from dependencies
  );

  useEffect(() => {
    setProducts([]);
    setLastVisible(null);
    setHasMore(true);
    fetchProducts(null, true);
  }, [
    keyword || "",
    name || "",
    manufacturer || "",
    JSON.stringify(tags || []),
    fetchProducts,
  ]);

  useEffect(() => {
    if (loading || !hasMore) return;

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        fetchProducts(lastVisible);
      }
    };

    if (!scrollListenerAdded.current) {
      window.addEventListener("scroll", handleScroll);
      scrollListenerAdded.current = true;
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      scrollListenerAdded.current = false;
    };
  }, [fetchProducts, lastVisible, loading, hasMore]);

  const handleProductClick = (id) => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push(`/product/${id}`);
    }, 200);
  };

  if (products.length === 0 && !loading) {
    return (
      <div>
        <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
          {selectedCategory || "Products"}
        </div>
        <p className="text-center py-4">No similar products found.</p>
      </div>
    );
  }

  return (
    <section className="bg-gray/70 py-3 relative">
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2">
        <div className="text-gray-500 text-sm font-semibold text-center uppercase mb-2">
          {selectedCategory || "Similar Products"}
          {(keyword || name || manufacturer || (tags?.length > 0)) && (
            <span className="block text-xs text-gray-600">
              Filtered by:{" "}
              {[keyword, name, manufacturer, ...(tags || [])]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
        </div>

        <div className="columns-2 sm:columns-4 md:columns-6 lg:columns-4 gap-2 space-y-2">
          {products.map(({ id, name, description, price, imageUrl, sku }) => (
            <div
              key={id}
              onClick={() => handleProductClick(id)}
              className="cursor-pointer group break-inside-avoid"
            >
              <ProductCard
                variant="compact"
                product={{
                  id,
                  name,
                  description,
                  sku,
                  price,
                  image: imageUrl,
                }}
              />
            </div>
          ))}
        </div>

        {loading && hasMore && (
          <p className="text-center py-4 text-gray-600">Loading more products...</p>
        )}
      </div>
    </section>
  );
}

























// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import {
//   collection,
//   getDocs,
//   query,
//   orderBy,
//   limit,
//   startAfter,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import ProductCard from "./ProductCard";

// export default function FeaturedProducts({
//   selectedCategory,
//   keyword,
//   tags,
//   manufacturer,
//   name,
//   cardVariant = "compact",
//   excludeId, // ✅ New prop
// }) {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isNavigating, setIsNavigating] = useState(false);
//   const [lastVisible, setLastVisible] = useState(null);
//   const [hasMore, setHasMore] = useState(true);
//   const scrollListenerAdded = useRef(false);
//   const router = useRouter();
//   const batchSize = 6;

//   const fetchProducts = useCallback(
//     async (startAfterDoc = null, reset = false) => {
//       setLoading(true);
//       try {
//         const constraints = [orderBy("name")];

//         if (startAfterDoc) {
//           constraints.push(startAfter(startAfterDoc));
//         }

//         constraints.push(limit(batchSize));

//         const q = query(collection(db, "products"), ...constraints);
//         const querySnapshot = await getDocs(q);

//         let fetchedProducts = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         // ✅ Exclude current product if provided
//         if (excludeId) {
//           fetchedProducts = fetchedProducts.filter((p) => p.id !== excludeId);
//         }

//         // ✅ Filter by similarity
//         if (keyword || name || manufacturer || (tags && tags.length)) {
//           const lowerKeyword = keyword?.trim().toLowerCase();
//           const lowerName = name?.trim().toLowerCase();
//           const lowerManufacturer = manufacturer?.trim().toLowerCase();
//           const tagSet = new Set((tags || []).map((tag) => tag.toLowerCase()));

//           fetchedProducts = fetchedProducts.filter((product) => {
//             const nameMatch =
//               lowerKeyword && product.name?.toLowerCase().includes(lowerKeyword);
//             const descMatch =
//               lowerKeyword && product.description?.toLowerCase().includes(lowerKeyword);
//             const nameSimMatch =
//               lowerName && product.name?.toLowerCase().includes(lowerName);
//             const manufacturerMatch =
//               lowerManufacturer &&
//               product.manufacturer?.toLowerCase().includes(lowerManufacturer);
//             const tagMatch =
//               product.tags &&
//               Array.isArray(product.tags) &&
//               product.tags.some((tag) => tagSet.has(tag.toLowerCase()));

//             return (
//               nameMatch ||
//               descMatch ||
//               nameSimMatch ||
//               manufacturerMatch ||
//               tagMatch
//             );
//           });
//         }

//         if (reset) {
//           setProducts(fetchedProducts);
//         } else {
//           setProducts((prev) => {
//             const existingIds = new Set(prev.map((p) => p.id));
//             const newUnique = fetchedProducts.filter((p) => !existingIds.has(p.id));
//             return [...prev, ...newUnique];
//           });
//         }

//         const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
//         setLastVisible(lastVisibleDoc);
//         setHasMore(querySnapshot.docs.length === batchSize);
//       } catch (err) {
//         console.error("Error fetching products:", err);
//       }
//       setLoading(false);
//     },
//     [keyword, tags, manufacturer, name, excludeId]
//   );

//   useEffect(() => {
//     setProducts([]);
//     setLastVisible(null);
//     setHasMore(true);
//     fetchProducts(null, true);
//   }, [
//     keyword || "",
//     name || "",
//     manufacturer || "",
//     JSON.stringify(tags || []),
//     excludeId,
//     fetchProducts,
//   ]);

//   useEffect(() => {
//     if (loading || !hasMore) return;

//     const handleScroll = () => {
//       if (
//         window.innerHeight + window.scrollY >=
//         document.body.offsetHeight - 500
//       ) {
//         fetchProducts(lastVisible);
//       }
//     };

//     if (!scrollListenerAdded.current) {
//       window.addEventListener("scroll", handleScroll);
//       scrollListenerAdded.current = true;
//     }

//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//       scrollListenerAdded.current = false;
//     };
//   }, [fetchProducts, lastVisible, loading, hasMore]);

//   const handleProductClick = (id) => {
//     setIsNavigating(true);
//     setTimeout(() => {
//       router.push(`/product/${id}`);
//     }, 200);
//   };

//   if (products.length === 0 && !loading) {
//     return (
//       <div>
//         <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
//           {selectedCategory || "Products"}
//         </div>
//         <p className="text-center py-4">No similar products found.</p>
//       </div>
//     );
//   }

//   return (
//     <section className="bg-gray/70 py-3 relative">
//       {isNavigating && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
//           <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-2">
//         <div className="text-gray-500 text-sm font-semibold text-center uppercase mb-2">
//           {selectedCategory || "Similar Products"}
//           {(keyword || name || manufacturer || (tags?.length > 0)) && (
//             <span className="block text-xs text-gray-600">
//               Filtered by:{" "}
//               {[keyword, name, manufacturer, ...(tags || [])]
//                 .filter(Boolean)
//                 .join(", ")}
//             </span>
//           )}
//         </div>

//         {/* <div className="columns-2 sm:columns-4 md:columns-6 lg:columns-4 gap-2 space-y-2">
//           {products.map(({ id, name, description, price, imageUrl, sku }) => (
//             <div
//               key={id}
//               onClick={() => handleProductClick(id)}
//               className="cursor-pointer group break-inside-avoid"
//             >
//               <ProductCard
//                 variant={cardVariant}
//                 product={{
//                   id,
//                   name,
//                   description,
//                   sku,
//                   price,
//                   image: imageUrl,
//                 }}
//               />
//             </div>
//           ))}
//         </div> */}


//         <div
//           className={
//             cardVariant === "landscapemain"
//               ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4"
//               : "columns-2 sm:columns-4 md:columns-6 lg:columns-4 gap-2 space-y-2"
//           }
//         >
//         {products.map(({ id, name, description, price, imageUrl, sku }) => (
//         <div
//           key={id}
//           onClick={() => handleProductClick(id)}
//           className="cursor-pointer group break-inside-avoid"
//         >
//                 <ProductCard
//                   variant={cardVariant || "compact"}
//                   product={{
//                     id,
//                     name,
//                     description,
//                     sku,
//                     price,
//                     image: imageUrl,
//                   }}
//                 />
//               </div>
//             ))}
//           </div>



//         {loading && hasMore && (
//           <p className="text-center py-4 text-gray-600">Loading more products...</p>
//         )}
//       </div>
//     </section>
//   );
// }

















// "use client";

// import { useEffect, useState, useRef, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import {
//   collection,
//   getDocs,
//   query,
//   orderBy,
//   limit,
//   startAfter,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import ProductCard from "./ProductCard";

// export default function FeaturedProducts({
//   selectedCategory,
//   keyword,
//   tags,
//   manufacturer,
//   name,
//   cardVariant = "compact",
//   excludeId,
// }) {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isNavigating, setIsNavigating] = useState(false);
//   const [lastVisible, setLastVisible] = useState(null);
//   const [hasMore, setHasMore] = useState(true);
//   const scrollListenerAdded = useRef(false);
//   const debounceTimeout = useRef(null);
//   const router = useRouter();
//   const batchSize = 6;

//   const fetchProducts = useCallback(
//     async (startAfterDoc = null, reset = false) => {
//       setLoading(true);
//       try {
//         const constraints = [orderBy("name")];

//         if (startAfterDoc) {
//           constraints.push(startAfter(startAfterDoc));
//         }

//         constraints.push(limit(batchSize));

//         const q = query(collection(db, "products"), ...constraints);
//         const querySnapshot = await getDocs(q);

//         let fetchedProducts = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         if (excludeId) {
//           fetchedProducts = fetchedProducts.filter((p) => p.id !== excludeId);
//         }

//         if (keyword || name || manufacturer || (tags && tags.length)) {
//           const lowerKeyword = keyword?.trim().toLowerCase();
//           const lowerName = name?.trim().toLowerCase();
//           const lowerManufacturer = manufacturer?.trim().toLowerCase();
//           const tagSet = new Set((tags || []).map((tag) => tag.toLowerCase()));

//           fetchedProducts = fetchedProducts.filter((product) => {
//             const nameMatch =
//               lowerKeyword && product.name?.toLowerCase().includes(lowerKeyword);
//             const descMatch =
//               lowerKeyword &&
//               product.description?.toLowerCase().includes(lowerKeyword);
//             const nameSimMatch =
//               lowerName && product.name?.toLowerCase().includes(lowerName);
//             const manufacturerMatch =
//               lowerManufacturer &&
//               product.manufacturer?.toLowerCase().includes(lowerManufacturer);
//             const tagMatch =
//               product.tags &&
//               Array.isArray(product.tags) &&
//               product.tags.some((tag) => tagSet.has(tag.toLowerCase()));

//             return (
//               nameMatch ||
//               descMatch ||
//               nameSimMatch ||
//               manufacturerMatch ||
//               tagMatch
//             );
//           });
//         }

//         if (reset) {
//           setProducts(fetchedProducts);
//         } else {
//           setProducts((prev) => {
//             const existingIds = new Set(prev.map((p) => p.id));
//             const newUnique = fetchedProducts.filter((p) => !existingIds.has(p.id));
//             return [...prev, ...newUnique];
//           });
//         }

//         if (fetchedProducts.length > 0) {
//           const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
//           setLastVisible(lastVisibleDoc);
//           setHasMore(querySnapshot.docs.length === batchSize);
//         } else {
//           setHasMore(false);
//         }
//       } catch (err) {
//         console.error("Error fetching products:", err);
//       }
//       setLoading(false);
//     },
//     [keyword, tags, manufacturer, name, excludeId]
//   );

//   useEffect(() => {
//     setProducts([]);
//     setLastVisible(null);
//     setHasMore(true);
//     fetchProducts(null, true);
//   }, [keyword || "", name || "", manufacturer || "", JSON.stringify(tags || []), excludeId, fetchProducts]);

//   useEffect(() => {
//     if (loading || !hasMore) return;

//     const handleScroll = () => {
//       if (debounceTimeout.current) return;

//       debounceTimeout.current = setTimeout(() => {
//         if (
//           window.innerHeight + window.scrollY >=
//           document.body.offsetHeight - 500
//         ) {
//           fetchProducts(lastVisible);
//         }
//         debounceTimeout.current = null;
//       }, 250);
//     };

//     if (!scrollListenerAdded.current) {
//       window.addEventListener("scroll", handleScroll);
//       scrollListenerAdded.current = true;
//     }

//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//       scrollListenerAdded.current = false;
//       if (debounceTimeout.current) {
//         clearTimeout(debounceTimeout.current);
//       }
//     };
//   }, [fetchProducts, lastVisible, loading, hasMore]);

//   const handleProductClick = (id) => {
//     setIsNavigating(true);
//     setTimeout(() => {
//       router.push(`/product/${id}`);
//     }, 200);
//   };

//   if (products.length === 0 && !loading) {
//     return (
//       <div>
//         <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
//           {selectedCategory || "Products"}
//         </div>
//         <p className="text-center py-4">No similar products found.</p>
//       </div>
//     );
//   }

//   return (
//     <section className="bg-gray/70 py-3 relative">
//       {isNavigating && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
//           <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto px-2">
//         <div className="text-gray-500 text-sm font-semibold text-center uppercase mb-2">
//           {selectedCategory || "Similar Products"}
//           {(keyword || name || manufacturer || (tags?.length > 0)) && (
//             <span className="block text-xs text-gray-600">
//               Filtered by: {[
//                 keyword,
//                 name,
//                 manufacturer,
//                 ...(tags || []),
//               ]
//                 .filter(Boolean)
//                 .join(", ")}
//             </span>
//           )}
//         </div>

//         <div
//           className={
//             cardVariant === "landscapemain"
//               ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4"
//               : "columns-2 sm:columns-4 md:columns-6 lg:columns-4 gap-2 space-y-2"
//           }
//         >
//           {products.map(({ id, name, description, price, imageUrl, sku }) => (
//             <div
//               key={id}
//               onClick={() => handleProductClick(id)}
//               className="cursor-pointer group break-inside-avoid"
//             >
//               <ProductCard
//                 variant={cardVariant || "compact"}
//                 product={{
//                   id,
//                   name,
//                   description,
//                   sku,
//                   price,
//                   image: imageUrl,
//                 }}
//               />
//             </div>
//           ))}
//         </div>

//         {loading && hasMore && (
//           <p className="text-center py-4 text-gray-600">Loading more products...</p>
//         )}
//       </div>
//     </section>
//   );
// }