// import SearchBar from "@/components/SearchBar";
// import FeaturedProducts from "@/components/FeaturedProducts";
// import TrendingProducts from "@/components/TrendingProducts";
// import Categories from "@/components/Categories"; // make sure the path is correct
// import CategoryForm from "@/components/CategoryForm";


// export default function Home() {
//   return (
//     <main className="bg-gray-50 text-gray-900 font-sans">
//       {/* Header */}
//       <header className="bg-white shadow sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
//           <h1 className="text-2xl font-extrabold text-blue-700">HelloQuip</h1>
//           <button className="text-gray-700 hover:text-blue-600">
//             <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                 d="M5.121 17.804A8.002 8.002 0 0112 15a8.002 8.002 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//             </svg>
//           </button>
//         </div>
//       </header>

//       {/* Search */}
//       <section className="bg-blue-50 pt-16 pb-8">
//         <div className="max-w-3xl mx-auto px-4 text-center">
//           <h2 className="text-xl font-semibold text-gray-800 mb-4">What are you looking for?</h2>
//           <SearchBar />
//         </div>
//       </section>


//       {/* Categories (Firebase) */}
//       <section className="bg-white py-12">
//         <div className="max-w-7xl mx-auto px-2">
//           <Categories />
//         </div>
//       </section>





//       {/* Trending Products */}
//       <TrendingProducts />

//       {/* Featured Products */}
//       <FeaturedProducts />

      
 


//     </main>
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
import Footer from "@/components/Footer";
import Head from 'next/head';

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searching, setSearching] = useState(false);

   // const [selectedCategory, setSelectedCategory] = useState("all");
   const [selectedCategory, setSelectedCategory] = useState("All Products");



  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllProducts(products);
      setFilteredProducts(products);
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

          <><Head>
      <title>My PWA App</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="manifest" href="/manifest.json" />
      <meta name="theme-color" content="#0f4a73" />
    </Head>
    
    <main className="pb-20 bg-gray-50 text-gray-900 font-sans">
        {/* Header with title and search bar */}
        <header className="bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-extrabold text-blue-500">HELLOQUIP</h1>
              <button className="text-gray-700 hover:text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5.121 17.804A8.002 8.002 0 0112 15a8.002 8.002 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            <div className="mt-2">
              <SearchBar
                onSearch={handleSearch}
                className="w-full rounded-full bg-blue-50 px-4 py-2 focus:outline-none focus:ring focus:ring-blue-200" />
            </div>
          </div>
        </header>

        {/* Search Results */}
        {searching && (
          <section className="bg-white py-12">
            <div className="max-w-7xl mx-auto px-4">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Search Results</h3>
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
                          className="w-full h-full object-cover" />
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





        {/* Categories */}
        <section className="bg-white py-2">
          <div className="max-w-7xl mx-auto px-1">
            {/* <Categories /> */}
            <Categories onCategorySelect={setSelectedCategory} />
          </div>

          {/* Trending */}
          <TrendingProducts />

        </section>

        {/* Featured */}
        {/* {!searching && <FeaturedProducts />} */}
        <FeaturedProducts selectedCategory={selectedCategory} />



        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t border-gray-200 z-50">
          <div className="flex justify-between items-center px-4 py-2 text-xs text-gray-600">
            <button className="flex flex-col items-center flex-1 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M13 5v6h6m-6 0v6H5v-6h6z" />
              </svg>
              Home
            </button>
            <button className="flex flex-col items-center flex-1 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Categories
            </button>
            <button className="flex flex-col items-center flex-1 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8s-9-3.582-9-8 4.03-8 9-8 9 3.582 9 8z" />
              </svg>
              Messenger
            </button>
            <button className="flex flex-col items-center flex-1 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v2H3V3zm2 4h14l1.6 9.59a2 2 0 01-2 2.41H7.4a2 2 0 01-2-2.41L7 7z" />
              </svg>
              Cart
            </button>
            <button className="flex flex-col items-center flex-1 hover:text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A8.002 8.002 0 0112 15a8.002 8.002 0 016.879 2.804M12 7a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              My Account
            </button>
          </div>
        </nav>


        {/* Footer */}
        <Footer />




      </main></>
  );
}
