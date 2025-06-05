


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
//   const [lastVisible, setLastVisible] = useState(null); // for pagination
//   const [hasMore, setHasMore] = useState(true); // to track if more products exist
//   const batchSize = 6; // how many products to fetch per batch

//   // Ref for the scroll container (if any) or window
//   const scrollListenerAdded = useRef(false);

//   // Function to fetch a batch of products, optionally starting after lastVisible
// const fetchProducts = useCallback(
//   async (startAfterDoc = null, reset = false) => {
//     setLoading(true);

//     try {
//       const constraints = [];

//       if (selectedCategory && selectedCategory !== "All Products") {
//         constraints.push(where("category", "==", selectedCategory));
//       }

//       constraints.push(orderBy("name"));

//       if (startAfterDoc) {
//         constraints.push(startAfter(startAfterDoc));
//       }

//       constraints.push(limit(batchSize));

//       const q = query(collection(db, "products"), ...constraints);

//       const querySnapshot = await getDocs(q);

//       const fetchedProducts = [];
//       querySnapshot.forEach((doc) => {
//         fetchedProducts.push({ id: doc.id, ...doc.data() });
//       });

//       // Keyword filtering remains the same
//       let filteredProducts = fetchedProducts;
//       if (keyword && keyword.trim()) {
//         const lowerKeyword = keyword.trim().toLowerCase();
//         filteredProducts = fetchedProducts.filter(
//           (product) =>
//             product.name?.toLowerCase().includes(lowerKeyword) ||
//             product.description?.toLowerCase().includes(lowerKeyword)
//         );
//       }

//       if (reset) {
//         setProducts(filteredProducts);
//       } else {
//         setProducts((prev) => [...prev, ...filteredProducts]);
//       }

//       const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
//       setLastVisible(lastVisibleDoc);

//       setHasMore(filteredProducts.length === batchSize);
//     } catch (err) {
//       console.error("Error fetching products:", err);
//     }

//     setLoading(false);
//   },
//   [selectedCategory, keyword]
// );


//   // Initial load or reload on category/keyword change
//   useEffect(() => {
//     setProducts([]);
//     setLastVisible(null);
//     setHasMore(true);
//     fetchProducts(null, true);
//   }, [selectedCategory, keyword, fetchProducts]);

//   // Scroll event handler: load more when near bottom
//   useEffect(() => {
//     if (loading || !hasMore) return;

//     const handleScroll = () => {
//       // Calculate scroll position from window (you can adjust if your products are inside a container)
//       if (
//         window.innerHeight + window.scrollY >=
//         document.body.offsetHeight - 500 // 500px from bottom triggers load
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
//         {/* Title */}
//         <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
//           {selectedCategory || "Featured Products"}
//           {keyword && (
//             <span className="block text-xs text-gray-600 mt-1">
//               Filtered by keyword: <strong>{keyword}</strong>
//             </span>
//           )}
//         </div>

//         <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {products.map(({ id, name, description, price, imageUrl }) => (
//             <Link key={id} href={`/product/${id}`} className="cursor-pointer group">
//               <ProductCard
//                 variant="compact"
//                 product={{
//                   id,
//                   name,
//                   description,
//                   price,
//                   image: imageUrl,
//                 }}
//               />
//             </Link>
//           ))}
//         </div>

//         {loading && (
//           <p className="text-center py-4 text-gray-600">Loading more products...</p>
//         )}
//       </div>
//     </section>
//   );
// }





import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
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
  const [lastVisible, setLastVisible] = useState(null); // for pagination
  const [hasMore, setHasMore] = useState(true); // to track if more products exist
  const batchSize = 6; // how many products to fetch per batch

  // Ref for the scroll container (if any) or window
  const scrollListenerAdded = useRef(false);

  // Function to fetch a batch of products, optionally starting after lastVisible
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

        const fetchedProducts = [];
        querySnapshot.forEach((doc) => {
          fetchedProducts.push({ id: doc.id, ...doc.data() });
        });

        // Save original fetched count before filtering keyword
        const fetchedProductsCount = querySnapshot.docs.length;

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
          setProducts((prev) => [...prev, ...filteredProducts]);
        }

        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);

        // Use original fetched count to determine if more products exist
        setHasMore(fetchedProductsCount === batchSize);
      } catch (err) {
        console.error("Error fetching products:", err);
      }

      setLoading(false);
    },
    [selectedCategory, keyword]
  );

  // Initial load or reload on category/keyword change
  useEffect(() => {
    setProducts([]);
    setLastVisible(null);
    setHasMore(true);
    fetchProducts(null, true);
  }, [selectedCategory, keyword, fetchProducts]);

  // Scroll event handler: load more when near bottom
  useEffect(() => {
    if (loading || !hasMore) return;

    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500 // 500px from bottom triggers load
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
    <section className="bg-gray-50 py-3">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
          {selectedCategory || "Featured Products"}
          {keyword && (
            <span className="block text-xs text-gray-600 mt-1">
              Filtered by keyword: <strong>{keyword}</strong>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map(({ id, name, description, price, imageUrl }) => (
            <Link key={id} href={`/product/${id}`} className="cursor-pointer group">
              <ProductCard
                variant="compact"
                product={{
                  id,
                  name,
                  description,
                  price,
                  image: imageUrl,
                }}
              />
            </Link>
          ))}
        </div>

        {/* Show loading only if loading AND more products exist */}
        {loading && hasMore && (
          <p className="text-center py-4 text-gray-600">Loading more products...</p>
        )}
      </div>
    </section>
  );
}
