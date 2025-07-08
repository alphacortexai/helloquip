"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";


import Categories from "@/components/Categories";
// import TrendingProducts from "@/components/TrendingProducts";
// import FeaturedProducts from "@/components/FeaturedProducts";

import dynamic from "next/dynamic";

const TrendingProducts = dynamic(() => import("@/components/TrendingProducts"), {
  loading: () => <div className="text-center py-10">Loading trending products...</div>,
});
const FeaturedProducts = dynamic(() => import("@/components/FeaturedProducts"), {
  loading: () => <div className="text-center py-10">Loading featured products...</div>,
});


export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
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
      {/* Spinner */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
        </div>
      )}

      {/* Layout */}
      <div className="md:flex md:min-h-screen md:max-w-7xl md:mx-auto md:pt-4">
        {/* Sidebar */}
        <aside className="md:w-64 md:pr-4 hidden md:block sticky top-16 h-fit">


          <Categories onCategorySelect={setSelectedCategory} />
        </aside>

        {/* Mobile Categories */}
        <div className="block md:hidden bg-white/70 py-2 rounded-xl ml-2 mr-2 mt-1">
          <div className="max-w-7xl mx-auto px-1">
            <Categories onCategorySelect={setSelectedCategory} />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1">
          {searching ? (
            <section className="bg-white py-12">
              <div className="px-4">
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
                          <p className="text-sm text-gray-900 mt-2">
                            {product.name}
                          </p>
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
          ) : (
            <>
              <TrendingProducts />
              <FeaturedProducts selectedCategory={selectedCategory} />
            </>
          )}
        </main>
      </div>
    </>
  );
}
