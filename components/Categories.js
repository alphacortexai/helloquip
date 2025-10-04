"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { cacheUtils, CACHE_KEYS, CACHE_DURATIONS } from "@/lib/cacheUtils";
import { db } from "@/lib/firebase";
import Link from "next/link";

function cleanFirebaseUrl(url) {
  if (!url || typeof url !== "string") return "";

  try {
    // Decode twice (handles %252F -> %2F)
    let cleaned = decodeURIComponent(decodeURIComponent(url));

    // Then re-encode once to ensure spaces and other special chars are valid
    const [baseUrl, query] = cleaned.split("?");
    const reEncodedPath = encodeURIComponent(baseUrl.split("/o/")[1]); // only encode the storage path
    return `https://firebasestorage.googleapis.com/v0/b/${baseUrl.split("/b/")[1].split("/")[0]}/o/${reEncodedPath}?${query}`;
  } catch (err) {
    console.warn("Failed to clean Firebase URL:", url);
    return url;
  }
}

export default function Categories({ onCategorySelect, isSidebar = false, onLoadComplete }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [loading, setLoading] = useState(true);
  const [imageLoadingStates, setImageLoadingStates] = useState({});

  const allCategory = {
    id: "all",
    name: "All Products",
    slug: "all-products",
    imageUrl: "https://cdn-icons-png.flaticon.com/128/7466/7466065.png",
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Try cache first
        const cached = cacheUtils.getCache(CACHE_KEYS.CATEGORIES, CACHE_DURATIONS.CATEGORIES);
        if (cached && Array.isArray(cached) && cached.length > 0) {
          setCategories(cached);
          setLoading(false);
          return;
        }

        const querySnapshot = await getDocs(collection(db, "categories"));
        const fetched = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.parentId === null) {
            fetched.push({ id: doc.id, ...data });
          }
        });
        const allCategories = [allCategory, ...fetched];
        setCategories(allCategories);
        // Save to cache
        cacheUtils.setCache(CACHE_KEYS.CATEGORIES, allCategories, CACHE_DURATIONS.CATEGORIES);
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Call onLoadComplete when component is fully loaded
  useEffect(() => {
    if (!loading && categories.length > 0 && onLoadComplete) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        onLoadComplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, categories.length, onLoadComplete]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center text-gray-400 text-sm">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-500 mr-2"></div>
        Loading categories...
      </div>
    );
  }

  const handleCategoryClick = (cat) => {
    setSelectedCategoryId(cat.id);
    if (onCategorySelect) onCategorySelect(cat.name);
  };

  const handleImageLoad = (catId) => {
    setImageLoadingStates(prev => ({ ...prev, [catId]: true }));
  };

  const handleImageError = (catId) => {
    setImageLoadingStates(prev => ({ ...prev, [catId]: true }));
  };

  const getImageSrc = (cat) => {
    if (cat.id === "all") return cat.imageUrl;

    if (typeof cat.imageUrl === "string") {
      return cleanFirebaseUrl(cat.imageUrl);
    }

    if (typeof cat.imageUrl === "object" && cat.imageUrl["90x90"]) {
      return cleanFirebaseUrl(cat.imageUrl["90x90"]);
    }

    if (typeof cat.imageUrl === "object" && cat.imageUrl.original) {
      return cleanFirebaseUrl(cat.imageUrl.original);
    }

    return "";
  };

  // Sidebar version (no title, vertical list)
  if (isSidebar) {
    return (
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-gray-800 mb-2">Categories</h2>
        {categories.map((cat) => (
          <Link href={`/category/${cat.slug}`} key={cat.id}>
            <div
              className="cursor-pointer flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => handleCategoryClick(cat)}
            >
                <div
                  className={`relative w-[24px] h-[24px] bg-gray-100 rounded-md overflow-hidden shadow-sm flex items-center justify-center ${
                    selectedCategoryId === cat.id
                      ? "border-2 border-blue-500 bg-blue-50"
                      : ""
                  }`}
                >
                  {/* Skeleton placeholder */}
                  {!imageLoadingStates[cat.id] && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md" />
                  )}
                  <Image
                    src={getImageSrc(cat) || 'data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2790%27 height=%2790%27><rect width=%27100%25%27 height=%27100%25%27 fill=%27%23e5e7eb%27/></svg>'}
                    alt={cat.name}
                    fill
                    sizes="24px"
                    fetchPriority="high"
                    className="object-contain p-1"
                    draggable={false}
                    unoptimized={getImageSrc(cat).startsWith('data:') || getImageSrc(cat).includes('flaticon.com')}
                    onLoad={() => handleImageLoad(cat.id)}
                    onError={() => handleImageError(cat.id)}
                  />
                </div>
              <span className={`text-xs font-medium line-clamp-2 ${
                selectedCategoryId === cat.id
                  ? "text-blue-700 font-semibold"
                  : "text-gray-700"
              }`}>
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Horizontal scroll (only when not in sidebar) */}
      <div className="block md:hidden">
        <div className="overflow-x-auto no-scrollbar px-1">
          <div
            className="grid grid-flow-col grid-rows-2 auto-cols-[70px] gap-x-2 gap-y-4"
            style={{ width: "max-content", paddingRight: "16px" }}
          >
            {categories.map((cat) => (
              <Link href={`/category/${cat.slug}`} key={cat.id}>
                <div
                  className="cursor-pointer text-center w-[70px]"
                  onClick={() => handleCategoryClick(cat)}
                >
                  <div
                    className={`relative w-[60px] h-[60px] bg-gray-100 rounded-[18px] overflow-hidden mx-auto shadow-md ${
                      selectedCategoryId === cat.id
                        ? "border-2 border-sky-400"
                        : ""
                    }`}
                  >
                    {/* Skeleton placeholder */}
                    {!imageLoadingStates[cat.id] && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-[18px]" />
                    )}
                    <Image
                      src={getImageSrc(cat) || 'data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2790%27 height=%2790%27><rect width=%27100%25%27 height=%27100%25%27 fill=%27%23e5e7eb%27/></svg>'}
                      alt={cat.name}
                      fill
                      sizes="60px"
                      fetchPriority="high"
                      className="object-contain"
                      draggable={false}
                      unoptimized={getImageSrc(cat).startsWith('data:') || getImageSrc(cat).includes('flaticon.com')}
                      onLoad={() => handleImageLoad(cat.id)}
                      onError={() => handleImageError(cat.id)}
                    />
                  </div>
                  <p className="mt-1 text-[12px] font-medium text-gray-700 leading-tight line-clamp-2">
                    {cat.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop: Vertical list */}
      <div className="hidden md:block">
        <div className="flex flex-col gap-0.5">
          {categories.map((cat) => (
            <Link href={`/category/${cat.slug}`} key={cat.id}>
              <div
                className="cursor-pointer flex items-center gap-2 py-0.5 px-1 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => handleCategoryClick(cat)}
              >
              <div
                className={`relative w-[28px] h-[28px] bg-gray-100 rounded-md overflow-hidden shadow-sm flex items-center justify-center ${
                  selectedCategoryId === cat.id
                    ? "border-2 border-blue-500 bg-blue-50"
                    : ""
                }`}
              >
                {/* Skeleton placeholder */}
                {!imageLoadingStates[cat.id] && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md" />
                )}
                <Image
                  src={getImageSrc(cat) || 'data:image/svg+xml,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%2790%27 height=%2790%27><rect width=%27100%25%27 height=%27100%25%27 fill=%27%23e5e7eb%27/></svg>'}
                  alt={cat.name}
                  fill
                  sizes="28px"
                  fetchPriority="high"
                  className="object-contain p-0.5"
                  draggable={false}
                  unoptimized={getImageSrc(cat).startsWith('data:') || getImageSrc(cat).includes('flaticon.com')}
                  onLoad={() => handleImageLoad(cat.id)}
                  onError={() => handleImageError(cat.id)}
                />
              </div>
                <span className={`text-sm font-medium line-clamp-1 ${
                  selectedCategoryId === cat.id
                    ? "text-blue-700 font-semibold"
                    : "text-gray-700"
                }`}>
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
