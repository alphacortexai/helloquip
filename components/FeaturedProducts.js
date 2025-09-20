



"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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
  const [recentProducts, setRecentProducts] = useState([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hasScrolledAllProducts, setHasScrolledAllProducts] = useState(false);
  const router = useRouter();
  const batchSize = 24; // Reduced from previous large numbers

  // --- Seeded shuffle helpers (stable per-user order) ---
  const getOrCreateUserSeed = () => {
    try {
      const authId = session?.user?.id || session?.user?.email || "guest";
      if (typeof window === 'undefined') return authId;
      let stored = localStorage.getItem('userSeed');
      if (!stored) {
        stored = `${authId}-${Math.random().toString(36).slice(2)}`;
        localStorage.setItem('userSeed', stored);
      }
      return stored;
    } catch {
      return "guest";
    }
  };

  const mulberry32 = (a) => {
    return function() {
      let t = (a += 0x6D2B79F5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const stringHash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    }
    return h >>> 0;
  };

  const seededShuffle = (arr, seedString) => {
    const rand = mulberry32(stringHash(seedString));
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

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
        // Always fetch fresh data - no caching for infinite scroll
        const constraints = [orderBy("name")];

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

        const seed = getOrCreateUserSeed();
        const sorted = seededShuffle(filteredProducts, seed);

        if (reset) {
          setProducts(sorted);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newUnique = sorted.filter((p) => !existingIds.has(p.id));
            const combined = [...prev, ...newUnique];
            // Re-shuffle combined to keep global order stable per user
            return seededShuffle(combined, seed);
          });
        }

        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        
        // More aggressive hasMore logic - continue if we got a full batch
        // This ensures we don't miss products due to filtering or other issues
        const hasMoreProducts = querySnapshot.docs.length === batchSize;
        setHasMore(hasMoreProducts);
        
        console.log(`📦 Fetched ${fetchedProducts.length} products, hasMore: ${hasMoreProducts}`);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
      setLoading(false);
    },
    [keyword, tags, manufacturer, name]
  );

  // Fetch latest uploads (last 2 months)
  useEffect(() => {
    const loadLatest = async () => {
      try {
        // Client-side filter from main list if available; otherwise do a best-effort fetch-all
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today (00:00:00)

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

        let source = products;

        if (!source || source.length === 0) {
          const snapshot = await getDocs(collection(db, "products"));
          source = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        }

        console.log('Total products available:', source.length);
        console.log('Looking for products created from today onwards:', today.toISOString());

        const productsWithDates = source.map((p) => ({ p, d: normalizeDate(p) }));
        const validDates = productsWithDates.filter(({ d }) => d !== null);
        const recentProducts = validDates.filter(({ d }) => d >= today);
        
        console.log('Products with valid dates:', validDates.length);
        console.log('Products created from today onwards:', recentProducts.length);
        
        // Log some sample dates for debugging
        if (validDates.length > 0) {
          console.log('Sample product dates:', validDates.slice(0, 5).map(({ p, d }) => ({
            id: p.id,
            name: p.name,
            date: d.toISOString(),
            isRecent: d >= today
          })));
        }

        const latest = recentProducts
          .sort((a, b) => b.d - a.d)
          .slice(0, 12)
          .map(({ p }) => p);

        console.log('Latest products found (from today onwards):', latest.length, 'out of', source.length);
        
        // If no recent products, show first 8 products as "latest"
        if (latest.length === 0) {
          // Try to get products with any date first, then fallback to first 8
          const anyDateProducts = validDates
            .sort((a, b) => b.d - a.d)
            .slice(0, 8)
            .map(({ p }) => p);
          
          const fallback = anyDateProducts.length > 0 ? anyDateProducts : source.slice(0, 8);
          console.log('Using fallback latest products:', fallback.length);
          setLatestProducts(fallback);
        } else {
          setLatestProducts(latest);
        }
      } catch (e) {
        console.warn('Failed to load latest uploads:', e);
        // Fallback to first few products
        const fallback = products.length > 0 ? products.slice(0, 8) : [];
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

  // Fetch recent products when Firebase Auth state changes or component mounts
  useEffect(() => {
    const userId = getUserId();
    console.log('User ID changed:', { 
      hasSession: !!session, 
      sessionUserId: session?.user?.id, 
      firebaseUserId: firebaseUser?.uid,
      finalUserId: userId,
      userEmail: firebaseUser?.email || session?.user?.email,
      userName: firebaseUser?.displayName || session?.user?.name 
    });
    
    if (userId && userId !== 'guest') {
      fetchRecentProducts();
    } else {
      setRecentProducts([]);
    }
  }, [firebaseUser]); // Run when Firebase Auth state changes

  // Call onLoadComplete when component is fully loaded
  useEffect(() => {
    if (!loading && !settingsLoading && products.length > 0 && onLoadComplete) {
      const timer = setTimeout(() => {
        onLoadComplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, settingsLoading, products.length, onLoadComplete]);

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
      fetchProducts(null, true);
    }
  }, [keyword, name, manufacturer, tags, fetchProducts, products.length]);

  // Force refresh on page load to ensure fresh data
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      console.log('🔄 Page loaded, forcing fresh product fetch...');
      setProducts([]);
      setLastVisible(null);
      setHasMore(true);
      fetchProducts(null, true);
    }
  }, []); // Only run once on mount

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
        fetchProducts(lastVisible, false);
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
  }, [fetchProducts, loading, hasMore, lastVisible]);

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

  // Function to fetch recent products for the user
  const fetchRecentProducts = async () => {
    const userId = getUserId();
    
    if (!userId || userId === 'guest') {
      console.log('No user ID available, skipping recent products fetch');
      setRecentProducts([]);
      return;
    }
    
    try {
      console.log('Fetching recent products for user:', userId);
      
      // Get recent views for this user, ordered by most recent
      const recentViewsQuery = query(
        collection(db, "recentViews"),
        where("userId", "==", userId),
        orderBy("viewedAt", "desc"),
        limit(12)
      );
      
      const recentViewsSnapshot = await getDocs(recentViewsQuery);
      
      if (recentViewsSnapshot.empty) {
        console.log('No recent views found for user:', userId);
        setRecentProducts([]);
        return;
      }
      
      // Get product IDs from recent views
      const productIds = recentViewsSnapshot.docs.map(doc => doc.data().productId);
      console.log('Found recent view product IDs:', productIds);
      
      // Fetch product details for these IDs
      const productsQuery = query(
        collection(db, "products"),
        where("__name__", "in", productIds)
      );
      
      const productsSnapshot = await getDocs(productsQuery);
      const recentProductsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by the order of recent views (most recent first)
      const sortedRecentProducts = productIds
        .map(id => recentProductsData.find(p => p.id === id))
        .filter(Boolean);
      
      console.log('Recent products loaded:', sortedRecentProducts.length);
      setRecentProducts(sortedRecentProducts);
    } catch (error) {
      console.error('Error fetching recent products:', error);
      setRecentProducts([]);
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
    <section className="bg-gray/70 pt-0 md:pt-3 pb-3 relative" data-featured-products>
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
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

                {/* Latest uploads horizontal scroller */}
                <div className="mt-2 mb-2">
                  <div className="text-sm font-semibold text-white text-center px-1 mb-1">
                    Latest
                  </div>
                  {latestProducts.length > 0 ? (
                    <div className="flex gap-1 overflow-x-auto no-scrollbar snap-x snap-mandatory px-1 pr-6">
                      {latestProducts.map(({ id, name, description, price, discount, imageUrl, sku }, index) => (
                        <div
                          key={`latest-${id}`}
                          className="snap-start shrink-0 w-[40%]"
                          onClick={() => handleProductClick(id)}
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
                  ) : (
                    <div className="text-center text-gray-400 text-xs py-2">
                      No latest products available
                    </div>
                  )}
                </div>

                {/* Recent products horizontal scroller - only show if user has recent products */}
                {recentProducts.length > 0 ? (
                  <div className="mt-2 mb-2">
                    <div className="text-sm font-semibold text-white text-center px-1 mb-1">
                      Your recent product views
                    </div>
                    <div className="flex gap-1 overflow-x-auto no-scrollbar snap-x snap-mandatory px-1 pr-6">
                      {recentProducts.map(({ id, name, description, price, discount, imageUrl, sku }, index) => (
                        <div
                          key={`recent-${id}`}
                          className="snap-start shrink-0 w-[40%]"
                          onClick={() => handleProductClick(id)}
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
                  </div>
                ) : (
                  <div className="mt-2 mb-2">
                    <div className="text-center text-gray-400 text-xs py-2">
                      No recent products viewed
                    </div>
                  </div>
                )}

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
          <p className="text-center py-4 text-gray-600">Loading more products...</p>
        )}
        
        {/* View More button - always show at bottom for manual loading */}
        {!loading && products.length > 0 && (
          <div className="text-center py-4">
            <button 
              onClick={() => {
                console.log('🔄 Manual load more triggered...');
                setHasMore(true);
                fetchProducts(lastVisible, false);
              }}
              className="bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-blue-600 transition-colors"
            >
              View More Products
            </button>
          </div>
        )}
      </div>

    </section>
  );
}
