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

  // Internet connection check before loading main page components
  const [isOnline, setIsOnline] = useState(true);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  useEffect(() => {
    if (!isClient) return;

    console.log('🔍 Starting internet connection check...');

    // Set checking to false immediately so UI loads normally
    setIsCheckingConnection(false);

    // Simple connection test with timeout
    const testConnection = () => {
      console.log('🌐 Testing internet connection...');
      
      // Use a simple image request that's likely to fail when offline
      const img = new Image();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Connection test timeout - assuming offline');
        setIsOnline(false);
      }, 3000);

      img.onload = () => {
        console.log('✅ Internet connection confirmed');
        clearTimeout(timeoutId);
        setIsOnline(true);
      };

      img.onerror = () => {
        console.log('❌ Internet connection test failed');
        clearTimeout(timeoutId);
        setIsOnline(false);
      };

      // Try to load a small image from a reliable source
      img.src = 'https://www.google.com/favicon.ico?' + Date.now();
    };

    // Check initial connection status
    if (navigator.onLine) {
      console.log('📡 Navigator reports online, testing connection...');
      testConnection();
    } else {
      console.log('📡 Navigator reports offline');
      setIsOnline(false);
    }

    let onlineTimer = null;

    const handleOnline = () => {
      console.log('🌐 Internet connection restored');
      setIsOnline(true);
      
      // Clear any online timers
      if (onlineTimer) {
        clearTimeout(onlineTimer);
        onlineTimer = null;
      }

      // Wait a bit for connection to stabilize, then reload
      onlineTimer = setTimeout(() => {
        if (navigator.onLine) {
          console.log('🔄 Reloading page after internet restoration...');
          window.location.reload();
        }
      }, 2000); // 2 second delay to ensure stable connection
    };

    const handleOffline = () => {
      console.log('📡 Internet connection lost');
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (onlineTimer) clearTimeout(onlineTimer);
    };
  }, [isClient]);

  // Screenshot prevention
  useEffect(() => {
    if (!isClient) return;

    // Prevent right-click context menu
    const preventContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent keyboard shortcuts for screenshots
    const preventScreenshotKeys = (e) => {
      // Prevent Print Screen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+Shift+C (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
      
      // Prevent F12 key
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Prevent Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    // Prevent drag and drop of images
    const preventDrag = (e) => {
      e.preventDefault();
      return false;
    };

    // Prevent selection of text
    const preventSelection = (e) => {
      e.preventDefault();
      return false;
    };

    // Mobile-specific screenshot prevention
    const preventMobileScreenshot = (e) => {
      // Prevent long press (context menu on mobile)
      e.preventDefault();
      return false;
    };

    // Prevent mobile screenshot gestures
    const preventMobileGestures = (e) => {
      // Prevent pinch to zoom (can be used for screenshots)
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
        return false;
      }
    };

    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      console.log('📱 Mobile device detected - applying enhanced screenshot protection');
      
      // Add mobile-specific event listeners
      document.addEventListener('touchstart', preventMobileScreenshot, { passive: false });
      document.addEventListener('touchmove', preventMobileGestures, { passive: false });
      document.addEventListener('touchend', preventMobileScreenshot, { passive: false });
      
      // Prevent mobile context menu
      document.addEventListener('contextmenu', preventMobileScreenshot);
      
      // Disable viewport zooming (can help with screenshots)
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      }
    }

    // Add event listeners
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventScreenshotKeys);
    document.addEventListener('dragstart', preventDrag);
    document.addEventListener('selectstart', preventSelection);

    // Add CSS to prevent selection
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-user-drag: none !important;
        -khtml-user-select: none !important;
      }
      
      /* Allow selection in input fields and textareas */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: none !important;
        user-select: text !important;
      }
      
      /* Prevent image dragging */
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
      
      /* Disable text selection on specific elements */
      .no-select {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      /* Mobile-specific protections */
      @media (max-width: 768px) {
        body {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          touch-action: manipulation !important;
        }
        
        /* Prevent mobile text selection */
        p, h1, h2, h3, h4, h5, h6, span, div {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        
        /* Allow selection only in form inputs */
        input, textarea, select {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventScreenshotKeys);
      document.removeEventListener('dragstart', preventDrag);
      document.removeEventListener('selectstart', preventSelection);
      
      if (isMobile) {
        document.removeEventListener('touchstart', preventMobileScreenshot);
        document.removeEventListener('touchmove', preventMobileGestures);
        document.removeEventListener('touchend', preventMobileScreenshot);
      }
      
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, [isClient]);

  // 15-second timeout for loading (only when online)
  useEffect(() => {
    if (!isClient || !isOnline || isCheckingConnection) return;

    const timeout = setTimeout(() => {
      if (showLoading) {
        console.log('⏰ Loading timeout reached (15s), forcing completion');
        setFeaturedProductsLoaded(true);
        setCategoriesLoaded(true);
        setLoading(false);
      }
    }, 15000); // 15 seconds

    return () => clearTimeout(timeout);
  }, [isClient, showLoading, isOnline, isCheckingConnection]);

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

      {/* Offline Dialog Overlay */}
      {!isOnline && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8 max-w-md w-full text-center transform transition-all duration-300 scale-100">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Internet Connection</h2>
              <p className="text-gray-600 mb-6">
                Please check your internet connection and try again. The app requires an internet connection to function properly.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🔄 Retry Connection
              </button>
              <p className="text-xs text-gray-500">
                The page will automatically reload when your connection is restored.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
