"use client";

export const dynamic = "force-dynamic";
import Image from "next/image";


import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";

// Helper to decode URL and pick preferred size
const getPreferredImageUrl = (imageUrl) => {
  if (!imageUrl) return null;

  // If it's a string, decode and return
  if (typeof imageUrl === "string") {
    try {
      return decodeURIComponent(imageUrl);
    } catch {
      return imageUrl;
    }
  }

  // If it's an object with sizes, prefer 680x680 or original or first
  if (typeof imageUrl === "object") {
    const preferred =
      imageUrl["200x200"] || imageUrl["original"] || Object.values(imageUrl)[0];
    try {
      return decodeURIComponent(preferred);
    } catch {
      return preferred;
    }
  }

  return null;
};


function fixDoubleEncodedUrl(url) {
  return url.replace(/%252F/g, '%2F');
}

const ITEMS_PER_PAGE = 20;

export default function SearchResults() {
  const [products, setProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const router = useRouter();
  const scrollContainerRef = useRef(null);

  const query = searchParams.get("q")?.toLowerCase() || "";

  // Calculate pagination
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Scroll functions for navigation arrows
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -400, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const all = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtered = all.filter((product) =>
          product.name.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query)
        );

        setProducts(filtered);
        setCurrentPage(1); // Reset to first page on new search

        // Prepare similarity logic
        const filteredIds = new Set(filtered.map((p) => p.id));
        const keywords = query.split(" ");
        const filteredCategories = new Set(filtered.map((p) => p.category));
        const basePrice = filtered[0]?.price;

        const suggestions = all.filter((product) => {
          if (filteredIds.has(product.id)) return false;

          const matchesCategory = filteredCategories.has(product.category);
          const matchesPrice = basePrice
            ? product.price >= basePrice * 0.8 && product.price <= basePrice * 1.2
            : false;
          const text = `${product.name} ${product.description}`.toLowerCase();
          const matchesText = keywords.some((word) => text.includes(word));

          return matchesCategory || matchesPrice || matchesText;
        }).slice(0, 10); // Limit to 10 similar items

        setSimilarProducts(suggestions);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchProducts();
  }, [query]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">Searching...</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* <button
        onClick={() => router.back()}
        className="top-[130px] right-2 z-50 px-4 py-2 bg-blue-100 text-blue-700 text-sm  shadow-sm hover:bg-blue-200 transition-all"
      >
        ← Back
      </button> */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h3 className="text-xl text-gray-700">
          Search Results for <span className="font-semibold">"{query}"</span>
          {products.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({products.length} {products.length === 1 ? "result" : "results"})
            </span>
          )}
        </h3>
        {totalPages > 1 && (
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500 mb-6">No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {paginatedProducts.map(({ id, name, description, price, discount, imageUrl, sku }, index) => (
              <Link
                key={id}
                href={`/product/${id}`}
                className="bg-white rounded-lg overflow-hidden cursor-pointer"
              >
                <ProductCard
                  variant="landscapemain"
                  isFirst={index === 0 && currentPage === 1}
                  product={{
                    id,
                    name: name || "Unnamed Product",
                    description: description || "",
                    sku: sku || "",
                    price: price || 0,
                    discount: discount || 0,
                    image: getPreferredImageUrl(imageUrl),
                  }}
                />
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mb-8">
              {/* Previous Button */}
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {(() => {
                  const pages = [];
                  const maxVisible = 5;
                  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                  let end = Math.min(totalPages, start + maxVisible - 1);
                  
                  if (end - start + 1 < maxVisible) {
                    start = Math.max(1, end - maxVisible + 1);
                  }

                  if (start > 1) {
                    pages.push(
                      <button
                        key={1}
                        onClick={() => {
                          setCurrentPage(1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        1
                      </button>
                    );
                    if (start > 2) {
                      pages.push(
                        <span key="start-ellipsis" className="px-2 text-gray-500">...</span>
                      );
                    }
                  }

                  for (let i = start; i <= end; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => {
                          setCurrentPage(i);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === i
                            ? "bg-blue-600 text-white border border-blue-600"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  if (end < totalPages) {
                    if (end < totalPages - 1) {
                      pages.push(
                        <span key="end-ellipsis" className="px-2 text-gray-500">...</span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => {
                          setCurrentPage(totalPages);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {totalPages}
                      </button>
                    );
                  }

                  return pages;
                })()}
              </div>

              {/* Next Button */}
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {similarProducts.length > 0 && (
        <>
          <h3 className="mt-4 text-xl font-semibold mb-2 text-gray-700">
            Similar Products You Might Like
          </h3>
          {/* Mobile: 2-column grid, Desktop: horizontal scroll */}
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {similarProducts.map(
              ({ id, name, description, price, discount, imageUrl, sku }, index) => (
                <Link
                  key={id}
                  href={`/product/${id}`}
                  className="rounded-lg overflow-hidden cursor-pointer"
                >
                  <ProductCard
                    variant="compact"
                    isFirst={index === 0}
                    product={{
                      id,
                      name: name || "Unnamed Product",
                      description: description || "",
                      sku: sku || "",
                      price: price || 0,
                      discount: discount || 0,
                      image: getPreferredImageUrl(imageUrl),
                    }}
                  />
                </Link>
              )
            )}
          </div>
          {/* Desktop: horizontal scrollable row with navigation arrows */}
          <div className="hidden md:block relative">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 border border-gray-200 transition-all hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
            </button>

            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-4 pb-4 px-10 scrollbar-hide scroll-smooth"
            >
              {similarProducts.map(
                ({ id, name, description, price, discount, imageUrl, sku }, index) => (
                  <Link
                    key={id}
                    href={`/product/${id}`}
                    className="flex-shrink-0 w-[180px] rounded-lg overflow-hidden cursor-pointer"
                  >
                    <ProductCard
                      variant="compact"
                      isFirst={index === 0}
                      product={{
                        id,
                        name: name || "Unnamed Product",
                        description: description || "",
                        sku: sku || "",
                        price: price || 0,
                        discount: discount || 0,
                        image: getPreferredImageUrl(imageUrl),
                      }}
                    />
                  </Link>
                )
              )}
            </div>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 border border-gray-200 transition-all hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}



          





// "use client";

// import { useSearchParams, useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import ProductCard from "@/components/ProductCard";

// export default function SearchResults() {
//   const [products, setProducts] = useState([]);
//   const [similarProducts, setSimilarProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const searchParams = useSearchParams();
//   const router = useRouter();
//   const query = searchParams.get("q")?.toLowerCase() || "";

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, "products"));
//         const all = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));

//         const filtered = all.filter(
//           (p) =>
//             p.name.toLowerCase().includes(query) ||
//             p.description?.toLowerCase().includes(query)
//         );

//         setProducts(filtered);

//         const filteredIds = new Set(filtered.map((p) => p.id));
//         const keywords = query.split(" ");
//         const filteredCategories = new Set(filtered.map((p) => p.category));
//         const basePrice = filtered[0]?.price;

//         const suggestions = all
//           .filter((product) => {
//             if (filteredIds.has(product.id)) return false;

//             const matchesCategory = filteredCategories.has(product.category);
//             const matchesPrice = basePrice
//               ? product.price >= basePrice * 0.8 &&
//                 product.price <= basePrice * 1.2
//               : false;
//             const text = `${product.name} ${product.description}`.toLowerCase();
//             const matchesText = keywords.some((word) => text.includes(word));

//             return matchesCategory || matchesPrice || matchesText;
//           })
//           .slice(0, 6);

//         setSimilarProducts(suggestions);
//       } catch (err) {
//         console.error("Fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (query) fetchProducts();
//   }, [query]);

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[60vh]">
//         <p className="text-gray-500">Searching for products...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-6xl mx-auto p-4 ml-1 mr-1">
//       <button
//         onClick={() => router.back()}
//         className="mb-4 px-4 py-2 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
//       >
//         Navigate Back
//       </button>

//       <h2 className="text-lg font-regular text-gray-500 mb-4">
//         SEARCH RESULTS;  <span className="text-blue-700">"{query}"</span>
//       </h2>

//       {products.length === 0 ? (
//         <p className="text-gray-500 mb-10">No products found.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-1 mb-10">
//           {products.map((product) => (
//             <Link key={product.id} href={`/product/${product.id}`}>
//               <ProductCard
//                 product={{ ...product, image: product.imageUrl }}
//                 variant="landscapemain"
//               />
//             </Link>
//           ))}
//         </div>
//       )}

//       {similarProducts.length > 0 && (
//         <>
//           <h3 className="text-xl font-medium text-gray-700 mb-4">
//             Similar Products You Might Like
//           </h3>
//           <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-1">
//             {similarProducts.map((product) => (
//               <Link key={product.id} href={`/product/${product.id}`}>
//                 <ProductCard
//                   product={{ ...product, image: product.imageUrl }}
//                   variant="landscapemain"
//                 />
//               </Link>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }
