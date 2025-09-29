"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cacheUtils, CACHE_KEYS, CACHE_DURATIONS } from "@/lib/cacheUtils";

import Categories from "@/components/Categories";
import Testimonials from "@/components/Testimonials";
import RecentlyViewedProducts from "@/components/RecentlyViewedProducts";
import ProductRecommendations from "@/components/ProductRecommendations";
import dynamic from "next/dynamic";
import { useDisplaySettings } from "@/lib/useDisplaySettings";
import LoadingScreen from "@/components/LoadingScreen";
import SkeletonLoader from "@/components/SkeletonLoader";

const TrendingProducts = dynamic(() => import("@/components/TrendingProducts"), {
  loading: () => (
    <div className="bg-white rounded-xl p-4">
      <SkeletonLoader type="trending" />
    </div>
  ),
});

const FeaturedProducts = dynamic(() => import("@/components/FeaturedProducts"), {
  loading: () => (
    <div className="bg-gray/70 pt-0 md:pt-3 pb-0 relative">
      <div className="max-w-7xl mx-auto px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonLoader key={i} type="product-card" />
          ))}
        </div>
      </div>
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolledAllProducts, setHasScrolledAllProducts] = useState(false);


  // Check if we're on client side
  useEffect(() => {
    setIsClient(true);
    
    // Show content when loading screen is ready
    const timer = setTimeout(() => {
      document.documentElement.classList.add('loaded');
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Decide whether to show the loading screen for this session (once per browser session)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const shownThisSession = sessionStorage.getItem('loadingScreenShown') === '1';
      if (!shownThisSession) {
        setShowLoadingScreen(true);
        sessionStorage.setItem('loadingScreenShown', '1');
      }
    } catch {}
  }, []);

  // Hide loading screen when components are ready or after minimum time
  useEffect(() => {
    if (!showLoadingScreen) return;
    const timer = setTimeout(() => {
      setShowLoadingScreen(false);
    }, 2500); // Minimum 2.5 seconds for loading screen to show logo properly
    
    return () => clearTimeout(timer);
  }, [showLoadingScreen]);

  // Also hide loading screen when all components are loaded (if faster than 2.5 seconds)
  useEffect(() => {
    if (!showLoadingScreen) return;
    console.log('🔍 Loading states:', {
      featuredProductsLoaded,
      categoriesLoaded,
      trendingProductsLoaded,
      allProductsLoaded,
      recommendationsLoaded,
      loading,
      showLoadingScreen
    });
    
    if (featuredProductsLoaded && categoriesLoaded && trendingProductsLoaded && allProductsLoaded && recommendationsLoaded && !loading) {
      const timer = setTimeout(() => {
        console.log('✅ All components loaded, hiding loading screen');
        setShowLoadingScreen(false);
      }, 0); // No delay - hide immediately when all components are loaded
      
      return () => clearTimeout(timer);
    }
  }, [featuredProductsLoaded, categoriesLoaded, trendingProductsLoaded, allProductsLoaded, recommendationsLoaded, loading, showLoadingScreen]);

  // Function to clear cache and refresh data
  const refreshData = () => {
    if (!isClient) return;
    
    console.log('🔄 Manually refreshing data...');
    
    try {
      cacheUtils.clearCache(CACHE_KEYS.MAIN_PRODUCTS);
      setLoading(true);
      
      // Force refresh the page data
      const fetchProducts = async () => {
        try {
          const snapshot = await getDocs(collection(db, "products"));
          const products = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          setAllProducts(products);
          
          // Cache the products for future use
          cacheUtils.setCache(CACHE_KEYS.MAIN_PRODUCTS, products, CACHE_DURATIONS.MAIN_PRODUCTS);
          
          console.log('📦 Fetched and cached products:', products.length);
        } catch (error) {
          console.error("Error fetching products:", error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchProducts();
    } catch (error) {
      console.error('Error refreshing data:', error);
      setLoading(false);
    }
  };

  // Listen for page visibility changes to refresh stale cache
  useEffect(() => {
    if (!isClient) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        try {
          const cacheAge = cacheUtils.getCacheAge(CACHE_KEYS.MAIN_PRODUCTS);
          if (cacheAge !== null && cacheAge > 10 * 60) { // 10 minutes in seconds
            console.log('🔄 Page became visible, cache is stale, refreshing...');
            refreshData();
          }
        } catch (error) {
          console.warn('Error checking cache age:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    const fetchProducts = async () => {
      // Check if we have cached products first
      const cachedProducts = cacheUtils.getCache(CACHE_KEYS.MAIN_PRODUCTS, CACHE_DURATIONS.MAIN_PRODUCTS);
      
      if (cachedProducts) {
        setAllProducts(cachedProducts);
        setLoading(false);
        setAllProductsLoaded(true);
        console.log('📦 Using cached products:', cachedProducts.length);
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
        
        // Cache the products for future use
        cacheUtils.setCache(CACHE_KEYS.MAIN_PRODUCTS, products, CACHE_DURATIONS.MAIN_PRODUCTS);
        
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

  // Internet connection check before loading main page components
  const [isOnline, setIsOnline] = useState(true);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  useEffect(() => {
    if (!isClient) return;

    // Check internet connection
    const checkConnection = async () => {
      try {
        const response = await fetch('https://www.google.com/favicon.ico', { 
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        setIsOnline(true);
      } catch (error) {
        console.log('📡 No internet connection detected');
        setIsOnline(false);
      } finally {
        setIsCheckingConnection(false);
      }
    };

    checkConnection();

    // Set up online/offline event listeners
    const handleOnline = () => {
      console.log('🌐 Internet connection restored');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('📡 Internet connection lost');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isClient]);

  // Show connection status and handle loading
  useEffect(() => {
    if (!isClient) return;

    if (!isCheckingConnection && !isOnline) {
      // Show offline message and prevent loading
      console.log('📡 Offline - preventing component loading');
      return;
    }

    if (!isCheckingConnection && isOnline) {
      // Online - allow normal loading
      console.log('🌐 Online - allowing component loading');
    }
  }, [isClient, showLoading, isOnline, isCheckingConnection]);

  // Basic mobile screenshot prevention only
  useEffect(() => {
    if (!isClient) return;

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('📱 Mobile device detected - applying basic screenshot protection');
      
      // Only prevent context menu, allow all touch events for scrolling
      const preventContextMenu = (e) => {
        e.preventDefault();
      };

      document.addEventListener('contextmenu', preventContextMenu);
      
      return () => {
        document.removeEventListener('contextmenu', preventContextMenu);
      };
    }
  }, [isClient]);

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#2e4493] flex items-center justify-center">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/helloquip-80e20.firebasestorage.app/o/HQlogo3.png?alt=media&token=22b28cda-b3db-4508-a374-9c374d2a4294"
          alt="HeloQuip Logo"
          className="h-16 w-auto"
        />
      </div>
    );
  }

  return (
    <>
      {/* Always show loading screen first to prevent content flash */}
      {showLoadingScreen && (
        <LoadingScreen onComplete={() => setShowLoadingScreen(false)} />
      )}

      {/* Main Layout - Only render when loading screen is hidden */}
      {!showLoadingScreen && (
        <div className="min-h-screen bg-[#2e4493] overflow-hidden">
        {/* Desktop Layout */}
        <div className="hidden md:block">
          <div className="max-w-7xl mx-auto px-1 py-3">
            {/* Top Row - Categories, Trending Products, and Featured Deal */}
            <div className="grid grid-cols-[280px_1fr_300px] gap-3 mb-4">
              {/* Categories */}
              <section className="bg-gray-50 rounded-2xl shadow-sm p-4 mt-2">
                <h2 className="text-xl font-bold text-gray-800 mb-3">Categories</h2>
                <Categories 
                  onCategorySelect={setSelectedCategory} 
                  onLoadComplete={() => setCategoriesLoaded(true)}
                />
              </section>

              {/* Trending Products */}
              <section className="bg-gray-50 rounded-2xl shadow-sm p-4">
                <TrendingProducts onLoadComplete={() => setTrendingProductsLoaded(true)} />
              </section>

              {/* Featured Deal */}
              <section className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white h-[444px]">
                <div className="h-full flex flex-col justify-center items-center text-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Special Offer</h3>
                    <p className="text-lg mb-6">Get 20% off on all medical equipment this month!</p>
                    <button className="bg-white text-green-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                      Shop Now
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Featured Products */}
            <section className="mb-4">
              <FeaturedProducts 
                selectedCategory={selectedCategory} 
                onLoadComplete={() => setFeaturedProductsLoaded(true)}
                onScrollProgressChange={(progress, hasScrolledAll) => {
                  setScrollProgress(progress);
                  setHasScrolledAllProducts(hasScrolledAll);
                }}
              />
            </section>

            {/* Bottom Row - Product Recommendations and Testimonials */}
            <div className="grid grid-cols-[1fr_300px] gap-3">
              {/* Product Recommendations */}
              <ProductRecommendations limit={6} onLoadComplete={() => setRecommendationsLoaded(true)} />

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
            <div className="bg-white rounded-xl py-3 mb-1 mt-2">
              <Categories 
                onCategorySelect={setSelectedCategory} 
                onLoadComplete={() => setCategoriesLoaded(true)}
              />
            </div>

            {/* Trending Products */}
            <section className="bg-white rounded-xl mb-1">
              <h2 className="hidden text-xl font-bold text-gray-800 mb-3 px-2">Trending Products</h2>
              <TrendingProducts onLoadComplete={() => setTrendingProductsLoaded(true)} />
            </section>

            {/* Featured Products */}
            <section className="mb-1">
              <h2 className="hidden text-xl font-bold text-gray-800 mb-3 px-2">Featured Products</h2>
              <FeaturedProducts 
                selectedCategory={selectedCategory} 
                onLoadComplete={() => setFeaturedProductsLoaded(true)}
                onScrollProgressChange={(progress, hasScrolledAll) => {
                  setScrollProgress(progress);
                  setHasScrolledAllProducts(hasScrolledAll);
                }}
              />
            </section>


            {/* Product Recommendations - Mobile */}
            <ProductRecommendations limit={4} onLoadComplete={() => setRecommendationsLoaded(true)} />

            {/* Promotional Banner */}
            <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white mb-4">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Special Offers</h3>
                <p className="text-sm mb-4">Get amazing deals on medical equipment</p>
                <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                  View Offers
                </button>
              </div>
            </section>

            {/* Customer Testimonials - Mobile */}
            <section className="bg-white rounded-xl p-4 mb-4">
              <Testimonials />
            </section>
          </div>
        </div>
        </div>
      )}
    </>
  );
}