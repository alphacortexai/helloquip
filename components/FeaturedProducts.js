



"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useProductSettings, formatProductName } from "@/hooks/useProductSettings";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  addDoc,
  where,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";
import RecentlyViewedProducts from "./RecentlyViewedProducts";
import { useDisplaySettings } from "@/lib/useDisplaySettings";
import { useScrollPosition } from "@/lib/useScrollPosition";


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

export default function FeaturedProducts({ selectedCategory, keyword, tags, manufacturer, name, onLoadComplete, onScrollProgressChange }) {
  const { settings } = useProductSettings();
  const { featuredCardResolution, loading: settingsLoading } = useDisplaySettings();
  const { saveScrollPosition } = useScrollPosition();
  const { data: session } = useSession();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [trendingProductIds, setTrendingProductIds] = useState(new Set());
  const [latestProducts, setLatestProducts] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolledAllProducts, setHasScrolledAllProducts] = useState(false);
  const [recentlyViewedLoaded, setRecentlyViewedLoaded] = useState(false);
  const router = useRouter();
  const batchSize = 50; // 50 products per load
  const initialLoadSize = 100; // Initial load size - 100 products on first load

  // Products are now sorted consistently by creation date (newest first)
  // No more randomization to ensure users can track their progress


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
    async (startAfterDoc = null, reset = false, loadSize = batchSize) => {
      setLoading(true);
      try {
        // Debug: Log search criteria
        console.log('🔍 Search criteria:', { keyword, name, manufacturer, tags, selectedCategory });
        
        // Always fetch fresh data - no caching for infinite scroll
        const constraints = [orderBy("createdAt", "desc")];

        if (startAfterDoc) {
          constraints.push(startAfter(startAfterDoc));
        }

        // If we have search criteria, fetch more products to account for filtering
        const hasSearchCriteria = keyword || name || manufacturer || (tags && tags.length);
        const fetchSize = hasSearchCriteria ? loadSize * 3 : loadSize; // Fetch 3x more if filtering
        
        console.log(`📊 Fetch strategy: hasSearchCriteria=${hasSearchCriteria}, fetchSize=${fetchSize}, loadSize=${loadSize}`);
        
        constraints.push(limit(fetchSize));

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

          console.log('🔍 Filtering with criteria:', { lowerKeyword, lowerName, lowerManufacturer, tagSet });

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

            const matches = nameMatch || descMatch || nameSimMatch || manufacturerMatch || tagMatch;
            
            // Debug first few products
            if (fetchedProducts.indexOf(product) < 3) {
              console.log(`🔍 Product "${product.name}": nameMatch=${nameMatch}, descMatch=${descMatch}, nameSimMatch=${nameSimMatch}, manufacturerMatch=${manufacturerMatch}, tagMatch=${tagMatch}, final=${matches}`);
            }

            return matches;
          });

          console.log(`🔍 Filtering: ${fetchedProducts.length} fetched → ${filteredProducts.length} after filtering`);
        } else {
          console.log('🔍 No search criteria, showing all fetched products');
        }

        // If filtering resulted in very few products, include some unfiltered products as fallback
        let finalProducts = filteredProducts;
        if (filteredProducts.length < Math.min(loadSize, 20)) {
          console.log(`⚠️ Very few filtered products (${filteredProducts.length}), adding fallback products...`);
          const existingIds = new Set(filteredProducts.map(p => p.id));
          const fallbackProducts = fetchedProducts
            .filter(p => !existingIds.has(p.id))
            .slice(0, loadSize - filteredProducts.length);
          finalProducts = [...filteredProducts, ...fallbackProducts];
          console.log(`✅ Added ${fallbackProducts.length} fallback products, total: ${finalProducts.length}`);
        }
        
        // Ensure we always have at least the requested number of products if available
        if (finalProducts.length < loadSize && fetchedProducts.length >= loadSize) {
          console.log(`⚠️ Still not enough products (${finalProducts.length}), using more unfiltered products...`);
          const existingIds = new Set(finalProducts.map(p => p.id));
          const additionalProducts = fetchedProducts
            .filter(p => !existingIds.has(p.id))
            .slice(0, loadSize - finalProducts.length);
          finalProducts = [...finalProducts, ...additionalProducts];
          console.log(`✅ Added ${additionalProducts.length} additional products, total: ${finalProducts.length}`);
        }

        if (reset) {
          setProducts(finalProducts);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newUnique = finalProducts.filter((p) => !existingIds.has(p.id));
            const combined = [...prev, ...newUnique];
            
            console.log(`🔄 Adding products: prev=${prev.length}, new=${finalProducts.length}, unique=${newUnique.length}, combined=${combined.length}`);
            
            // If we got very few new products, it might indicate we're hitting duplicates
            if (newUnique.length < 10 && finalProducts.length >= 30) {
              console.log(`⚠️ Too many duplicates detected (${newUnique.length} new out of ${finalProducts.length}), this might indicate pagination issues`);
            }
            
            return combined;
          });
        }

        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        
        // More aggressive hasMore logic - continue if we got a full batch
        // This ensures we don't miss products due to filtering or other issues
        const hasMoreProducts = querySnapshot.docs.length === fetchSize;
        setHasMore(hasMoreProducts);
        
        console.log(`📦 Fetched ${fetchedProducts.length} products (requested: ${fetchSize}, filtered: ${filteredProducts.length}, final: ${sorted.length}), hasMore: ${hasMoreProducts}`);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
      setLoading(false);
    },
    [keyword, tags, manufacturer, name, batchSize]
  );

  // Fetch latest uploads (last 2 months up to current hour)
  useEffect(() => {
    const loadLatest = async () => {
      try {
        // Client-side filter from main list if available; otherwise do a best-effort fetch-all
        const now = new Date(); // Current time (up to this very hour)
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(now.getMonth() - 2); // Go back 2 months
        twoMonthsAgo.setHours(0, 0, 0, 0); // Start of day 2 months ago

        const normalizeDate = (p) => {
          const ts = p.createdAt || p.uploadedAt || p.updatedAt || p.timestamp || p.created_at;
          if (!ts) return null;
          
          try {
            // Firestore Timestamp
            if (ts && typeof ts.toDate === 'function') {
              return ts.toDate();
            }
            // JavaScript Date object
            if (ts instanceof Date) {
              return ts;
            }
            // ISO string or millis
            const d = new Date(ts);
            return isNaN(d.getTime()) ? null : d;
          } catch (error) {
            console.warn('Error normalizing date for product:', p.id, error);
            return null;
          }
        };

        // Always fetch fresh data for latest products to ensure new uploads appear immediately
        const snapshot = await getDocs(collection(db, "products"));
        const source = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        console.log('Total products available:', source.length);
        console.log('Looking for products created from last 2 months:', twoMonthsAgo.toISOString(), 'to', now.toISOString());

        const productsWithDates = source.map((p) => ({ p, d: normalizeDate(p) }));
        const validDates = productsWithDates.filter(({ d }) => d !== null);
        const recentProducts = validDates.filter(({ d }) => d >= twoMonthsAgo && d <= now);
        
        console.log('Products with valid dates:', validDates.length);
        console.log('Products created in last 2 months:', recentProducts.length);
        
        // Log some sample dates for debugging
        if (validDates.length > 0) {
          console.log('Sample product dates:', validDates.slice(0, 5).map(({ p, d }) => ({
            id: p.id,
            name: p.name,
            date: d.toISOString(),
            isRecent: d >= twoMonthsAgo && d <= now
          })));
        }

        const latest = recentProducts
          .sort((a, b) => b.d - a.d)
          .slice(0, 20) // Increased from 12 to 20
          .map(({ p }) => p);

        console.log('Latest products found (from last 2 months up to current hour):', latest.length, 'out of', source.length);
        
        // If no recent products, show first 20 products as "latest"
        if (latest.length === 0) {
          // Try to get products with any date first, then fallback to first 20
          const anyDateProducts = validDates
            .sort((a, b) => b.d - a.d)
            .slice(0, 20) // Increased from 8 to 20
            .map(({ p }) => p);
          
          const fallback = anyDateProducts.length > 0 ? anyDateProducts : source.slice(0, 20); // Increased from 8 to 20
          console.log('Using fallback latest products:', fallback.length);
          setLatestProducts(fallback);
        } else {
          setLatestProducts(latest);
        }
      } catch (e) {
        console.warn('Failed to load latest uploads:', e);
        // Fallback to first 20 products
        const fallback = products.length > 0 ? products.slice(0, 20) : [];
        console.log('Error fallback latest products:', fallback.length);
        setLatestProducts(fallback);
      }
    };
    loadLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products.length]);

  // Fetch trending product IDs on component mount
  useEffect(() => {
    fetchTrendingProductIds();
  }, [fetchTrendingProductIds]);


  // Call onLoadComplete when component is fully loaded
  useEffect(() => {
    if (!loading && !settingsLoading && products.length > 0 && recentlyViewedLoaded && onLoadComplete) {
      const timer = setTimeout(() => {
        onLoadComplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, settingsLoading, products.length, recentlyViewedLoaded, onLoadComplete]);

  // Load products when search criteria changes
  useEffect(() => {
    const searchCriteria = {
      keyword: keyword || "",
      name: name || "",
      manufacturer: manufacturer || "",
      tags: JSON.stringify(tags || [])
    };
    
    const currentCriteriaString = JSON.stringify(searchCriteria);
    const previousCriteriaString = JSON.stringify({
      keyword: "",
      name: "",
      manufacturer: "",
      tags: "[]"
    });
    
    if (currentCriteriaString !== previousCriteriaString || products.length === 0) {
      console.log('Search criteria changed, resetting products...');
      setProducts([]);
      setLastVisible(null);
      setHasMore(true);
      fetchProducts(null, true, initialLoadSize);
    }
  }, [keyword, name, manufacturer, tags, fetchProducts, products.length]);

  // Force refresh on page load to ensure fresh data
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      console.log('🔄 Page loaded, forcing fresh product fetch...');
      setProducts([]);
      setLastVisible(null);
      setHasMore(true);
      fetchProducts(null, true, initialLoadSize);
    }
  }, []); // Only run once on mount

  // Auto-load products to ensure users always have content
  useEffect(() => {
    const autoLoadProducts = () => {
      // If we have fewer than 100 products and there are more to load, auto-load
      if (products.length < 100 && hasMore && !loading) {
        console.log('🔄 Auto-loading more products to ensure minimum content...');
        fetchProducts(lastVisible, false, initialLoadSize);
      }
    };

    // Auto-load after a short delay to ensure initial load is complete
    const timer = setTimeout(autoLoadProducts, 2000);
    
    // Also auto-load when user is idle (no scroll for 3 seconds)
    let idleTimer;
    const handleUserActivity = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (products.length < 150 && hasMore && !loading) {
          console.log('🔄 Auto-loading more products during idle time...');
          fetchProducts(lastVisible, false, initialLoadSize);
        }
      }, 3000);
    };

    // Listen for scroll and mouse movement to detect user activity
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('mousemove', handleUserActivity);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(idleTimer);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('mousemove', handleUserActivity);
    };
  }, [products.length, hasMore, loading, lastVisible, fetchProducts, batchSize]);

  // Simple infinite scroll for main page only
  useEffect(() => {
    if (window.location.pathname !== '/') return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const documentHeight = document.body.offsetHeight;
      const threshold = 1200; // Increased threshold for more aggressive loading
      const shouldLoadMore = windowHeight + scrollY >= documentHeight - threshold;
      
      if (shouldLoadMore && !loading && hasMore) {
        console.log('🔄 Loading more products due to scroll...');
        fetchProducts(lastVisible, false, batchSize);
      }

      // Calculate scroll progress through products
      const featuredProductsSection = document.querySelector('[data-featured-products]');
      if (featuredProductsSection) {
        const sectionTop = featuredProductsSection.offsetTop;
        const sectionHeight = featuredProductsSection.offsetHeight;
        const scrollProgress = Math.min(Math.max((scrollY - sectionTop + windowHeight) / sectionHeight, 0), 1);
        setScrollProgress(scrollProgress);
        
        // Check if user has scrolled through all products (90% of section)
        setHasScrolledAllProducts(scrollProgress >= 0.9);
        
        // Pass scroll progress to parent component
        if (onScrollProgressChange) {
          onScrollProgressChange(scrollProgress, scrollProgress >= 0.9);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchProducts, loading, hasMore, lastVisible, batchSize]);

  // Function to track product views for recent section
  const trackProductView = async (userId, productId) => {
    try {
      console.log('🔍 Tracking product view:', { userId, productId });
      
      // Check if this view already exists for this user and product
      const recentViewsQuery = query(
        collection(db, "recentViews"),
        where("userId", "==", userId),
        where("productId", "==", productId)
      );
      
      const existingViews = await getDocs(recentViewsQuery);
      
      if (existingViews.empty) {
        // Create new view record
        const docRef = await addDoc(collection(db, "recentViews"), {
          userId,
          productId,
          viewedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
        console.log('✅ Created new view record:', docRef.id);
      } else {
        // Update existing view record with new timestamp
        const viewDoc = existingViews.docs[0];
        await updateDoc(doc(db, "recentViews", viewDoc.id), {
          viewedAt: serverTimestamp()
        });
        console.log('🔄 Updated existing view record:', viewDoc.id);
      }
    } catch (error) {
      console.error('❌ Error tracking product view:', error);
    }
  };

  // Monitor Firebase Auth state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      console.log('🔥 Firebase Auth state changed:', user ? `Authenticated user: ${user.uid}` : 'No authenticated user');
    });
    return () => unsubscribe();
  }, []);

  // Get the best available user ID (Firebase Auth first, then persistent browser ID)
  const getUserId = () => {
    // Priority 1: Real Firebase Auth user
    if (firebaseUser?.uid) {
      console.log('✅ Using Firebase Auth user ID:', firebaseUser.uid);
      return firebaseUser.uid;
    }
    
    // Priority 2: Persistent browser ID for anonymous users
    try {
      if (typeof window === 'undefined') return 'guest';
      
      let userId = localStorage.getItem('persistentUserId');
      if (!userId) {
        // Create a unique ID for this browser
        userId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('persistentUserId', userId);
        console.log('🆕 Created new persistent user ID:', userId);
      } else {
        console.log('🔄 Using existing persistent user ID:', userId);
      }
      return userId;
    } catch (error) {
      console.warn('Error getting persistent user ID:', error);
      return 'guest';
    }
  };


  const handleProductClick = async (id) => {
    // Save scroll position before navigation (only on main page)
    if (window.location.pathname === '/') {
      saveScrollPosition();
    }
    
    // Track product view for recent section
    const userId = getUserId();
    if (userId && userId !== 'guest') {
      console.log('👤 Tracking view for product:', id, 'User ID:', userId);
      try {
        await trackProductView(userId, id);
      } catch (error) {
        console.warn('Failed to track product view:', error);
      }
    } else {
      console.log('❌ No user ID available, skipping view tracking');
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
    <section className="bg-gray/70 pt-0 md:pt-3 pb-0 relative" data-featured-products>
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-r-blue-500 border-b-blue-500 border-l-blue-500" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-0">
        <div className="hidden md:block text-white text-sm font-semibold text-center uppercase mb-2">
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

        {/* Desktop/Tablet: original grid */}
        <div className="hidden sm:grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0.5 p-0 m-0">
          {products.map(({ id, name, description, price, discount, imageUrl, sku }, index) => (
            <div key={id} onClick={() => handleProductClick(id)} className="cursor-pointer group">
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

        {/* Mobile: first 2 rows (4 items), then latest scroller, then remaining */}
        <div className="sm:hidden">
          {(() => {
            const firstCount = 4;
            const first = products.slice(0, firstCount);
            const rest = products.slice(firstCount);
            return (
              <>
                {/* First two rows */}
                <div className="grid grid-cols-2 gap-0.5 p-0 m-0">
                  {first.map(({ id, name, description, price, discount, imageUrl, sku }, index) => (
                    <div key={id} onClick={() => handleProductClick(id)} className="cursor-pointer group">
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

                {/* Recently Viewed Products - Embedded */}
                <div className="mt-1 mb-1">
                  <RecentlyViewedProducts 
                    limit={4} 
                    showTitle={true} 
                    onLoadComplete={() => setRecentlyViewedLoaded(true)}
                  />
                </div>

                {/* Latest uploads horizontal scroller */}
                <div className="bg-white rounded-lg shadow p-4 mb-1">
                  <div className="flex items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Latest
                    </h2>
                  </div>
                  
                  {latestProducts.length > 0 ? (
                    <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2">
                      {latestProducts.map(({ id, name, description, price, discount, imageUrl, sku }, index) => (
                        <div
                          key={`latest-${id}`}
                          className="snap-start shrink-0 w-32 cursor-pointer group"
                          onClick={() => handleProductClick(id)}
                        >
                          <div className="relative">
                            <img
                              src={getPreferredImageUrl(imageUrl, featuredCardResolution)}
                              alt={name || 'Product'}
                              className="w-full h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                            />
                            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              New
                            </div>
                          </div>
                          <div className="mt-2">
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">
                              {formatProductName(name, settings)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              UGX {price?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 text-xs py-2">
                      No latest products available
                    </div>
                  )}
                </div>

                {/* Remaining products */}
                <div className="grid grid-cols-2 gap-0.5 p-0 m-0">
                  {rest.map(({ id, name, description, price, discount, imageUrl, sku }, index) => (
                    <div key={`rest-${id}`} onClick={() => handleProductClick(id)} className="cursor-pointer group">
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
              </>
            );
          })()}
        </div>

        {loading && hasMore && (
          <p className="text-center text-gray-600">Loading more products...</p>
        )}
        
        {/* View More / Scroll to Top button */}
        {!loading && products.length > 0 && (
          <div className="text-center py-2">
            <button 
              onClick={() => {
                if (hasMore) {
                  console.log('🔄 Manual load more triggered...');
                  console.log('📊 Current state:', { 
                    currentProducts: products.length, 
                    hasMore, 
                    lastVisible: lastVisible?.id,
                    batchSize 
                  });
                  setHasMore(true);
                  fetchProducts(lastVisible, false, batchSize);
                } else {
                  // Scroll to top when all products are loaded
                  console.log('⬆️ Scrolling to top...');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors ${
                hasMore 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {hasMore ? 'View More Products' : 'Scroll to Top'}
            </button>
          </div>
        )}
      </div>

    </section>
  );
}
