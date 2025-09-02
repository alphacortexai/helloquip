"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Search } from "lucide-react";
import Image from "next/image";

// Helper function to get preferred image URL
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
    const preferred = imageUrl["200x200"] || imageUrl["original"] || Object.values(imageUrl)[0];
    try {
      return decodeURIComponent(preferred);
    } catch {
      return preferred;
    }
  }
  
  return null;
};

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isClickShieldActive, setIsClickShieldActive] = useState(false);
  const router = useRouter();
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const snapshot = await getDocs(collection(db, "products"));
        const products = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllProducts(products);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSuggestions([]);
    } else {
      const filtered = allProducts
        .filter((product) => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 6); // Show up to 6 suggestions with images
      setSuggestions(filtered);
    }
  }, [searchTerm, allProducts]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSuggestions([]);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (e, product) => {
    // Prevent input blur before we handle navigation
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

    setSearchTerm(product.name);
    // Activate a temporary shield to block underlying clicks
    setIsClickShieldActive(true);
    // Optionally hide suggestions immediately for snappier feel
    setSuggestions([]);
    setIsFocused(false);

    // Delay navigation by ~1s to avoid accidental underlying taps
    const target = `/search?q=${encodeURIComponent(product.name)}`;
    setTimeout(() => {
      router.push(target);
    }, 1000);

    // Remove shield shortly after navigation trigger
    setTimeout(() => {
      setIsClickShieldActive(false);
    }, 1100);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.trim() === "") {
      setSuggestions([]);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto mt-0" ref={searchRef}>
      {/* Click shield to prevent accidental taps on elements behind dropdown */}
      {isClickShieldActive && (
        <div className="fixed inset-0 z-[9999]" style={{ background: 'transparent' }}></div>
      )}
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Search for medical equipments & products..."
          className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          
        />
        <button type="submit" className="absolute left-3 top-1.5 text-gray-500 hover:text-gray-700">
          <Search className="w-4 h-4" />
        </button>
      </form>

      {/* Search Suggestions Dropdown */}
      {isFocused && searchTerm && suggestions.length > 0 && (
        <ul className="absolute z-50 bg-white w-full border border-gray-200 rounded-lg mt-1 shadow-lg max-h-80 overflow-y-auto search-suggestions">
          {suggestions.map((product) => (
            <li key={product.id} className="p-0 border-b border-gray-100 last:border-b-0">
              <button
                type="button"
                className="w-full px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors text-left pointer-events-auto"
                onMouseDown={(e) => handleSuggestionClick(e, product)}
                onTouchStart={(e) => handleSuggestionClick(e, product)}
              >
                <div className="flex items-center space-x-3">
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md overflow-hidden search-suggestion-image">
                    {(product.image || product.imageUrl) ? (
                      <Image
                        src={getPreferredImageUrl(product.image || product.imageUrl)}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover pointer-events-none"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Fallback icon when no image */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs bg-gray-100" style={{ display: (product.image || product.imageUrl) ? 'none' : 'flex' }}>
                      🏥
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    {product.sku && (
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    )}
                    {product.price && (
                      <p className="text-xs text-gray-500">UGX {product.price.toLocaleString()}</p>
                    )}
                    {product.description && (
                      <p className="text-xs text-gray-400 truncate">{product.description}</p>
                    )}
                  </div>

                  {/* Arrow indicator */}
                  <div className="flex-shrink-0 text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            </li>
          ))}
          
          {/* View All Results Link */}
          <li className="px-3 py-2 border-t border-gray-200 bg-gray-50 search-suggestion-item">
            <button
              onClick={handleSubmit}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-1"
            >
              View all results for "{searchTerm}"
            </button>
          </li>
        </ul>
      )}

      {/* Loading State */}
      {isFocused && searchTerm && isLoading && (
        <div className="absolute z-50 bg-white w-full border border-gray-200 rounded-lg mt-1 shadow-lg p-4">
          <div className="flex items-center justify-center text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            Loading suggestions...
          </div>
        </div>
      )}
    </div>
  );
}
