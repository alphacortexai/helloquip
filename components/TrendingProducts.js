"use client";

import Head from "next/head";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  getDocsFromCache,
  query,
  limit,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProductCard from "@/components/ProductCard";

const getPreferredImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (typeof imageUrl === "string") {
    try {
      return decodeURIComponent(imageUrl);
    } catch {
      return imageUrl;
    }
  }
  if (typeof imageUrl === "object") {
    const preferred =
      imageUrl["800x800"] ||
      imageUrl["680x680"] ||
      imageUrl["200x200"] ||
      imageUrl["original"] ||
      Object.values(imageUrl)[0];
    try {
      return decodeURIComponent(preferred);
    } catch {
      return preferred;
    }
  }
  return null;
};

export default function TrendingProducts() {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const scrollContainerRef = useRef(null);
  
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      try {
        setLoading(true);
        
        const q = query(collection(db, "trendingProducts"), limit(5));
        const snapshot = await getDocs(q);

        // Extract product IDs from trending collection
        const trendingDocs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            productId: data.productId || doc.id,
            addedAt: data.addedAt,
            // Use cached data if available
            cachedName: data.name,
            cachedPrice: data.price,
            cachedImageUrl: data.imageUrl,
          };
        });

        // Fetch full product details and validate existence
        const productPromises = trendingDocs.map(async (trendingDoc) => {
          try {
            const productRef = doc(db, "products", trendingDoc.productId);
            const productSnap = await getDoc(productRef);
            
            if (productSnap.exists()) {
              const data = productSnap.data();
              return {
                id: productSnap.id,
                name: data.name || trendingDoc.cachedName || "Unnamed",
                image: getPreferredImageUrl(data.image || data.imageUrl || trendingDoc.cachedImageUrl),
                price: data.price || trendingDoc.cachedPrice || 0,
                description: data.description || "No description provided.",
                sku: data.sku || "N/A",
                // Keep trending metadata
                addedAt: trendingDoc.addedAt,
              };
            } else {
              // Product was deleted, return null to filter out
              console.warn(`Trending product ${trendingDoc.productId} no longer exists`);
              return null;
            }
          } catch (error) {
            console.error(`Error fetching product ${trendingDoc.productId}:`, error);
            return null;
          }
        });

        const fullProducts = (await Promise.all(productPromises)).filter(Boolean);
        setProducts(fullProducts);
        
      } catch (error) {
        console.warn("Network failed, trying cache…", error);
        try {
          const cachedSnapshot = await getDocsFromCache(collection(db, "trendingProducts"));
          const trendingDocs = cachedSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              productId: data.productId || doc.id,
              cachedName: data.name,
              cachedPrice: data.price,
              cachedImageUrl: data.imageUrl,
            };
          });

          const cachedProductPromises = trendingDocs.map(async (trendingDoc) => {
            try {
              const productRef = doc(db, "products", trendingDoc.productId);
              const productSnap = await getDoc(productRef);
              
              if (productSnap.exists()) {
                const data = productSnap.data();
                return {
                  id: productSnap.id,
                  name: data.name || trendingDoc.cachedName || "Unnamed",
                  image: getPreferredImageUrl(data.image || data.imageUrl || trendingDoc.cachedImageUrl),
                  price: data.price || trendingDoc.cachedPrice || 0,
                  description: data.description || "No description provided.",
                  sku: data.sku || "N/A",
                };
              } else {
                return null;
              }
            } catch (error) {
              console.error(`Error fetching cached product ${trendingDoc.productId}:`, error);
              return null;
            }
          });

          const cachedProducts = (await Promise.all(cachedProductPromises)).filter(Boolean);
          setProducts(cachedProducts);
        } catch (cacheErr) {
          console.error("No cache found for trending products:", cacheErr);
          setProducts([]); // Set empty array if both network and cache fail
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    if (products.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [products]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      // When resetting to first slide, use 'auto' behavior to avoid any visible scroll
      if (currentSlide === 0) {
        // Just jump directly to the first card without any visible movement
        scrollContainerRef.current.scrollTo({
          left: 0,
          behavior: "auto"
        });
      } else {
        // Normal smooth scrolling for other slides
        scrollContainerRef.current.scrollTo({
          left: currentSlide * scrollContainerRef.current.offsetWidth,
          behavior: "smooth",
        });
      }
    }
  }, [currentSlide, products.length]);

  const handleProductClick = (productId) => {
    setIsNavigating(true);
    router.push(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        Loading trending products...
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No trending products available
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Trending Products - HelloQuip</title>
      </Head>

      {/* Desktop Fade Transition */}
      <div className="hidden md:block h-full flex items-start justify-center relative">
        <div className="w-full h-full relative">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="w-full" id={`trend-${product.id}`}>
                <ProductCard
                  product={product}
                  variant="carousel"
                  badge="Trending"
                  onClick={() => handleProductClick(product.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Carousel */}
      <div className="block md:hidden">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-full snap-center"
            >
              <ProductCard
                product={product}
                variant="mobilecarousel"
                badge="Trending"
                onClick={() => handleProductClick(product.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
