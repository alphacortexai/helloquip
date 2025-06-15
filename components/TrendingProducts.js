// "use client";

// import Head from "next/head";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   getDocs,
//   getDocsFromCache,
//   query,
//   limit,
// } from "firebase/firestore";
// import ProductCard from "@/components/ProductCard";

// export default function TrendingProducts() {
//   const [products, setProducts] = useState([]);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTrendingProducts = async () => {
//       try {
//         const q = query(collection(db, "trendingProducts"), limit(5));
//         const snapshot = await getDocs(q);

//         const trendingItems = snapshot.docs.map((doc) => {
//           const data = doc.data();
//           return {
//             id: doc.id,
//             name: data.name || "Unnamed",
//             image: data.image || data.imageUrl || "https://via.placeholder.com/200",
//             price: data.price || 0,
//             description: data.description || "No description provided.",
//             productCode: data.productCode || "N/A",
//           };
//         });

//         console.log("Fetched Trending Products:", trendingItems);
//         setProducts(trendingItems);
//       } catch (error) {
//         console.warn("Online fetch failed, trying cache:", error);

//         try {
//           const cachedSnapshot = await getDocsFromCache(collection(db, "trendingProducts"));
//           const cachedItems = cachedSnapshot.docs.map((doc) => {
//             const data = doc.data();
//             return {
//               id: doc.id,
//               name: data.name || "Unnamed",
//               image: data.image || data.imageUrl || "https://via.placeholder.com/200",
//               price: data.price || 0,
//               description: data.description || "No description provided.",
//               productCode: data.productCode || "N/A",
//             };
//           });

//           setProducts(cachedItems);
//         } catch (cacheErr) {
//           console.error("No cache found for trending products:", cacheErr);
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTrendingProducts();
//   }, []);

//   useEffect(() => {
//     if (products.length <= 1) return;
//     const interval = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % products.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, [products]);

//   const handleSlideChange = (index) => setCurrentSlide(index);

//   if (loading) {
//     return (
//       <section className="bg-gray-50 py-2">
//         <div className="max-w-5xl mx-auto px-4">
//           <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
//             Loading trending products...
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (products.length === 0) {
//     return (
//       <section className="bg-gray-50 py-2">
//         <div className="max-w-5xl mx-auto px-4">
//           <div className="text-blue-800 text-sm font-medium px-4 py-2 text-center mb-4">
//             No trending products found.
//           </div>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <>
//       <Head>
//         {products[0] && (
//           <link
//             rel="preload"
//             as="image"
//             href={products[0].image}
//             type="image/webp"
//           />
//         )}
//       </Head>

//       <section className="bg-white py-2">
//         <div className="max-w-5xl mx-auto px-2">
//           <h2 className="text-sm font-semibold text-center  text-gray-500 mb-2">TRENDING PRODUCTS</h2>

//           <div className="relative overflow-hidden">
//             {/* Slide container */}
//             <div
//               className="flex transition-transform duration-700 ease-in-out"
//               style={{ transform: `translateX(-${currentSlide * 100}%)` }}
//             >
//               {products.map((product) => (
//                 <div
//                   key={product.id}
//                   className="w-full flex-shrink-0 px-1"
//                   style={{ minWidth: "100%" }}
//                 >
//                 <Link href={`/product/${product.id}`}>
//                     <ProductCard product={product} variant="landscapemain02" />
//                 </Link>
//                 </div>
//               ))}
//             </div>

//             {/* Dots */}
//             <div className="flex items-center justify-center gap-1 mt-1">
//               {products.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleSlideChange(index)}
//                   className={`h-1 w-1 rounded-full transition-all duration-300 ${
//                     currentSlide === index
//                       ? "bg-blue-600 scale-110"
//                       : "bg-gray-300"
//                   }`}
//                 ></button>
//               ))}
//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }





"use client";

import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDocsFromCache,
  query,
  limit,
} from "firebase/firestore";
import ProductCard from "@/components/ProductCard";

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const q = query(collection(db, "trendingProducts"), limit(5));
        const snapshot = await getDocs(q);

        const trendingItems = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Unnamed",
            image: data.image || data.imageUrl || "https://via.placeholder.com/200",
            price: data.price || 0,
            description: data.description || "No description provided.",
            productCode: data.productCode || "N/A",
          };
        });

        setProducts(trendingItems);
      } catch (error) {
        console.warn("Online fetch failed, trying cache:", error);

        try {
          const cachedSnapshot = await getDocsFromCache(collection(db, "trendingProducts"));
          const cachedItems = cachedSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name || "Unnamed",
              image: data.image || data.imageUrl || "https://via.placeholder.com/200",
              price: data.price || 0,
              description: data.description || "No description provided.",
              productCode: data.productCode || "N/A",
            };
          });

          setProducts(cachedItems);
        } catch (cacheErr) {
          console.error("No cache found for trending products:", cacheErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  const handleSlideChange = (index) => setCurrentSlide(index);

  const handleProductClick = (productId) => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push(`/product/${productId}`);
    }, 200); // delay for effect
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-2">
        <div className="max-w-5xl mx-auto px-4">
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
            Loading trending products...
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="bg-gray-50 py-2">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-blue-800 text-sm font-medium px-4 py-2 text-center mb-4">
            No trending products found.
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <Head>
        {products[0] && (
          <link
            rel="preload"
            as="image"
            href={products[0].image}
            type="image/webp"
          />
        )}
      </Head>

      {/* Full screen loader when navigating */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
        </div>
      )}

      <section className="bg-gray/70  py-2">
        <div className="max-w-5xl mx-auto px-2 ">
          <h2 className="text-sm font-semibold text-center text-gray-500 mb-2">TRENDING PRODUCTS</h2>

          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-full flex-shrink-0 px-1"
                  style={{ minWidth: "100%" }}
                >
                  <div
                    onClick={() => handleProductClick(product.id)}
                    className="cursor-pointer"
                  >
                    <ProductCard product={product} variant="landscapemain02" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`h-1 w-1 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "bg-blue-600 scale-110"
                      : "bg-gray-300"
                  }`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
