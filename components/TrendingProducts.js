


// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import Image from "next/image";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   getDocs,
//   getDocsFromCache,
//   query,
//   limit,
// } from "firebase/firestore";

// export default function TrendingProducts() {
//   const [products, setProducts] = useState([]);
//   const [currentSlide, setCurrentSlide] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTrendingProducts = async () => {
//       console.time("fetchTrendingProducts");
//       try {
//         const q = query(collection(db, "trendingProducts"), limit(5));
//         const snapshot = await getDocs(q);
//         const trendingItems = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setProducts(trendingItems);
//       } catch (error) {
//         console.warn("Online fetch failed, trying cache:", error);
//         try {
//           const cachedSnapshot = await getDocsFromCache(
//             collection(db, "trendingProducts")
//           );
//           const cachedItems = cachedSnapshot.docs.map((doc) => ({
//             id: doc.id,
//             ...doc.data(),
//           }));
//           setProducts(cachedItems);
//         } catch (cacheErr) {
//           console.error("No cache found for trending products:", cacheErr);
//         }
//       } finally {
//         setLoading(false);
//         console.timeEnd("fetchTrendingProducts");
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

//   const handleSlideChange = (index) => {
//     setCurrentSlide(index);
//   };

//   if (loading) {
//     return (
//       <section className="bg-gray-50 py-2">
//         <div className="max-w-5xl mx-auto px-4">
//           <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-full text-center mb-4">
//             Trending Products
//           </div>
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
//           <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-full text-center mb-4">
//             Trending Products
//           </div>
//           <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
//             No trending products found.
//           </div>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="bg-gray-50 py-2">
//       <div className="max-w-5xl mx-auto px-4">
//         <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-full text-center mb-4">
//           Trending Products
//         </div>

//         <div className="overflow-hidden relative w-full mt-4 mb-4">
//           <div
//             className="flex transition-transform duration-600 ease-in-out"
//             style={{ transform: `translateX(-${currentSlide * 100}%)` }}
//           >
//             {products.map((product) => (
//               <Link
//                 key={product.id}
//                 href={`/product/${product.productId}`}
//                 className="relative group rounded-lg overflow-hidden cursor-pointer block min-w-full max-w-xs mx-auto shadow-none"
//               >
//                 <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">
//                 <Image
//                   src={product.imageUrl}
//                   alt={product.name}
//                   fill
//                   quality={50} // 👈 adjust between 1 (worst) and 100 (best)
//                   className="object-cover group-hover:brightness-75 transition duration-300 rounded-lg"
//                   sizes="(max-width: 768px) 100vw, 50vw"
//                   priority
//                 />
//                   <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10 rounded-b-lg"></div>
//                 </div>

//                 <div className="absolute bottom-4 left-4 text-white z-30 transform group-hover:-translate-y-3 transition duration-300 max-w-xs">
//                   <h2 className="font-semibold text-sm lg:text-base text-white truncate">
//                     {product.name}
//                   </h2>
//                   <p className="text-xs lg:text-sm leading-4 max-w-xs text-white truncate">
//                     {product.description}
//                   </p>

//                   <div className="mt-1 flex items-center gap-1">
//                     <p className="font-bold text-black bg-white/80 px-1 py-0.5 rounded whitespace-nowrap text-xs">
//                       {typeof product.price === "number"
//                         ? product.price.toLocaleString("en-UG", {
//                             style: "currency",
//                             currency: "UGX",
//                           })
//                         : product.price}
//                     </p>
//                     <button className="flex items-center gap-1 bg-blue-600 px-2 py-0.5 rounded text-xs">
//                       Buy now
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-3 w-3"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                         strokeWidth={2}
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M17 8l4 4m0 0l-4 4m4-4H3"
//                         />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>

//           <div className="flex items-center justify-center gap-1 mt-4">
//             {products.map((_, index) => (
//               <div
//                 key={index}
//                 onClick={() => handleSlideChange(index)}
//                 className={`h-1.5 w-1.5 rounded-full cursor-pointer ${
//                   currentSlide === index ? "bg-blue-600" : "bg-gray-400"
//                 }`}
//               ></div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }




"use client";
import Head from "next/head";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  getDocsFromCache,
  query,
  limit,
} from "firebase/firestore";

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      console.time("fetchTrendingProducts");
      try {
        const q = query(collection(db, "trendingProducts"), limit(5));
        const snapshot = await getDocs(q);
        const trendingItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(trendingItems);
      } catch (error) {
        console.warn("Online fetch failed, trying cache:", error);
        try {
          const cachedSnapshot = await getDocsFromCache(
            collection(db, "trendingProducts")
          );
          const cachedItems = cachedSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setProducts(cachedItems);
        } catch (cacheErr) {
          console.error("No cache found for trending products:", cacheErr);
        }
      } finally {
        setLoading(false);
        console.timeEnd("fetchTrendingProducts");
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

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <section className="bg-gray-50 py-2">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-full text-center mb-4">
            Trending Products
          </div>
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
          <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-full text-center mb-4">
            Trending Products
          </div>
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
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
            href={products[0].imageUrl}
            type="image/webp" // adjust if your images are jpg/png
          />
        )}
      </Head>

      {/* <section className="bg-gray-50 py-2">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-full text-center mb-4">
            Trending Products
          </div>

          <div className="overflow-hidden relative w-full mt-4 mb-4">
            <div
              className="flex transition-transform duration-600 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {products.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/product/${product.productId}`}
                  className="relative group rounded-lg overflow-hidden cursor-pointer block min-w-full max-w-xs mx-auto shadow-none"
                >
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden">

                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={400}  // or actual pixel width your design uses
                  height={300} // based on aspect ratio 4:3
                  quality={50}
                  className="object-cover group-hover:brightness-75 transition duration-300 rounded-lg"
                  sizes="(max-width: 640px) 100vw, 400px"
                  priority={index === 0}
                />

                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10 rounded-b-lg"></div>
                  </div>

                  <div className="absolute bottom-4 left-4 text-white z-30 transform group-hover:-translate-y-3 transition duration-300 max-w-xs">
                    <h2 className="font-semibold text-sm lg:text-base text-white truncate">
                      {product.name}
                    </h2>
                    <p className="text-xs lg:text-sm leading-4 max-w-xs text-white truncate">
                      {product.description}
                    </p>

                    <div className="mt-1 flex items-center gap-1">
                      <p className="font-bold text-black bg-white/80 px-1 py-0.5 rounded whitespace-nowrap text-xs">
                        {typeof product.price === "number"
                          ? product.price.toLocaleString("en-UG", {
                              style: "currency",
                              currency: "UGX",
                            })
                          : product.price}
                      </p>
                      <button className="flex items-center gap-1 bg-blue-600 px-2 py-0.5 rounded text-xs">
                        Buy now
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1 mt-4">
              {products.map((_, index) => (
                <div
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`h-1.5 w-1.5 rounded-full cursor-pointer ${
                    currentSlide === index ? "bg-blue-600" : "bg-gray-400"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </section> */}
      <section className="bg-white py-4">
  <div className="max-w-5xl mx-auto px-4">
    <div className="text-center mb-6">
      <h2 className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full">
        Trending Products
      </h2>
    </div>

    <div className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {products.map((product, index) => (
          <Link
            key={product.id}
            href={`/product/${product.productId}`}
            className="relative group w-full max-w-md mx-auto flex-shrink-0 rounded-lg overflow-hidden"
          >
            <div className="relative w-full aspect-[4/3] overflow-hidden rounded-lg shadow-md">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={400}
                height={300}
                quality={60}
                className="object-cover w-full h-full group-hover:scale-105 group-hover:brightness-75 transition duration-500 ease-in-out"
                sizes="(max-width: 640px) 100vw, 400px"
                priority={index === 0}
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10" />
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-20 text-white transition-all duration-300 ease-in-out group-hover:-translate-y-2">
              <h3 className="text-sm sm:text-base font-semibold truncate">
                {product.name}
              </h3>
              <p className="text-xs sm:text-sm truncate">{product.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="bg-white/90 text-black font-semibold px-2 py-0.5 rounded text-xs">
                  {typeof product.price === "number"
                    ? product.price.toLocaleString("en-UG", {
                        style: "currency",
                        currency: "UGX",
                      })
                    : product.price}
                </span>
                <button className="flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded text-xs hover:bg-blue-700">
                  Buy now
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        {products.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              currentSlide === index ? "bg-blue-600 scale-110" : "bg-gray-300"
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
