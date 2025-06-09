
// "use client";

// import { useEffect, useState } from "react";
// import { collection, getDocs } from "firebase/firestore";
// import { db } from "@/lib/firebase";

// import SearchBar from "@/components/SearchBar";
// import ProductCard from "@/components/ProductCard";
// import TrendingProducts from "@/components/TrendingProducts";
// import Categories from "@/components/Categories";
// import FeaturedProducts from "@/components/FeaturedProducts";

// // Optional scroll top on route change
// // import { usePathname } from "next/navigation";

// export default function Home() {
//   const [allProducts, setAllProducts] = useState([]);
//   const [filteredProducts, setFilteredProducts] = useState([]);
//   const [searching, setSearching] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("All Products");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, "products"));
//         const products = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setAllProducts(products);
//         setFilteredProducts(products);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const handleSearch = (query) => {
//     const searchTerm = query.toLowerCase();
//     if (searchTerm.trim() === "") {
//       setFilteredProducts(allProducts);
//       setSearching(false);
//       return;
//     }

//     const filtered = allProducts.filter(
//       (product) =>
//         product.name.toLowerCase().includes(searchTerm) ||
//         product.description?.toLowerCase().includes(searchTerm)
//     );
//     setFilteredProducts(filtered);
//     setSearching(true);
//   };

//   const LoadingDots = () => (
//     <div className="flex flex-col items-center justify-center h-screen">
//       <div className="flex gap-2 mb-2">
//         <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
//         <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
//         <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" />
//       </div>
//       <p className="text-sm text-gray-500">Loading...</p>
//     </div>
//   );

//   if (loading) return <LoadingDots />;

//   return (
//     <>
//       {/* Optional: Include SearchBar here */}
//       {/* <SearchBar onSearch={handleSearch} /> */}

//       {/* Search Results */}
//       {searching && (
//         <section className="bg-white py-12">
//           <div className="max-w-7xl mx-auto px-4">
//             <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
//               Search Results
//             </h3>
//             {filteredProducts.length === 0 ? (
//               <p className="text-center text-gray-500">No products found.</p>
//             ) : (
//               <div className="grid grid-cols-2 gap-4">
//                 {filteredProducts.map((product) => (
//                   <div
//                     key={product.id}
//                     className="bg-white rounded-lg overflow-hidden"
//                   >
//                     <div className="relative w-full h-48">
//                       <img
//                         src={product.imageUrl}
//                         alt={product.name}
//                         className="w-full h-full object-cover"
//                       />
//                     </div>
//                     <div className="p-4 text-left">
//                       <p className="text-sm text-gray-900 mt-2">{product.name}</p>
//                       <p className="text-base font-bold text-blue-800">
//                         UGX {product.price?.toLocaleString?.()}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </section>
//       )}

//       {/* Categories + Trending + Featured */}
//       <section className="bg-white py-2">
//         <div className="max-w-7xl mx-auto px-1">
//           <Categories onCategorySelect={setSelectedCategory} />
//         </div>
//         <TrendingProducts />
//       </section>

//       <FeaturedProducts selectedCategory={selectedCategory} />
//     </>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import SearchBar from "@/components/SearchBar";
import ProductCard from "@/components/ProductCard";
import TrendingProducts from "@/components/TrendingProducts";
import Categories from "@/components/Categories";
import FeaturedProducts from "@/components/FeaturedProducts";

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Products");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllProducts(products);
        setFilteredProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleSearch = (query) => {
    const searchTerm = query.toLowerCase();
    if (searchTerm.trim() === "") {
      setFilteredProducts(allProducts);
      setSearching(false);
      return;
    }

    const filtered = allProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description?.toLowerCase().includes(searchTerm)
    );
    setFilteredProducts(filtered);
    setSearching(true);
  };

  return (
    <>
      {/* <SearchBar onSearch={handleSearch} /> */}

      {/* Search Results */}
      {searching && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
              Search Results
            </h3>
            {filteredProducts.length === 0 ? (
              <p className="text-center text-gray-500">No products found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg overflow-hidden"
                  >
                    <div className="relative w-full h-48">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 text-left">
                      <p className="text-sm text-gray-900 mt-2">{product.name}</p>
                      <p className="text-base font-bold text-blue-800">
                        UGX {product.price?.toLocaleString?.()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Categories + Trending + Featured */}
      <section className="bg-white py-2">
        <div className="max-w-7xl mx-auto px-1">
          <Categories onCategorySelect={setSelectedCategory} />
        </div>
        <TrendingProducts />
      </section>

      <FeaturedProducts selectedCategory={selectedCategory} />
      {/* <FeaturedProducts selectedCategory={selectedCategory} products={filteredProducts} /> */}

    </>
  );
}
