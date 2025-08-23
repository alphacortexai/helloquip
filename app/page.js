"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Categories from "@/components/Categories";
import Testimonials from "@/components/Testimonials";
import dynamic from "next/dynamic";
import { useDisplaySettings } from "@/lib/useDisplaySettings";
import { useScrollPosition } from "@/lib/useScrollPosition";

const TrendingProducts = dynamic(() => import("@/components/TrendingProducts"), {
  loading: () => <div className="text-center py-10">Loading trending products...</div>,
});

const FeaturedProducts = dynamic(() => import("@/components/FeaturedProducts"), {
  loading: () => <div className="text-center py-10">Loading featured products...</div>,
});

export default function Home() {
  const { loading: settingsLoading } = useDisplaySettings();
  const { restoreScrollPosition } = useScrollPosition();
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [loading, setLoading] = useState(true);
  const [featuredProductsLoaded, setFeaturedProductsLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Check if we're on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to clear cache and refresh data
  const refreshData = () => {
    if (!isClient) return;
    
    console.log('🔄 Manually refreshing data...');
    
    try {
      sessionStorage.removeItem('mainPageProducts');
      sessionStorage.removeItem('mainPageProductsTimestamp');
      setLoading(true);
    } catch (error) {
      console.warn('Error clearing cache:', error);
    }
  };

  // Listen for page visibility changes to refresh stale cache
  useEffect(() => {
    if (!isClient) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        try {
          const timestamp = sessionStorage.getItem('mainPageProductsTimestamp');
          if (timestamp) {
            const age = Date.now() - parseInt(timestamp);
            // If cache is older than 10 minutes, refresh
            if (age > 10 * 60 * 1000) {
              console.log('🔄 Page became visible, cache is stale, refreshing...');
              refreshData();
            }
          }
        } catch (error) {
          console.warn('Error checking cache age:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isClient]);

  // Restore scroll position when returning to main page
  useEffect(() => {
    if (isClient && featuredProductsLoaded && categoriesLoaded) {
      // Small delay to ensure products are rendered
      const timer = setTimeout(() => {
        restoreScrollPosition();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isClient, featuredProductsLoaded, categoriesLoaded, restoreScrollPosition]);

  useEffect(() => {
    if (!isClient) return;

    const fetchProducts = async () => {
      // Check if we have cached products first
      const cachedProducts = sessionStorage.getItem('mainPageProducts');
      const cachedTimestamp = sessionStorage.getItem('mainPageProductsTimestamp');
      
      // Use cache if it's less than 30 minutes old
      const isCacheValid = cachedProducts && cachedTimestamp && 
        (Date.now() - parseInt(cachedTimestamp)) < 30 * 60 * 1000;
      
      if (isCacheValid) {
        try {
          const parsed = JSON.parse(cachedProducts);
          setAllProducts(parsed);
          setLoading(false);
          console.log('📦 Using cached products:', parsed.length);
          return;
        } catch (error) {
          console.warn('Failed to parse cached products, fetching fresh data');
        }
      }
      
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        setAllProducts(products);
        
        // Cache the products for future use
        sessionStorage.setItem('mainPageProducts', JSON.stringify(products));
        sessionStorage.setItem('mainPageProductsTimestamp', Date.now().toString());
        
        console.log('📦 Fetched and cached products:', products.length);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isClient]);

  // Check if all components are loaded
  const allComponentsLoaded = featuredProductsLoaded && categoriesLoaded;

  // Show loading spinner only when components are loading
  const showLoading = loading || !allComponentsLoaded;

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#2e4493] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Loading Spinner */}
      {showLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading main page components...</p>
            <div className="mt-2 text-sm text-gray-500">
              {!featuredProductsLoaded && <div>Featured Products...</div>}
              {!categoriesLoaded && <div>Categories...</div>}
            </div>
            {/* Refresh button for manual cache refresh */}
            <button
              onClick={refreshData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      )}

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
                <Categories 
                  onCategorySelect={setSelectedCategory} 
                  onLoadComplete={() => setCategoriesLoaded(true)}
                />
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
                <FeaturedProducts 
                  selectedCategory={selectedCategory} 
                  onLoadComplete={() => setFeaturedProductsLoaded(true)}
                />
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
              <Categories 
                onCategorySelect={setSelectedCategory} 
                onLoadComplete={() => setCategoriesLoaded(true)}
              />
            </div>

            {/* Trending Products */}
            <section className="bg-white rounded-xl mb-1">
              <h2 className="hidden text-xl font-bold text-gray-800 mb-3 px-2">Trending Products</h2>
              <TrendingProducts />
            </section>

            {/* Featured Products */}
            <section className="mb-1">
              <h2 className="hidden text-xl font-bold text-gray-800 mb-3 px-2">Featured Products</h2>
              <FeaturedProducts 
                selectedCategory={selectedCategory} 
                onLoadComplete={() => setFeaturedProductsLoaded(true)}
              />
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
