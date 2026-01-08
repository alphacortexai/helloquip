"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cacheUtils, CACHE_KEYS, CACHE_DURATIONS } from "@/lib/cacheUtils";
import CachedLogo from "@/components/CachedLogo";

import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import dynamic from "next/dynamic";
import { useDisplaySettings } from "@/lib/useDisplaySettings";
import LoadingScreen from "@/components/LoadingScreen";
import SkeletonLoader from "@/components/SkeletonLoader";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";

// Priority 1: Critical above-the-fold content (SSR enabled)
const TrendingProducts = dynamic(() => import("@/components/TrendingProducts"), {
  ssr: true,
  loading: () => (
    <div className="bg-gray-50 rounded-2xl shadow-sm p-4">
      <SkeletonLoader type="trending" />
    </div>
  ),
});

// Priority 2: Main content (SSR enabled for better LCP)
const FeaturedProducts = dynamic(() => import("@/components/FeaturedProducts"), {
  ssr: true,
  loading: () => (
    <section className="bg-gray/70 pt-0 md:pt-3 pb-0 relative" data-featured-products>
      <div className="max-w-7xl mx-auto px-0">
        <div className="min-h-[2000px] md:min-h-[1500px]">
          <SkeletonLoader type="product-grid" />
        </div>
      </div>
    </section>
  ),
});

// Priority 3: Secondary content (deferred loading)
const Categories = dynamic(() => import("@/components/Categories"), {
  ssr: true,
  loading: () => (
    <div className="bg-gray-50 rounded-2xl shadow-sm p-4 mt-2">
      <h2 className="text-xl font-bold text-gray-800 mb-3">Categories</h2>
      <SkeletonLoader type="category" />
    </div>
  ),
});

// Priority 4: Non-critical content (client-side only)
const Testimonials = dynamic(() => import("@/components/Testimonials"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <SkeletonLoader type="testimonials" />
    </div>
  ),
});

const ProductRecommendations = dynamic(() => import("@/components/ProductRecommendations"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <SkeletonLoader type="recommendations" />
    </div>
  ),
});

export default function Home() {
  const { loading: settingsLoading } = useDisplaySettings();
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [loading, setLoading] = useState(true);
  const [featuredProductsLoaded, setFeaturedProductsLoaded] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [trendingProductsLoaded, setTrendingProductsLoaded] = useState(false);
  const [allProductsLoaded, setAllProductsLoaded] = useState(false);
  const [recommendationsLoaded, setRecommendationsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [showLoadingScreen, setShowLoadingScreen] = useState(false);
  
  // Progressive loading states
  const [criticalContentLoaded, setCriticalContentLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setTimeout(() => {
      document.documentElement.classList.add('loaded');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (trendingProductsLoaded && categoriesLoaded) {
      setCriticalContentLoaded(true);
    }
  }, [trendingProductsLoaded, categoriesLoaded]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const navEntry = performance.getEntriesByType('navigation')[0];
      const isBackForward = navEntry && navEntry.type === 'back_forward';
      const shownThisSession = sessionStorage.getItem('loadingScreenShown') === '1';
      if (!shownThisSession && !isBackForward) {
        setShowLoadingScreen(true);
        sessionStorage.setItem('loadingScreenShown', '1');
      } else {
        setShowLoadingScreen(false);
      }
    } catch {
      setShowLoadingScreen(false);
    }
  }, []);

  useEffect(() => {
    if (!showLoadingScreen) return;
    if (criticalContentLoaded) {
      const timer = setTimeout(() => {
        setShowLoadingScreen(false);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showLoadingScreen, criticalContentLoaded]);

  useEffect(() => {
    if (!isClient) return;
    const fetchProducts = async () => {
      const cachedProducts = cacheUtils.getCache(CACHE_KEYS.MAIN_PRODUCTS, CACHE_DURATIONS.MAIN_PRODUCTS);
      if (cachedProducts) {
        setAllProducts(cachedProducts);
        setLoading(false);
        setAllProductsLoaded(true);
        return;
      }
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllProducts(products);
        setAllProductsLoaded(true);
        cacheUtils.setCache(CACHE_KEYS.MAIN_PRODUCTS, products, CACHE_DURATIONS.MAIN_PRODUCTS);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#2e4493] flex items-center justify-center">
        <CachedLogo variant="loading" width={64} height={64} priority={true} className="h-16 w-auto" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Heloquip - Quality Medical Equipment</title>
        <meta name="description" content="Your trusted partner for medical equipment in Uganda" />
      </Head>

      {showLoadingScreen && (
        <LoadingScreen onComplete={() => setShowLoadingScreen(false)} />
      )}

      {!showLoadingScreen && (
        <div className="min-h-screen bg-gray-50" data-page="home">
          {/* Desktop Layout */}
          <div className="hidden md:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Hero Section - Grid Layout */}
              <div className="grid grid-cols-12 gap-6 mb-12">
                {/* Sidebar Categories */}
                <aside className="col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 h-fit sticky top-24">
                  <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <span className="w-1.5 h-6 bg-[#2e4493] rounded-full mr-3"></span>
                    Categories
                  </h2>
                  <Categories 
                    onCategorySelect={setSelectedCategory} 
                    onLoadComplete={() => setCategoriesLoaded(true)}
                  />
                </aside>

                {/* Main Hero Content */}
                <main className="col-span-6 space-y-6">
                  {/* Trending Slider */}
                  <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden h-[400px] relative group">
                    <TrendingProducts onLoadComplete={() => setTrendingProductsLoaded(true)} />
                  </section>

                  {/* Quick Stats/Features */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                      <p className="text-[#2e4493] font-bold text-lg">100%</p>
                      <p className="text-blue-600 text-xs font-medium">Genuine Products</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-2xl border border-green-100 text-center">
                      <p className="text-green-700 font-bold text-lg">Fast</p>
                      <p className="text-green-600 text-xs font-medium">Delivery</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-center">
                      <p className="text-purple-700 font-bold text-lg">24/7</p>
                      <p className="text-purple-600 text-xs font-medium">Support</p>
                    </div>
                  </div>
                </main>

                {/* Right Side - Featured Deal */}
                <aside className="col-span-3 space-y-6">
                  <section className="bg-gradient-to-br from-[#2e4493] to-[#1a2a5e] rounded-3xl p-8 text-white h-[400px] flex flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                      <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Limited Offer</span>
                      <h3 className="text-3xl font-bold mt-4 leading-tight">Premium Medical Supplies</h3>
                      <p className="text-blue-100 mt-4 text-sm">Get up to 20% off on selected diagnostic equipment this week.</p>
                    </div>
                    <button 
                      onClick={() => window.location.href = '/search'}
                      className="relative z-10 bg-white text-[#2e4493] w-full py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-lg active:scale-95"
                    >
                      Shop Now
                    </button>
                    <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                  </section>

                  <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-2">Need Help?</h4>
                    <p className="text-gray-500 text-xs mb-4">Our experts are ready to assist you with your purchase.</p>
                    <button className="text-[#2e4493] text-sm font-bold hover:underline">Contact Support →</button>
                  </div>
                </aside>
              </div>

              {/* Featured Products Section */}
              <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
                  <button className="text-[#2e4493] font-semibold hover:underline">View All</button>
                </div>
                <FeaturedProducts 
                  selectedCategory={selectedCategory} 
                  onLoadComplete={() => setFeaturedProductsLoaded(true)}
                />
              </section>

              {/* Testimonials Section */}
              <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-12 mb-16">
                <Testimonials />
              </section>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="block md:hidden px-4 py-6 space-y-6">
            <section>
              <Categories 
                onCategorySelect={setSelectedCategory} 
                onLoadComplete={() => setCategoriesLoaded(true)}
              />
            </section>
            <section className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <TrendingProducts onLoadComplete={() => setTrendingProductsLoaded(true)} />
            </section>
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <FeaturedProducts 
                selectedCategory={selectedCategory} 
                onLoadComplete={() => setFeaturedProductsLoaded(true)}
              />
            </section>
            <section className="bg-white rounded-2xl shadow-sm p-6">
              <Testimonials />
            </section>
          </div>
        </div>
      )}
      <SpeedInsights />
    </>
  );
}
