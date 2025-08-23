"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Categories from "@/components/Categories";
import Testimonials from "@/components/Testimonials";

import dynamic from "next/dynamic";

const TrendingProducts = dynamic(() => import("@/components/TrendingProducts"), {
  loading: () => <div className="text-center py-10">Loading trending products...</div>,
});
const FeaturedProducts = dynamic(() => import("@/components/FeaturedProducts"), {
  loading: () => <div className="text-center py-10">Loading featured products...</div>,
});

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [loading, setLoading] = useState(true);
  
  // Add Chatbase script
  useEffect(() => {
    const script = document.createElement('script');
    script.innerHTML = `
      (function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="YjfFX_pbiOV68QfZ3kplW";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();
    `;
    document.head.appendChild(script);

    return () => {
      // Cleanup script when component unmounts
      const existingScript = document.querySelector('script[src*="chatbase.co"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  // Alternative: If the script doesn't work, you can use this iframe instead
  // Replace the useEffect above with this iframe in the JSX:
  // <iframe
  //   src="https://www.chatbase.co/chatbot-iframe/YjfFX_pbiOV68QfZ3kplW"
  //   width="100%"
  //   style={{ height: "100%", minHeight: "700px" }}
  //   frameBorder="0"
  // />

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);



  return (
    <>
      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
        </div>
      )}

      {/* Scroll Restoration Indicator */}
      {/* Removed general scroll restoration indicator */}

      {/* Main Layout */}
      <div className="min-h-screen bg-[#2e4493] overflow-hidden">
        {/* Desktop Layout */}
            <div className="hidden md:block">
              <div className="max-w-7xl mx-auto px-1 py-3">
                {/* Top Row - Categories, Trending Products, and Featured Deal */}
                <div className="grid grid-cols-[280px_1fr_300px] gap-3 mb-4">
                  {/* Categories */}
                  <section className="bg-gray-50 rounded-2xl shadow-sm p-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">Categories</h2>
                    <Categories onCategorySelect={setSelectedCategory} />
                  </section>

                  {/* Trending Products */}
                  <section className="bg-gray-50 rounded-2xl shadow-sm p-4">
                    <TrendingProducts />
                  </section>

                  {/* Featured Deal */}
                  <section className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white h-[444px]">
                    <div className="h-full flex flex-col justify-center items-center text-center">
                      <div>
                        <h3 className="text-2xl font-bold mb-3">Featured Deal</h3>
                        <p className="text-lg mb-4">Get up to 50% off on selected medical equipment</p>
                        <ul className="space-y-1 text-sm mb-6 inline-block text-left">
                          <li>• Premium quality equipment</li>
                          <li>• Fast delivery nationwide</li>
                          <li>• Professional support</li>
                        </ul>
                      </div>
                      <button className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                        View Deal
                      </button>
                    </div>
                  </section>
                </div>

                {/* Featured Products */}
                <div className="space-y-4">
                  <section className="bg-white rounded-2xl shadow-sm p-4">
                    <FeaturedProducts selectedCategory={selectedCategory} />
                  </section>

                  {/* New Arrivals */}
                  <section className="bg-gray-50 rounded-2xl shadow-sm p-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">New Arrivals</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Placeholder for new arrivals */}
                      <div className="text-center py-6 text-gray-500">
                        <p>New products coming soon...</p>
                      </div>
                    </div>
                  </section>

                  {/* Customer Testimonials */}
                  <section className="bg-white rounded-2xl shadow-sm p-4">
                    <Testimonials />
                  </section>
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="block md:hidden">
              <div className="px-1 py-1">
                {/* Mobile Categories */}
                <div className="bg-white rounded-xl py-3 mb-1">
                  <Categories onCategorySelect={setSelectedCategory} />
                </div>

                {/* Trending Products */}
                <section className="bg-white rounded-xl mb-1">
                  <h2 className="hidden text-xl font-bold text-gray-800 mb-3 px-2">Trending Products</h2>
                  <TrendingProducts />
                </section>

                {/* Featured Products */}
                <section className="mb-1">
                  <h2 className="hidden text-xl font-bold text-gray-800 mb-3 px-2">Featured Products</h2>
                  <FeaturedProducts selectedCategory={selectedCategory} />
                </section>

                {/* Promotional Banner */}
                <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white mb-4">
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">Special Offers</h3>
                    <p className="text-sm mb-3">Get up to 50% off on selected medical equipment</p>
                    <button className="bg-white text-blue-600 px-6 py-2 rounded-full text-sm font-semibold">
                      Shop Now
                    </button>
                  </div>
                </section>

                {/* Customer Testimonials */}
                <section className="bg-white rounded-xl p-4 mb-4">
                  <Testimonials />
                </section>
              </div>
            </div>

      </div>
    </>
  );
}
