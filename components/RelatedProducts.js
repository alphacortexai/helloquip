"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  startAfter,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "./ProductCard";

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

// Smart relevance scoring function - focused on product name similarity
const calculateRelevanceScore = (product, searchCriteria) => {
  let score = 0;
  const { name, category, manufacturer, tags, keyword } = searchCriteria;
  
  // Product name similarity (HIGHEST PRIORITY - this is the main criteria)
  if (name && product.name) {
    const productWords = product.name.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    const searchWords = name.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    // Count exact full word matches (highest priority)
    const exactFullMatches = searchWords.filter(word => 
      productWords.includes(word)
    );
    score += exactFullMatches.length * 100; // Very high weight for exact full word matches
    
    // If product names share any full words, give significant bonus
    if (exactFullMatches.length > 0) {
      score += 80; // Big bonus for having shared words
    }
    
    // Bonus for having multiple word matches
    if (exactFullMatches.length >= 2) {
      score += 60; // Extra bonus for multiple word matches
    }
    
    // Exact name match bonus
    if (product.name.toLowerCase().includes(name.toLowerCase())) {
      score += 120;
    }
    
    // Partial word matches (one word contains another) - lower priority
    const partialMatches = searchWords.filter(word => 
      productWords.some(pWord => pWord.includes(word) || word.includes(pWord))
    );
    score += partialMatches.length * 40;
  }
  
  // Category match (secondary priority)
  if (category && product.category) {
    if (product.category === category) {
      score += 30; // Exact category match
    } else {
      // Check for similar categories
      const categoryWords = category.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const productCategoryWords = product.category.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      
      const matchingCategoryWords = categoryWords.filter(word => 
        productCategoryWords.includes(word)
      );
      score += matchingCategoryWords.length * 15; // Partial category match
    }
  }
  
  // Tag matching (secondary priority)
  if (tags && tags.length > 0 && product.tags && product.tags.length > 0) {
    const productTags = product.tags.map(tag => tag.toLowerCase());
    const searchTags = tags.map(tag => tag.toLowerCase());
    
    // Count exact tag matches
    const matchingTags = searchTags.filter(tag => productTags.includes(tag));
    score += matchingTags.length * 25;
    
    // Bonus for having any shared tags
    if (matchingTags.length > 0) {
      score += 20;
    }
  }
  
  // Description similarity (lower priority)
  if (product.description && name) {
    const description = product.description.toLowerCase();
    const nameWords = name.toLowerCase().split(/\s+/).filter(word => word.length > 2);
    
    // Check for exact word matches in description
    const descriptionWords = description.split(/\s+/).filter(word => word.length > 2);
    const descriptionMatches = nameWords.filter(word => descriptionWords.includes(word));
    score += descriptionMatches.length * 20;
    
    // Check for phrase matches in description
    if (description.includes(name.toLowerCase())) {
      score += 30;
    }
  }
  
  // Manufacturer match (lowest priority)
  if (manufacturer && product.manufacturer === manufacturer) {
    score += 15;
  }
  
  return score;
};

export default function RelatedProducts({ 
  selectedCategory, 
  keyword, 
  tags, 
  manufacturer, 
  name, 
  excludeId,
  cardVariant = "compact" 
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isShowingFallback, setIsShowingFallback] = useState(false);
  const scrollContainerRef = useRef(null);
  const router = useRouter();
  const maxProducts = 20; // Maximum products to show
  const minProducts = 10; // Minimum products to always show

  const fetchRelatedProducts = useCallback(
    async () => {
      setLoading(true);
      try {
        // Build search criteria
        const searchCriteria = {
          name: name || '',
          category: selectedCategory || '',
          manufacturer: manufacturer || '',
          tags: tags || [],
          keyword: keyword || ''
        };
        
        // Get all products to filter and score - fetch more to ensure we have enough
        const q = query(collection(db, "products"), orderBy("name"), limit(100));
        const querySnapshot = await getDocs(q);

        let allProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter out the current product
        if (excludeId) {
          allProducts = allProducts.filter(product => product.id !== excludeId);
        }

        // Score and sort products by relevance
        const scoredProducts = allProducts.map(product => ({
          ...product,
          relevanceScore: calculateRelevanceScore(product, searchCriteria)
        }));

        // Sort by relevance score (highest first)
        scoredProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);

        // Find truly related products (high relevance score - focusing on NAME SIMILARITY)
        const relatedProducts = scoredProducts.filter(product => product.relevanceScore >= 60);
        const fallbackProducts = scoredProducts.filter(product => product.relevanceScore < 60);

        let finalProducts;
        if (relatedProducts.length >= minProducts) {
          // We have enough related products - show only related products
          finalProducts = relatedProducts.slice(0, maxProducts);
          setIsShowingFallback(false);
        } else if (relatedProducts.length >= 1) {
          // We have some related products but not enough - combine with fallback to reach minimum
          const neededFromFallback = minProducts - relatedProducts.length;
          finalProducts = [
            ...relatedProducts,
            ...fallbackProducts.slice(0, neededFromFallback)
          ].slice(0, maxProducts);
          setIsShowingFallback(false);
        } else {
          // No related products found, use fallback but ensure minimum
          finalProducts = fallbackProducts.slice(0, Math.max(minProducts, maxProducts));
          setIsShowingFallback(true);
        }
        
        // Final safety check: ensure we always have at least minProducts
        if (finalProducts.length < minProducts && scoredProducts.length >= minProducts) {
          finalProducts = scoredProducts.slice(0, Math.max(minProducts, maxProducts));
        }

        setProducts(finalProducts);
      } catch (err) {
        console.error("Error fetching related products:", err);
      }
      setLoading(false);
    },
    [selectedCategory, keyword, tags, manufacturer, excludeId, name, maxProducts]
  );

  // Load products when component mounts or props change
  useEffect(() => {
    setProducts([]);
    setIsShowingFallback(false);
    fetchRelatedProducts();
  }, [selectedCategory, keyword, manufacturer, tags, name, fetchRelatedProducts]);

  // Arrow navigation functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      // Scroll by one card width + gap
      // Mobile: calc((100vw - 4rem) / 2) + 2px, Desktop: calc((100vw - 8rem) / 4) + 2px, Large: calc((100vw - 8rem) / 6) + 2px
      const isMobile = window.innerWidth < 768;
      const isLarge = window.innerWidth >= 1024;
      const viewportWidth = window.innerWidth;
      const cardWidth = isMobile 
        ? (viewportWidth - 64) / 2  // 4rem = 64px
        : isLarge
        ? (viewportWidth - 128) / 6  // 8rem = 128px, 6 columns on large screens
        : (viewportWidth - 128) / 4; // 8rem = 128px, 4 columns on medium screens
      const gap = 2; // gap-0.5 = 2px
      const scrollAmount = cardWidth + gap;
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      // Scroll by one card width + gap
      // Mobile: calc((100vw - 4rem) / 2) + 2px, Desktop: calc((100vw - 8rem) / 4) + 2px, Large: calc((100vw - 8rem) / 6) + 2px
      const isMobile = window.innerWidth < 768;
      const isLarge = window.innerWidth >= 1024;
      const viewportWidth = window.innerWidth;
      const cardWidth = isMobile 
        ? (viewportWidth - 64) / 2  // 4rem = 64px
        : isLarge
        ? (viewportWidth - 128) / 6  // 8rem = 128px, 6 columns on large screens
        : (viewportWidth - 128) / 4; // 8rem = 128px, 4 columns on medium screens
      const gap = 2; // gap-0.5 = 2px
      const scrollAmount = cardWidth + gap;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleProductClick = (id) => {
    setIsNavigating(true);
    router.push(`/product/${id}`);
  };

  if (products.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">No products found.</p>
      </div>
    );
  }

  return (
    <section className="relative">
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-6">
          {isShowingFallback ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Other Products You May Like</h3>
              <p className="text-sm text-gray-600">No closely related products found, but here are some other great options</p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Related Products</h3>
              <p className="text-sm text-gray-600">Products similar to what you're viewing</p>
            </div>
          )}
        </div>

        {/* Horizontal scrolling container with arrow navigation */}
        <div className="relative">
          {/* Scrollable Container */}
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory scroll-smooth px-2"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth'
            }}
          >
            <div className="flex gap-0.5" style={{ width: 'max-content' }}>
              {products.map(({ id, name, description, price, discount, imageUrl, sku, relevanceScore }, index) => (
                <div
                  key={id}
                  onClick={() => handleProductClick(id)}
                  className="cursor-pointer group flex-shrink-0 snap-start w-[calc((100vw-4rem)/2)] min-w-[calc((100vw-4rem)/2)] max-w-[calc((100vw-4rem)/2)] md:w-[calc((100vw-8rem)/4)] md:min-w-[calc((100vw-8rem)/4)] md:max-w-[calc((100vw-8rem)/4)] lg:w-[calc((100vw-8rem)/6)] lg:min-w-[calc((100vw-8rem)/6)] lg:max-w-[calc((100vw-8rem)/6)]"
                >
                  <ProductCard
                    variant={cardVariant}
                    isFirst={index === 0}
                    product={{
                      id,
                      name,
                      description,
                      sku,
                      price,
                      discount,
                      image: getPreferredImageUrl(imageUrl),
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Left Arrow Button - Floating on top */}
          {products.length > 0 && (
            <button
              onClick={scrollLeft}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/95 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Right Arrow Button - Floating on top */}
          {products.length > 0 && (
            <button
              onClick={scrollRight}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/95 hover:bg-white shadow-lg rounded-full p-2 md:p-3 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {loading && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 mx-auto"></div>
            <p className="text-gray-600 text-sm mt-2">Loading products...</p>
          </div>
        )}
      </div>
    </section>
  );
}
