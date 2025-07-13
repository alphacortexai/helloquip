// "use client";

// import Head from "next/head";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   collection,
//   getDocs,
//   getDocsFromCache,
//   query,
//   limit,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import ProductCard from "@/components/ProductCard";

// // Reusable image handler
// const getPreferredImageUrl = (imageUrl) => {
//   if (!imageUrl) return null;

//   if (typeof imageUrl === "string") {
//     try {
//       return decodeURIComponent(imageUrl);
//     } catch {
//       return imageUrl;
//     }
//   }

//   if (typeof imageUrl === "object") {
//     const preferred =
//       imageUrl["200x200"] ||
//       imageUrl["200x200"] ||
//       imageUrl["original"] ||
//       Object.values(imageUrl)[0];
//     try {
//       return decodeURIComponent(preferred);
//     } catch {
//       return preferred;
//     }
//   }

//   return null;
// };

// export default function TrendingProducts() {
//   const [products, setProducts] = useState([]);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [isNavigating, setIsNavigating] = useState(false);
//   const router = useRouter();

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
//             image: getPreferredImageUrl(data.image || data.imageUrl),
//             price: data.price || 0,
//             description: data.description || "No description provided.",
//             sku: data.sku || "N/A",
//           };
//         });

//         setProducts(trendingItems);
//       } catch (error) {
//         console.warn("Online fetch failed, trying cache:", error);

//         try {
//           const cachedSnapshot = await getDocsFromCache(
//             collection(db, "trendingProducts")
//           );
//           const cachedItems = cachedSnapshot.docs.map((doc) => {
//             const data = doc.data();
//             return {
//               id: doc.id,
//               name: data.name || "Unnamed",
//               image: getPreferredImageUrl(data.image || data.imageUrl),
//               price: data.price || 0,
//               description: data.description || "No description provided.",
//               sku: data.sku || "N/A",
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

//   const handleProductClick = (productId) => {
//     setIsNavigating(true);
//     setTimeout(() => {
//       router.push(`/product/${productId}`);
//     }, 200);
//   };

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

//       {isNavigating && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
//           <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
//         </div>
//       )}

//       <section className="bg-gray/70 py-2">
//         <div className="max-w-5xl mx-auto px-2">
//           <h2 className="text-sm font-semibold text-center text-gray-500 mb-2">
//             TRENDING PRODUCTS
//           </h2>

//           <div className="relative overflow-hidden">
//             <div
//               className="flex transition-transform duration-700 ease-in-out"
//               style={{ transform: `translateX(-${currentSlide * 100}%)` }}
//             >
//               {products.map((product, index) => (
//                 <div
//                   key={product.id}
//                   className="w-full flex-shrink-0 px-1"
//                   style={{ minWidth: "100%" }}
//                 >
//                   <div
//                     onClick={() => handleProductClick(product.id)}
//                     className="cursor-pointer"
//                   >
//                     <ProductCard
//                       product={product}
//                       variant="landscapemain02"
//                       isFirst={index === 0}  // <-- eager load + high priority for first image
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex items-center justify-center gap-1 mt-2">
//               {products.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => handleSlideChange(index)}
//                   className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
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















// "use client";

// import Head from "next/head";
// import { useEffect, useState, useRef } from "react";
// import { useRouter } from "next/navigation";
// import {
//   collection,
//   getDocs,
//   getDocsFromCache,
//   query,
//   limit,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import ProductCard from "@/components/ProductCard";

// const getPreferredImageUrl = (imageUrl) => {
//   if (!imageUrl) return null;
//   if (typeof imageUrl === "string") {
//     try {
//       return decodeURIComponent(imageUrl);
//     } catch {
//       return imageUrl;
//     }
//   }
//   if (typeof imageUrl === "object") {
//     const preferred =
//       imageUrl["800x800"] ||
//       imageUrl["680x680"] ||
//       imageUrl["200x200"] ||
//       imageUrl["original"] ||
//       Object.values(imageUrl)[0];
//     try {
//       return decodeURIComponent(preferred);
//     } catch {
//       return preferred;
//     }
//   }
//   return null;
// };

// export default function TrendingProducts() {
//   const [products, setProducts] = useState([]);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [isNavigating, setIsNavigating] = useState(false);
//   const router = useRouter();
//   const scrollContainerRef = useRef(null);

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
//             image: getPreferredImageUrl(data.image || data.imageUrl),
//             price: data.price || 0,
//             description: data.description || "No description provided.",
//             sku: data.sku || "N/A",
//           };
//         });
//         setProducts(trendingItems);
//       } catch (error) {
//         try {
//           const cachedSnapshot = await getDocsFromCache(
//             collection(db, "trendingProducts")
//           );
//           const cachedItems = cachedSnapshot.docs.map((doc) => {
//             const data = doc.data();
//             return {
//               id: doc.id,
//               name: data.name || "Unnamed",
//               image: getPreferredImageUrl(data.image || data.imageUrl),
//               price: data.price || 0,
//               description: data.description || "No description provided.",
//               sku: data.sku || "N/A",
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

//   useEffect(() => {
//     if (scrollContainerRef.current) {
//       scrollContainerRef.current.scrollTo({
//         left: currentSlide * scrollContainerRef.current.offsetWidth,
//         behavior: "smooth",
//       });
//     }
//   }, [currentSlide]);

//   const handleProductClick = (productId) => {
//     setIsNavigating(true);
//     setTimeout(() => {
//       router.push(`/product/${productId}`);
//     }, 200);
//   };

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

//       {isNavigating && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
//           <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
//         </div>
//       )}

//       <section className=" mt-2">
//         <div className="max-w-6xl mx-auto">
//           <h2 className="text-sm font-semibold text-center text-gray-600 mb-2">
//             TRENDING PRODUCTS
//           </h2>

//           <div className="relative overflow-hidden">
//             <div
//               ref={scrollContainerRef}
//               className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
//             >
//               {products.map((product, index) => (
//                 <div
//                   key={product.id}
//                   className="w-full flex-shrink-0 snap-center px-2"
//                   style={{ minWidth: "100%" }}
//                 >
//                   <div
//                     onClick={() => handleProductClick(product.id)}
//                     className="cursor-pointer"
//                   >
//                     {/* <ProductCard
//                       product={product}
//                       variant="landscapemain02"
//                       isFirst={index === 0}
//                     /> */}
//                     <ProductCard
//                       product={product}
//                       variant="landscapemain02"
//                       isFirst={index === 0}
//                       badge="Trending"
//                     />

//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="flex items-center justify-center gap-1 mt-3">
//               {products.map((_, index) => (
//                 <button
//                   key={index}
//                   onClick={() => setCurrentSlide(index)}
//                   className={`h-2 w-2 rounded-full transition-all duration-300 ${
//                     currentSlide === index
//                       ? "bg-blue-600 scale-110"
//                       : "bg-gray-300"
//                   }`}
//                 />
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
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  getDocsFromCache,
  query,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";

const getPreferredImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (typeof imageUrl === "string") {
    try {
      return decodeURIComponent(imageUrl);
    } catch {
      return imageUrl;
    }
  }
  if (typeof imageUrl === "object") {
    const preferred =
      imageUrl["800x800"] ||
      imageUrl["680x680"] ||
      imageUrl["200x200"] ||
      imageUrl["original"] ||
      Object.values(imageUrl)[0];
    try {
      return decodeURIComponent(preferred);
    } catch {
      return preferred;
    }
  }
  return null;
};

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        const q = query(collection(db, "trendingProducts"), limit(5));
        const snapshot = await getDocs(q);

        // Assuming each doc in trendingProducts contains only productId field or doc.id is productId
        const productIds = snapshot.docs.map((doc) => {
          // If productId is a field:
          const data = doc.data();
          return data.productId || doc.id; // fallback to doc.id if no productId field
        });

        // Fetch all product details in parallel
        const productPromises = productIds.map(async (id) => {
          const productRef = doc(db, "products", id);
          const productSnap = await getDoc(productRef);
          if (productSnap.exists()) {
            const data = productSnap.data();
            return {
              id: productSnap.id,
              name: data.name || "Unnamed",
              image: getPreferredImageUrl(data.image || data.imageUrl),
              price: data.price || 0,
              description: data.description || "No description provided.",
              sku: data.sku || "N/A",
            };
          }
          return null; // if product does not exist
        });

        const fullProducts = (await Promise.all(productPromises)).filter(Boolean);
        setProducts(fullProducts);
      } catch (error) {
        console.warn("Network failed, trying cache…", error);
        try {
          const cachedSnapshot = await getDocsFromCache(collection(db, "trendingProducts"));
          const productIds = cachedSnapshot.docs.map((doc) => {
            const data = doc.data();
            return data.productId || doc.id;
          });

          const cachedProductPromises = productIds.map(async (id) => {
            const productRef = doc(db, "products", id);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              const data = productSnap.data();
              return {
                id: productSnap.id,
                name: data.name || "Unnamed",
                image: getPreferredImageUrl(data.image || data.imageUrl),
                price: data.price || 0,
                description: data.description || "No description provided.",
                sku: data.sku || "N/A",
              };
            }
            return null;
          });

          const cachedProducts = (await Promise.all(cachedProductPromises)).filter(Boolean);
          setProducts(cachedProducts);
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

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: currentSlide * scrollContainerRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  }, [currentSlide]);

  const handleProductClick = (productId) => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push(`/product/${productId}`);
    }, 200);
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

      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
        </div>
      )}

      <section className="mt-1">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
            >
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="w-full flex-shrink-0 snap-center px-2"
                  style={{ minWidth: "100%" }}
                >
                  <div
                    onClick={() => handleProductClick(product.id)}
                    className="cursor-pointer"
                  >
                    <ProductCard
                      product={product}
                      variant="landscapemain02"
                      isFirst={index === 0}
                      badge="Trending"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* <div className="flex items-center justify-center gap-1 mt-3">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    currentSlide === index
                      ? "bg-blue-600 scale-110"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div> */}
          </div>
        </div>
      </section>
    </>
  );
}
