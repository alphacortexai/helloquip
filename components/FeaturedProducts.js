



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
import { getScrollManager } from "@/lib/scrollPositionManager";

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

export default function FeaturedProducts({ selectedCategory, keyword, tags, manufacturer, name }) {
  const { featuredCardResolution, loading: settingsLoading } = useDisplaySettings();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [trendingProductIds, setTrendingProductIds] = useState(new Set());
  const scrollListenerAdded = useRef(false);
  const router = useRouter();
  const batchSize = 24;
  const scrollManager = useRef(null);

  // Initialize scroll manager for featured products only
  useEffect(() => {
    scrollManager.current = getScrollManager();
  }, []);

  // Restore scroll position when returning to featured products
  useEffect(() => {
    if (!scrollManager.current) return;

    // Check if we're returning to a specific featured product
    const checkForReturn = () => {
      const hash = window.location.hash;
      console.log('🔍 Checking for return to featured product, hash:', hash);
      
      // Also check if we have a saved position with element ID
      const savedPosition = scrollManager.current.positions.get('featuredProducts');
      console.log('💾 Saved position:', savedPosition);
      
      let targetElementId = null;
      
      if (hash && hash.startsWith('#p-')) {
        targetElementId = hash.substring(1);
        console.log('✅ Hash indicates return to featured product:', targetElementId);
      } else if (savedPosition?.elementId && savedPosition.elementId.startsWith('p-')) {
        targetElementId = savedPosition.elementId;
        console.log('✅ Saved position indicates return to featured product:', targetElementId);
      }
      
      if (targetElementId) {
        console.log('🎯 Target element ID:', targetElementId);
        
        // Function to attempt scrolling to the target element
        const attemptScroll = () => {
          const element = document.getElementById(targetElementId);
          
          if (element) {
            console.log('🎯 Scrolling to featured product element');
            
            // Check if we're on mobile
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
            
            if (isMobile) {
              console.log('📱 Mobile device detected, using mobile-specific scroll');
              
              // For mobile, use a more reliable approach
              const rect = element.getBoundingClientRect();
              const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
              const elementTop = rect.top + scrollTop;
              
              // Calculate target scroll position to center the element
              const targetScrollY = elementTop - (window.innerHeight / 2) + (rect.height / 2);
              
              // Ensure we don't scroll beyond document bounds
              const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
              const finalScrollY = Math.max(0, Math.min(targetScrollY, maxScrollY));
              
              console.log('📱 Mobile scroll calculation:', {
                elementTop,
                targetScrollY,
                finalScrollY,
                maxScrollY,
                viewportHeight: window.innerHeight,
                elementHeight: rect.height
              });
              
              // Use smooth scroll with mobile-optimized settings
              window.scrollTo({
                top: finalScrollY,
                behavior: 'smooth'
              });
              
              // Alternative: try scrollIntoView with mobile-friendly options
              setTimeout(() => {
                try {
                  element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                  });
                } catch (e) {
                  console.log('📱 scrollIntoView failed, using fallback');
                  // Fallback: use window.scrollTo again
                  window.scrollTo({
                    top: finalScrollY,
                    behavior: 'auto'
                  });
                }
              }, 100);
              
            } else {
              // Desktop: use standard scrollIntoView
              element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
            }
            
            // Highlight the returned-to product briefly
            element.style.transition = 'all 0.3s ease';
            element.style.transform = 'scale(1.02)';
            element.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
            
            // Remove highlight after 3 seconds
            setTimeout(() => {
              if (element) {
                element.style.transform = 'scale(1)';
                element.style.boxShadow = '';
              }
            }, 3000);
          } else {
            console.log('⚠️ Element not found, using fallback scroll restoration');
            
            // For mobile, try a few more times with delays
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
            
            if (isMobile) {
              console.log('📱 Mobile: Element not found, retrying with delays...');
              
              // Try to find element multiple times on mobile
              let retryCount = 0;
              const maxRetries = 3;
              
              const retryScroll = () => {
                retryCount++;
                const element = document.getElementById(targetElementId);
                
                if (element) {
                  console.log(`📱 Mobile: Element found on retry ${retryCount}, scrolling...`);
                  
                  // Use mobile-optimized scroll
                  const rect = element.getBoundingClientRect();
                  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                  const elementTop = rect.top + scrollTop;
                  const targetScrollY = elementTop - (window.innerHeight / 2) + (rect.height / 2);
                  
                  // Ensure we don't scroll beyond document bounds
                  const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
                  const finalScrollY = Math.max(0, Math.min(targetScrollY, maxScrollY));
                  
                  console.log(`📱 Mobile retry ${retryCount} scroll calculation:`, {
                    elementTop,
                    targetScrollY,
                    finalScrollY,
                    maxScrollY
                  });
                  
                  window.scrollTo({
                    top: finalScrollY,
                    behavior: 'smooth'
                  });
                  
                  // Highlight the element
                  element.style.transition = 'all 0.3s ease';
                  element.style.transform = 'scale(1.02)';
                  element.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
                  
                  setTimeout(() => {
                    if (element) {
                      element.style.transform = 'scale(1)';
                      element.style.boxShadow = '';
                    }
                  }, 3000);
                  
                } else if (retryCount < maxRetries) {
                  console.log(`📱 Mobile: Retry ${retryCount} failed, trying again in 500ms...`);
                  setTimeout(retryScroll, 500);
                } else {
                  console.log('📱 Mobile: Max retries reached, using fallback scroll restoration');
                  scrollManager.current.restorePosition('featuredProducts');
                }
              };
              
              // Start retry process
              setTimeout(retryScroll, 300);
              
            } else {
              // Desktop: use fallback immediately
              scrollManager.current.restorePosition('featuredProducts');
            }
          }
        };
        
        // Wait 1 second for products to load, then attempt scroll
        console.log('⏳ Waiting 1 second for products to load before scroll restoration...');
        
        // Check if we're on mobile for timing adjustments
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
        const delay = isMobile ? 1500 : 1000; // Mobile needs more time
        
        console.log(`⏳ Waiting ${delay}ms for products to load (${isMobile ? 'mobile' : 'desktop'})...`);
        setTimeout(() => attemptScroll(), delay);
      }
    };

    // Check after component mounts
    const timer = setTimeout(checkForReturn, 100);
    
    // Also monitor hash changes
    const handleHashChange = () => {
      console.log('🔗 Hash changed to:', window.location.hash);
      if (window.location.hash && window.location.hash.startsWith('#p-')) {
        console.log('🔄 Hash change detected, checking for return...');
        checkForReturn();
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [products, loading]); // Added products and loading as dependencies

  // Save scroll position periodically while viewing featured products
  useEffect(() => {
    if (!scrollManager.current) return;

    const savePosition = () => {
      scrollManager.current.savePosition('featuredProducts');
    };

    // Save position every 3 seconds while scrolling
    let scrollTimer;
    const handleScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(savePosition, 3000);
    };

    // Save position when user stops scrolling
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Save position before page unload
    window.addEventListener('beforeunload', savePosition);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', savePosition);
      clearTimeout(scrollTimer);
      
      // Save final position
      if (scrollManager.current) {
        scrollManager.current.savePosition('featuredProducts');
      }
    };
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
      console.log("🔄 fetchProducts called:", { startAfterDoc: !!startAfterDoc, reset, loading, hasMore });
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

        console.log("📦 Fetched products:", fetchedProducts.length, "from database");

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

          console.log("🔍 After filtering:", filteredProducts.length, "products remain");
        }

        if (reset) {
          setProducts(filteredProducts);
          console.log("🔄 Reset: Set products to", filteredProducts.length);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newUnique = filteredProducts.filter((p) => !existingIds.has(p.id));
            const totalProducts = prev.length + newUnique.length;
            console.log("➕ Added", newUnique.length, "new products. Total now:", totalProducts);
            return [...prev, ...newUnique];
          });
        }

        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        const hasMoreProducts = querySnapshot.docs.length === batchSize;
        setHasMore(hasMoreProducts);
        console.log("📊 Has more products:", hasMoreProducts, "Last visible:", !!lastVisibleDoc);
      } catch (err) {
        console.error("❌ Error fetching products:", err);
      }
      setLoading(false);
    },
    [keyword, tags, manufacturer, name] // Removed loading and hasMore from dependencies
  );

  // Fetch trending product IDs on component mount
  useEffect(() => {
    fetchTrendingProductIds();
  }, [fetchTrendingProductIds]);

  // Only reset when search criteria actually change
  useEffect(() => {
    const searchCriteria = {
      keyword: keyword || "",
      name: name || "",
      manufacturer: manufacturer || "",
      tags: JSON.stringify(tags || [])
    };
    
    console.log("🔄 Component reset triggered by:", searchCriteria);
    setProducts([]);
    setLastVisible(null);
    setHasMore(true);
    fetchProducts(null, true);
  }, [
    keyword || "",
    name || "",
    manufacturer || "",
    JSON.stringify(tags || [])
  ]);

  useEffect(() => {
    if (loading || !hasMore) {
      console.log("🚫 Scroll listener not added:", { loading, hasMore });
      return;
    }

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const documentHeight = document.body.offsetHeight;
      const threshold = 2000; // Increased to 2000px for much earlier triggering
      const shouldLoadMore = windowHeight + scrollY >= documentHeight - threshold;
      
      console.log("📱 Scroll check:", {
        windowHeight,
        scrollY,
        documentHeight,
        threshold,
        shouldLoadMore,
        hasMore,
        loading
      });

      if (shouldLoadMore) {
        console.log("🚀 Triggering load more products");
        fetchProducts(lastVisible);
      }
    };

    if (!scrollListenerAdded.current) {
      console.log("👂 Adding scroll listener");
      window.addEventListener("scroll", handleScroll);
      scrollListenerAdded.current = true;
    }

    return () => {
      console.log("👋 Removing scroll listener");
      window.removeEventListener("scroll", handleScroll);
      scrollListenerAdded.current = false;
    };
  }, [fetchProducts, lastVisible, loading, hasMore]);

  const handleProductClick = (id) => {
    // Save scroll position BEFORE navigating
    if (scrollManager.current) {
      // Get the current scroll position
      const currentScrollY = window.scrollY;
      
      // Get the product element to calculate its position
      const productElement = document.getElementById(`p-${id}`);
      if (productElement) {
        // Calculate the element's position relative to the viewport
        const rect = productElement.getBoundingClientRect();
        const elementTop = rect.top + currentScrollY;
        const targetScrollY = elementTop - (window.innerHeight / 2) + (rect.height / 2);
        
        console.log('📍 Saving scroll position for featured product:', {
          productId: id,
          currentScrollY,
          elementTop,
          targetScrollY,
          elementHeight: rect.height,
          viewportHeight: window.innerHeight
        });
        
        // Save the position that will center this product
        scrollManager.current.savePosition('featuredProducts', {
          scrollY: targetScrollY,
          scrollX: 0,
          elementId: `p-${id}`,
          timestamp: Date.now()
        });
      } else {
        console.warn('⚠️ Product element not found for ID:', id);
        // Fallback: save current scroll position
        scrollManager.current.savePosition('featuredProducts');
      }
    }
    
    // Update URL with anchor for precise restoration
    try {
      const anchor = `p-${id}`;
      const url = new URL(window.location.href);
      url.hash = anchor;
      window.history.replaceState(window.history.state, "", url.toString());
      console.log('🔗 Updated URL with anchor:', anchor);
    } catch (error) {
      console.warn('⚠️ Could not update URL with anchor:', error);
    }

    // Now navigate to the product detail page
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
          
          {/* Debug: Test scroll restoration */}
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                console.log('🧪 Testing scroll restoration...');
                if (scrollManager.current) {
                  const savedPosition = scrollManager.current.positions.get('featuredProducts');
                  console.log('💾 Saved position:', savedPosition);
                  
                  if (savedPosition?.elementId) {
                    const element = document.getElementById(savedPosition.elementId);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      console.log('✅ Scrolled to element:', savedPosition.elementId);
                    } else {
                      console.warn('⚠️ Element not found:', savedPosition.elementId);
                    }
                  }
                }
              }}
              className="ml-4 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
            >
              Test Scroll
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0.5 p-0 m-0">
          {products.map(({ id, name, description, price, discount, imageUrl, sku }, index) => (
            <div
              key={id}
              id={`p-${id}`}
              onClick={() => handleProductClick(id)}
              className="cursor-pointer group"
            >
              <ProductCard
                variant="compact"
                isFirst={index === 0} // ✅ Mark the first product
                badge={trendingProductIds.has(id) ? "Trending" : undefined}
                product={{
                  id,
                  name,
                  description,
                  sku,
                  price,
                  discount,
                  image: getPreferredImageUrl(imageUrl, featuredCardResolution), // Fixed: Now uses dynamic resolution
                }}
              />
            </div>
          ))}
        </div>

        {loading && hasMore && (
          <p className="text-center py-4 text-gray-600">Loading more products...</p>
        )}
      </div>
    </section>
  );
}
