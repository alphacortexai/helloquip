"use client";

export const dynamic = "force-dynamic";
import Image from "next/image";


import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
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

export default function SearchResults() {
  const [products, setProducts] = useState([]);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("q")?.toLowerCase() || "";

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
        }).slice(0, 6); // Limit to 6 similar items

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

      <h3 className="mt-2 text-xl  mb-2 text-gray-700">
        Search Results for <span className="font-semibold">  "{query}" </span>
      </h3>

      {products.length === 0 ? (
        <p className="text-gray-500 mb-6">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-">
        {products.map(({ id, name, description, price, discount, imageUrl, sku }, index) => (
          <Link
            key={id}
            href={`/product/${id}`}
            className="bg-white rounded-lg overflow-hidden cursor-pointer"
          >
            <ProductCard
              variant="landscapemain"
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
        ))}

        </div>
      )}

      {similarProducts.length > 0 && (
        <>
          <h3 className="mt-4 text-xl font-semibold mb-2 text-gray-700">
            Similar Products You Might Like
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
