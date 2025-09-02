



"use client";

import { useEffect, useState, useCallback } from "react";
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

export default function FeaturedProducts({ selectedCategory, keyword, tags, manufacturer, name, onLoadComplete }) {
  const { featuredCardResolution, loading: settingsLoading } = useDisplaySettings();
  const { saveScrollPosition } = useScrollPosition();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [trendingProductIds, setTrendingProductIds] = useState(new Set());
  const router = useRouter();
  const batchSize = 24; // Reduced from previous large numbers

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

  // Fetch trending product IDs on component mount
  useEffect(() => {
    fetchTrendingProductIds();
  }, [fetchTrendingProductIds]);

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

  // Simple infinite scroll for main page only
  useEffect(() => {
    if (window.location.pathname !== '/') return;

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const documentHeight = document.body.offsetHeight;
      const threshold = 800;
      const shouldLoadMore = windowHeight + scrollY >= documentHeight - threshold;
      
      if (shouldLoadMore && !loading && hasMore) {
        fetchProducts(lastVisible, false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchProducts, loading, hasMore, lastVisible]);

  const handleProductClick = (id) => {
    // Save scroll position before navigation (only on main page)
    if (window.location.pathname === '/') {
      saveScrollPosition();
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
    <section className="bg-gray/70 pt-0 md:pt-3 pb-3 relative">
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
      </div>
    </section>
  );
}
