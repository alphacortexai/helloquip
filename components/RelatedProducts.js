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
  cardVariant = "landscapemain" 
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isShowingFallback, setIsShowingFallback] = useState(false);
  const router = useRouter();
  const batchSize = 20;

  const fetchRelatedProducts = useCallback(
    async (startAfterDoc = null, reset = false) => {
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
        
        // Get a larger batch to filter and score
        const constraints = [orderBy("name")];
        if (startAfterDoc) {
          constraints.push(startAfter(startAfterDoc));
        }
        constraints.push(limit(batchSize * 3)); // Get more to filter

        const q = query(collection(db, "products"), ...constraints);
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
        if (relatedProducts.length >= 1) {
          // We have at least 1 related product - show related products
          finalProducts = relatedProducts.slice(0, batchSize);
          setIsShowingFallback(false);
        } else {
          // No related products found, use fallback
          finalProducts = fallbackProducts.slice(0, batchSize);
          setIsShowingFallback(true);
        }

        if (reset) {
          setProducts(finalProducts);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newUnique = finalProducts.filter((p) => !existingIds.has(p.id));
            return [...prev, ...newUnique];
          });
        }

        const lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisible(lastVisibleDoc);
        const hasMoreProducts = querySnapshot.docs.length === batchSize * 3;
        setHasMore(hasMoreProducts);
      } catch (err) {
        console.error("Error fetching related products:", err);
      }
      setLoading(false);
    },
    [selectedCategory, keyword, tags, manufacturer, excludeId, name]
  );

  // Load products when component mounts or props change
  useEffect(() => {
    setProducts([]);
    setLastVisible(null);
    setHasMore(true);
    setIsShowingFallback(false);
    fetchRelatedProducts(null, true);
  }, [selectedCategory, keyword, manufacturer, tags, name, fetchRelatedProducts]);

  // Simple infinite scroll for related products
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const scrollY = window.scrollY;
      const documentHeight = document.body.offsetHeight;
      const threshold = 600;
      const shouldLoadMore = windowHeight + scrollY >= documentHeight - threshold;
      
      if (shouldLoadMore && !loading && hasMore) {
        fetchRelatedProducts(lastVisible, false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchRelatedProducts, loading, hasMore, lastVisible]);

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
          {products.map(({ id, name, description, price, discount, imageUrl, sku, relevanceScore }, index) => (
            <div
              key={id}
              onClick={() => handleProductClick(id)}
              className="cursor-pointer group"
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

        {loading && hasMore && (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 mx-auto"></div>
            <p className="text-gray-600 text-sm mt-2">Loading more products...</p>
          </div>
        )}
      </div>
    </section>
  );
}
