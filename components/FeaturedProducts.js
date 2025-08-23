



"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";
import { useDisplaySettings } from "@/lib/useDisplaySettings";

// Helper to decode URL and pick preferred size
const getPreferredImageUrl = (imageUrl, customResolution = null) => {
  if (!imageUrl) return null;

  // If it's a string, decode and return
  if (typeof imageUrl === "string") {
    try {
      return decodeURIComponent(imageUrl);
    } catch {
      return imageUrl;
    }
  }

  // If it's an object with sizes, use custom resolution or fallback
  if (typeof imageUrl === "object") {
    let preferred;
    
    if (customResolution && imageUrl[customResolution]) {
      preferred = imageUrl[customResolution];
    } else {
      // Fallback to 200x200 or original or first available
      preferred = imageUrl["200x200"] || imageUrl["original"] || Object.values(imageUrl)[0];
    }
    
    try {
      return decodeURIComponent(preferred);
    } catch {
      return preferred;
    }
  }

  return null;
};

export default function FeaturedProducts({ selectedCategory, keyword, tags, manufacturer, name, onLoadComplete }) {
  const { featuredCardResolution, loading: settingsLoading } = useDisplaySettings();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [trendingProductIds, setTrendingProductIds] = useState(new Set());
  const router = useRouter();
  const batchSize = 24;

  // Simple caching for main page
  const [isCached, setIsCached] = useState(false);
  const [hasRestoredScroll, setHasRestoredScroll] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false); // Prevent multiple initializations
  
  // Check if we have cached data on main page
  useEffect(() => {
    if (window.location.pathname === '/') {
      const cachedState = sessionStorage.getItem('featuredProductsState');
      if (cachedState) {
        const state = JSON.parse(cachedState);
        const isExpired = Date.now() - state.timestamp > 5 * 60 * 1000; // 5 minutes
        
        if (!isExpired && products.length === 0) {
          setIsCached(true);
          console.log('Using cached featured products state');
        }
      }
    }
  }, [products.length]);

  // Smart caching: Save all currently loaded products to cache
  const saveProductsToCache = useCallback(() => {
    if (window.location.pathname === '/') {
      const cacheData = {
        products: products,
        lastVisible: lastVisible,
        hasMore: hasMore,
        timestamp: Date.now(),
        totalProductsLoaded: products.length
      };
      
      // Save to sessionStorage
      sessionStorage.setItem('featuredProductsCache', JSON.stringify(cacheData));
      console.log(`💾 Cached ${products.length} products for future restoration`);
    }
  }, [products, lastVisible, hasMore]);

  // Load products from cache if available
  const loadProductsFromCache = useCallback(async () => {
    try {
      const cachedData = sessionStorage.getItem('featuredProductsCache');
      if (cachedData) {
        const data = JSON.parse(cachedData);
        const isExpired = Date.now() - data.timestamp > 5 * 60 * 1000; // 5 minutes
        
        if (!isExpired && data.products && data.products.length > 0) {
          console.log(`📦 Loading ${data.products.length} products from cache`);
          setProducts(data.products);
          setLastVisible(data.lastVisible);
          setHasMore(data.hasMore);
          return true; // Successfully loaded from cache
        }
      }
      return false; // No cache or expired
    } catch (error) {
      console.error('Error loading from cache:', error);
      return false;
    }
  }, []);

  // Fetch trending product IDs
  const fetchTrendingProductIds = useCallback(async () => {
    try {
      const trendingSnapshot = await getDocs(collection(db, "trendingProducts"));
      const trendingIds = new Set(trendingSnapshot.docs.map(doc => doc.data().productId));
      setTrendingProductIds(trendingIds);
    } catch (error) {
      console.error("Error fetching trending product IDs:", error);
    }
  }, []);

  const fetchProducts = useCallback(
    async (startAfterDoc = null, reset = false) => {
      setLoading(true);
      try {
        const constraints = [orderBy("name")]; // No category filtering anymore

        if (startAfterDoc) {
          constraints.push(startAfter(startAfterDoc));
        }

        constraints.push(limit(batchSize));

        const q = query(collection(db, "products"), ...constraints);
        const querySnapshot = await getDocs(q);

        const fetchedProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter by similarity
        let filteredProducts = fetchedProducts;

        if (keyword || name || manufacturer || (tags && tags.length)) {
          const lowerKeyword = keyword?.trim().toLowerCase();
          const lowerName = name?.trim().toLowerCase();
          const lowerManufacturer = manufacturer?.trim().toLowerCase();
          const tagSet = new Set((tags || []).map((tag) => tag.toLowerCase()));

          filteredProducts = fetchedProducts.filter((product) => {
            const nameMatch =
              lowerKeyword && product.name?.toLowerCase().includes(lowerKeyword);
            const descMatch =
              lowerKeyword &&
              product.description?.toLowerCase().includes(lowerKeyword);
            const nameSimMatch =
              lowerName && product.name?.toLowerCase().includes(lowerName);
            const manufacturerMatch =
              lowerManufacturer &&
              product.manufacturer?.toLowerCase().includes(lowerManufacturer);
            const tagMatch =
              product.tags &&
              Array.isArray(product.tags) &&
              product.tags.some((tag) => tagSet.has(tag.toLowerCase()));

            return (
              nameMatch ||
              descMatch ||
              nameSimMatch ||
              manufacturerMatch ||
              tagMatch
            );
          });
        }

        if (reset) {
          setProducts(filteredProducts);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newUnique = filteredProducts.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newUnique];
          });
        }

        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        const hasMoreProducts = querySnapshot.docs.length === batchSize;
        setHasMore(hasMoreProducts);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
      setLoading(false);
    },
    [keyword, tags, manufacturer, name]
  );

  // Check if we've reached the end of available products in the database
  const checkDatabaseCapacity = useCallback(async () => {
    try {
      // Try to fetch one more batch to see if there are more products
      const testQuery = query(
        collection(db, "products"),
        orderBy("name"),
        startAfter(lastVisible),
        limit(1)
      );
      const testSnapshot = await getDocs(testQuery);
      const hasMoreInDatabase = testSnapshot.docs.length > 0;
      
      if (!hasMoreInDatabase) {
        console.log('📊 Database capacity reached: No more products available');
        setHasMore(false);
      }
      
      return hasMoreInDatabase;
    } catch (error) {
      console.error('Error checking database capacity:', error);
      return false;
    }
  }, [lastVisible]);

  // Smart product loading based on target position - GUARANTEED to reach target
  const loadProductsToTarget = useCallback(async (targetProductCount = 50) => {
    // CRITICAL: Only load to target on main page
    if (window.location.pathname !== '/') {
      console.log('🚫 Not on main page - target loading disabled');
      return;
    }

    // If we already have enough products, no need to load more
    if (products.length >= targetProductCount) {
      console.log(`✅ Already have ${products.length} products (need ${targetProductCount})`);
      return;
    }

    // Calculate how many more we need
    const productsNeeded = targetProductCount - products.length;
    console.log(`📦 Need ${productsNeeded} more products to reach target of ${targetProductCount}`);

    // Load products in batches until we reach the target
    let attempts = 0;
    const maxAttempts = Math.ceil(productsNeeded / batchSize) + 15; // Increased buffer for guaranteed loading
    let consecutiveNoProgress = 0; // Track consecutive attempts with no progress
    
    console.log(`🔄 Starting to load products to target: ${targetProductCount}`);
    
    while (products.length < targetProductCount && hasMore && attempts < maxAttempts) {
      console.log(`🔄 Loading batch ${attempts + 1}: Current ${products.length}, Target ${targetProductCount}`);
      
      // Store current count before loading
      const countBeforeLoad = products.length;
      
      try {
        // Load one batch
        await fetchProducts(lastVisible, false);
        
        // Check if we actually got new products
        if (products.length === countBeforeLoad) {
          consecutiveNoProgress++;
          console.log(`⚠️ No new products loaded (attempt ${consecutiveNoProgress})`);
          
          if (consecutiveNoProgress >= 3) {
            console.log('🚫 Too many consecutive attempts with no progress, checking database capacity...');
            const hasMoreInDatabase = await checkDatabaseCapacity();
            if (!hasMoreInDatabase) {
              console.log('🚫 Database capacity reached, cannot load more products');
              break;
            }
            consecutiveNoProgress = 0; // Reset counter and continue trying
          }
          
          // Wait a bit and try again
          await new Promise(resolve => setTimeout(resolve, 800));
          await fetchProducts(lastVisible, false);
          
          // If still no progress, increment counter
          if (products.length === countBeforeLoad) {
            consecutiveNoProgress++;
            console.log(`⚠️ Still no new products after retry (attempt ${consecutiveNoProgress})`);
          } else {
            consecutiveNoProgress = 0; // Reset counter on success
          }
        } else {
          consecutiveNoProgress = 0; // Reset counter on success
        }
        
        attempts++;
        
        // Small delay between loads to prevent overwhelming the system
        if (attempts < maxAttempts && products.length < targetProductCount) {
          await new Promise(resolve => setTimeout(resolve, 400)); // Increased delay for stability
        }
        
        console.log(`📊 Progress: ${products.length}/${targetProductCount} products loaded (attempt ${attempts})`);
        
      } catch (error) {
        console.error(`❌ Error loading batch ${attempts + 1}:`, error);
        attempts++;
        consecutiveNoProgress++;
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Final check - if we didn't reach target, log warning
    if (products.length < targetProductCount) {
      console.warn(`⚠️ Could not reach target: ${products.length}/${targetProductCount} products loaded`);
      console.warn(`⚠️ This might cause restoration issues. Target was ${targetProductCount}, got ${products.length}`);
      console.warn(`⚠️ Possible reasons: End of database reached, network issues, or insufficient data`);
    } else {
      console.log(`🎯 SUCCESS: Loaded to target: ${products.length}/${targetProductCount} products (attempts: ${attempts})`);
    }
  }, [products.length, hasMore, loading, lastVisible, fetchProducts, batchSize, checkDatabaseCapacity]);

  // Fetch trending product IDs on component mount
  useEffect(() => {
    fetchTrendingProductIds();
  }, [fetchTrendingProductIds]);

  // Call onLoadComplete when component is fully loaded
  useEffect(() => {
    if (!loading && !settingsLoading && products.length > 0 && onLoadComplete) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        onLoadComplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, settingsLoading, products.length, onLoadComplete]);

  // Only reset when search criteria actually change (and respect cache)
  useEffect(() => {
    const searchCriteria = {
      keyword: keyword || "",
      name: name || "",
      manufacturer: manufacturer || "",
      tags: JSON.stringify(tags || [])
    };
    
    // Prevent unnecessary resets by checking if criteria actually changed
    const currentCriteriaString = JSON.stringify(searchCriteria);
    const previousCriteriaString = JSON.stringify({
      keyword: "",
      name: "",
      manufacturer: "",
      tags: "[]"
    });
    
    // Only reset if we're not in the initial state and criteria actually changed
    if (currentCriteriaString !== previousCriteriaString || products.length === 0) {
      setProducts([]);
      setLastVisible(null);
      setHasMore(true);
      
      // Use smart loading for initial load (default 120 products) for guaranteed navigation
      if (window.location.pathname === '/') {
        // FIRST: Try to load from cache (fastest)
        console.log('🔄 Attempting to load initial products from cache...');
        loadProductsFromCache().then(cacheLoaded => {
          if (cacheLoaded) {
            console.log(`✅ Initial load from cache successful: ${products.length} products`);
            // Cache loaded successfully, no need to fetch from database
          } else {
            console.log('🔄 Cache not available, loading from database...');
            // Fallback to database loading
            fetchProducts(null, true).then(() => {
              // After initial load, ensure we have at least 120 products
              if (products.length < 120 && hasMore) {
                console.log('🔄 Initial load: Ensuring we have 120 products for smooth navigation...');
                loadProductsToTarget(120);
              }
            });
          }
        });
      } else {
        // On other pages (like product details), just load a reasonable amount
        console.log('🔄 Loading products for non-main page...');
        fetchProducts(null, true).then(() => {
          // Only load more if we have very few products and we're not already loading
          if (products.length < 24 && hasMore && !loading) {
            console.log('🔄 Loading additional products for non-main page...');
            // Don't call loadProductsToTarget on non-main pages - just fetch directly
            fetchProducts(lastVisible, false);
          }
        });
      }
    }
  }, [
    keyword,
    name,
    manufacturer,
    tags
    // Removed loadProductsToTarget and loadProductsFromCache from dependencies to prevent loops
  ]);

  // Set up scroll listener for infinite loading (ONLY on main page)
  useEffect(() => {
    // CRITICAL: Only enable infinite scroll on main page
    if (window.location.pathname !== '/') {
      console.log('🚫 Not on main page - infinite scroll disabled');
      return;
    }

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const documentHeight = document.body.offsetHeight;
      const threshold = 1000; // Reduced threshold for main page only
      const shouldLoadMore = windowHeight + scrollY >= documentHeight - threshold;
      
      if (shouldLoadMore && !loading && hasMore) {
        // Use smart loading to add 24 more products (batch size)
        const targetCount = products.length + batchSize;
        loadProductsToTarget(targetCount);
      }
    };

    // Add scroll listener
    window.addEventListener("scroll", handleScroll);
    
    // Cleanup function
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadProductsToTarget, loading, hasMore, products.length, batchSize]);

  // Restore saved state when returning to the page - GUARANTEED to work with cached data
  const restoreSavedState = useCallback(async () => {
    // CRITICAL: Only restore on main page - never on any other page!
    if (window.location.pathname !== '/') {
      console.log('🚫 Not on main page - skipping restoration');
      return;
    }
    
    // Only restore once
    if (hasRestoredScroll) {
      console.log('🚫 Already restored - skipping');
      return;
    }
    
    try {
      const savedState = sessionStorage.getItem('featuredProductsState');
      
      // If no saved state, don't do anything (no default scrolling)
      if (!savedState) {
        console.log('No saved state - no restoration needed');
        return;
      }
      
      const state = JSON.parse(savedState);
      const savedProductCount = state.totalProductsLoaded;
      const savedScrollPosition = state.scrollPosition;
      const savedProductIndex = state.productIndex;
      
      console.log(`🎯 Restoring to position: Product ${savedProductIndex + 1} of ${savedProductCount} loaded`);
      
      // FIRST: Try to load products from cache (fastest option)
      console.log('🔄 Attempting to load products from cache...');
      const cacheLoaded = await loadProductsFromCache();
      
      if (cacheLoaded) {
        console.log(`✅ Successfully loaded ${products.length} products from cache`);
        
        // Verify we have enough products for restoration
        if (products.length > savedProductIndex) {
          console.log(`✅ Cache has sufficient products (${products.length}) for index ${savedProductIndex}`);
          
          // Wait for products to render
          console.log('⏳ Waiting for cached products to render...');
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Restore scroll position
          if (savedScrollPosition !== undefined) {
            console.log(`🚀 Restoring scroll position to: ${savedScrollPosition}`);
            window.scrollTo({
              top: savedScrollPosition,
              behavior: 'auto'
            });
            console.log(`✅ Scroll position restored successfully from cache!`);
            
            // Clear the saved state after successful restoration
            sessionStorage.removeItem('featuredProductsState');
            setHasRestoredScroll(true);
            return;
          }
        } else {
          console.log(`⚠️ Cache insufficient: Need index ${savedProductIndex}, have ${products.length} products`);
        }
      }
      
      // FALLBACK: If cache failed or insufficient, load from database
      console.log('🔄 Cache insufficient or failed, loading from database...');
      
      // Calculate target product count based on saved position
      const targetProductCount = Math.max(savedProductCount + 20, savedProductIndex + 30, 80);
      console.log(`🎯 Target product count: ${targetProductCount} (saved: ${savedProductCount}, index: ${savedProductIndex})`);
      
      // Reset products and start fresh loading
      setProducts([]);
      setLastVisible(null);
      setHasMore(true);
      
      // Load initial batch
      console.log('🔄 Loading initial batch from database...');
      await fetchProducts(null, true);
      
      // Now load to target
      console.log(`🔄 Loading to target: ${targetProductCount} products...`);
      await loadProductsToTarget(targetProductCount);
      
      // Wait for products to render
      console.log('⏳ Waiting for products to render...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Final verification
      if (products.length > savedProductIndex) {
        console.log(`✅ Database loading successful: ${products.length} products for index ${savedProductIndex}`);
        
        // Restore scroll position
        if (savedScrollPosition !== undefined) {
          console.log(`🚀 Restoring scroll position to: ${savedScrollPosition}`);
          window.scrollTo({
            top: savedScrollPosition,
            behavior: 'auto'
          });
          console.log(`✅ Scroll position restored successfully from database!`);
          
          // Clear the saved state after successful restoration
          sessionStorage.removeItem('featuredProductsState');
          setHasRestoredScroll(true);
        }
      } else {
        console.error(`❌ Failed to load sufficient products: Need index ${savedProductIndex}, got ${products.length}`);
        setHasRestoredScroll(true);
      }
      
    } catch (error) {
      console.error('Error restoring saved state:', error);
      setHasRestoredScroll(true);
    }
  }, [loadProductsToTarget, hasRestoredScroll, products.length, fetchProducts, loadProductsFromCache]);

  // Restore saved state when component is ready (only on main page)
  useEffect(() => {
    // CRITICAL SAFETY CHECK: Only restore on main page
    if (window.location.pathname !== '/') {
      console.log('🚫 useEffect: Not on main page - skipping restoration trigger');
      return;
    }
    
    // Additional safety: check if we're actually on the main page
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      console.log('🚫 useEffect: Double-check failed - not on main page');
      return;
    }
    
    if (!loading && !settingsLoading && products.length > 0) {
      console.log('🔄 Main page ready - triggering restoration...');
      // Always call restoreSavedState - it will handle default position if no saved data
      restoreSavedState();
    }
  }, [loading, settingsLoading, products.length, restoreSavedState]);

  const handleProductClick = (id) => {
    // Save current state before navigation (only on main page)
    if (window.location.pathname === '/') {
      // Save scroll position and product index
      const currentState = {
        totalProductsLoaded: products.length,
        lastVisible: lastVisible,
        hasMore: hasMore,
        timestamp: Date.now(),
        scrollPosition: window.scrollY,
        productIndex: products.findIndex(p => p.id === id)
      };
      
      // Save to sessionStorage
      sessionStorage.setItem('featuredProductsState', JSON.stringify(currentState));
      
      // CRITICAL: Save all currently loaded products to cache for instant restoration
      saveProductsToCache();
      
      // Reset restoration flag for next return
      setHasRestoredScroll(false);
    }
    
    // Navigate to product detail page
    setIsNavigating(true);
    router.push(`/product/${id}`);
  };

  if (products.length === 0 && !loading && !settingsLoading) {
    return (
      <div>
        <div className="bg-blue-50 text-blue-800 text-sm font-medium px-4 py-2 rounded-md text-center mb-4">
          {selectedCategory || "Products"}
        </div>
        <p className="text-center py-4">No similar products found.</p>
      </div>
    );
  }

  return (
    <section className="bg-gray/70 py-3 relative">
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-0">
        <div className="text-white text-sm font-semibold text-center uppercase mb-2">
          {selectedCategory || "Similar Products"}
          {(keyword || name || manufacturer || (tags?.length > 0)) && (
            <span className="block text-xs text-gray-200">
              Filtered by:{" "}
              {[keyword, name, manufacturer, ...(tags || [])]
                .filter(Boolean)
                .join(", ")}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0.5 p-0 m-0">
          {products.map(({ id, name, description, price, discount, imageUrl, sku }, index) => (
            <div
              key={id}
              onClick={() => handleProductClick(id)}
              className="cursor-pointer group"
            >
              <ProductCard
                variant="compact"
                isFirst={index === 0}
                badge={trendingProductIds.has(id) ? "Trending" : undefined}
                product={{
                  id,
                  name,
                  description,
                  sku,
                  price,
                  discount,
                  image: getPreferredImageUrl(imageUrl, featuredCardResolution),
                }}
              />
            </div>
          ))}
        </div>

        {loading && hasMore && (
          <p className="text-center py-4 text-gray-600">Loading more products...</p>
        )}
        
        {/* Show restoration status (only on main page) */}
        {window.location.pathname === '/' && (() => {
          try {
            const savedState = sessionStorage.getItem('featuredProductsState');
            if (savedState) {
              const state = JSON.parse(savedState);
              const savedProductCount = state.totalProductsLoaded;
              const savedProductIndex = state.productIndex;
              const currentProductCount = products.length;
              
              // Calculate target based on saved position
              const targetProductCount = Math.max(savedProductCount + 50, savedProductIndex + 60, 120);
              
              if (currentProductCount < targetProductCount) {
                return (
                  <div className="text-center py-2">
                    <p className="text-blue-600 text-sm">
                      🎯 Loading to target: {currentProductCount}/{targetProductCount} products
                    </p>
                    <p className="text-xs text-gray-500">
                      Target based on saved position: {savedProductIndex + 1} + 60 buffer
                    </p>
                  </div>
                );
              } else if (currentProductCount >= targetProductCount && targetProductCount > 0) {
                return (
                  <div className="text-center py-2">
                    <p className="text-green-600 text-sm">
                      ✅ Target reached: {currentProductCount} products loaded
                    </p>
                    <p className="text-xs text-gray-500">
                      Ready for scroll restoration
                    </p>
                  </div>
                );
              }
            }
            return null;
          } catch (error) {
            return null;
          }
        })()}
      </div>
    </section>
  );
}
