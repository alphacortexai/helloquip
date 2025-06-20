// import { useEffect, useState, useRef, useCallback } from "react";
// import Link from "next/link";
// import {
//   collection,
//   getDocs,
//   query,
//   where,
//   orderBy,
//   limit,
//   startAfter,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import ProductCard from "./ProductCard";

// export default function FeaturedProducts({ selectedCategory, keyword }) {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [lastVisible, setLastVisible] = useState(null);
//   const [hasMore, setHasMore] = useState(true);
//   const batchSize = 6;
//   const scrollListenerAdded = useRef(false);

//   const fetchProducts = useCallback(
//     async (startAfterDoc = null, reset = false) => {
//       setLoading(true);

//       try {
//         const constraints = [];

//         if (selectedCategory && selectedCategory !== "All Products") {
//           constraints.push(where("category", "==", selectedCategory));
//         }

//         constraints.push(orderBy("name"));

//         if (startAfterDoc) {
//           constraints.push(startAfter(startAfterDoc));
//         }

//         constraints.push(limit(batchSize));

//         const q = query(collection(db, "products"), ...constraints);
//         const querySnapshot = await getDocs(q);

//         const fetchedProducts = querySnapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         const fetchedProductsCount = querySnapshot.docs.length;

//         // Keyword filtering
//         let filteredProducts = fetchedProducts;
//         if (keyword && keyword.trim()) {
//           const lowerKeyword = keyword.trim().toLowerCase();
//           filteredProducts = fetchedProducts.filter(
//             (product) =>
//               product.name?.toLowerCase().includes(lowerKeyword) ||
//               product.description?.toLowerCase().includes(lowerKeyword)
//           );
//         }

//         if (reset) {
//           setProducts(filteredProducts);
//         } else {
//           // Prevent duplicates by checking IDs
//           setProducts((prev) => {
//             const existingIds = new Set(prev.map((p) => p.id));
//             const newUnique = filteredProducts.filter((p) => !existingIds.has(p.id));
//             return [...prev, ...newUnique];
//           });
//         }

//         const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
//         setLastVisible(lastVisibleDoc);
//         setHasMore(fetchedProductsCount === batchSize);
//       } catch (err) {
//         console.error("Error fetching products:", err);
//       }

//       setLoading(false);
//     },
//     [selectedCategory, keyword]
//   );

//   useEffect(() => {
//     setProducts([]);
//     setLastVisible(null);
//     setHasMore(true);
//     fetchProducts(null, true);
//   }, [selectedCategory, keyword, fetchProducts]);

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

//   if (products.length === 0 && !loading) {
//     return (
//       <div>
//         <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
//           {selectedCategory || "Products"}
//         </div>
//         <p className="text-center py-4">No products found.</p>
//       </div>
//     );
//   }

//   return (
//     <section className="bg-gray-50 py-3">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="text-gray-500 text-sm font-semibold  text-center  uppercase mb-2">
//           {selectedCategory || "Featured Products"}
//           {keyword && (
//             <span className="block text-xs text-gray-600 mt-1">
//               Filtered by keyword:: <strong>{keyword}</strong>
//             </span>
//           )}
//         </div>

//         <div className="columns-2 sm:columns-4 md:columns-6 lg:columns-4 gap-2 space-y-2">
//           {products.map(({ id, name, description, price, imageUrl, productCode }) => (
//             <Link
//               key={id}
//               href={`/product/${id}`}
//               className="cursor-pointer group break-inside-avoid"
//             >
//               <ProductCard
//                 variant="compact"
//                 product={{
//                   id,
//                   name,
//                   description,
//                   productCode,
//                   price,
//                   image: imageUrl,
//                 }}
//               />
//             </Link>
//           ))}
//         </div>

//         {loading && hasMore && (
//           <p className="text-center py-4 text-gray-600">Loading more products...</p>
//         )}
//       </div>
//     </section>
//   );
// }



import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";

export default function FeaturedProducts({ selectedCategory, keyword }) {
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
        const constraints = [];

        if (selectedCategory && selectedCategory !== "All Products") {
          constraints.push(where("category", "==", selectedCategory));
        }

        constraints.push(orderBy("name"));

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

        // Keyword filtering
        let filteredProducts = fetchedProducts;
        if (keyword && keyword.trim()) {
          const lowerKeyword = keyword.trim().toLowerCase();
          filteredProducts = fetchedProducts.filter(
            (product) =>
              product.name?.toLowerCase().includes(lowerKeyword) ||
              product.description?.toLowerCase().includes(lowerKeyword)
          );
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
    [selectedCategory, keyword]
  );

  useEffect(() => {
    setProducts([]);
    setLastVisible(null);
    setHasMore(true);
    fetchProducts(null, true);
  }, [selectedCategory, keyword, fetchProducts]);

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
        <p className="text-center py-4">No products found.</p>
      </div>
    );
  }

  return (
    <section className="bg-gray/70 py-3 relative">
      {/* Full screen loader when navigating */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-2">
        <div className="text-gray-500 text-sm font-semibold text-center uppercase mb-2">
          {selectedCategory || "Featured Products"}
          {keyword && (
            <span className="block text-xs text-gray-600 ">
              Filtered by keyword: <strong>{keyword}</strong>
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
                  sku,  // Rename here to sku
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
