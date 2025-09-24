"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CustomerExperienceService } from '@/lib/customerExperienceService';
import { getProductImageUrl } from '@/lib/imageUtils';
import Link from 'next/link';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useProductSuggestions } from '@/hooks/useProductSuggestions';

export default function ProductRecommendations({ limit = 3, showTitle = true, title = "Recommended for You" }) {
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { suggestions, loading: suggestionsLoading } = useProductSuggestions();
  
  // Debug suggestions loading
  useEffect(() => {
    console.log('🎯 Suggestions state changed:', {
      loading: suggestionsLoading,
      count: suggestions?.length || 0,
      suggestions: suggestions
    });
  }, [suggestions, suggestionsLoading]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    } else {
      // For non-authenticated users, show popular products
      fetchPopularProducts();
    }
  }, [user, suggestions]); // Added suggestions dependency

  // Also trigger when suggestions finish loading
  useEffect(() => {
    if (!suggestionsLoading && suggestions && suggestions.length > 0) {
      console.log('🔄 Suggestions loaded, refreshing recommendations...');
      if (user) {
        fetchRecommendations();
      } else {
        fetchPopularProducts();
      }
    }
  }, [suggestionsLoading, suggestions]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching personalized recommendations for user:', user.uid);
      const items = await CustomerExperienceService.getPersonalizedRecommendations(user.uid, limit);
      console.log('📊 Personalized recommendations received:', items);
      
      // Combine with suggested products
      const combinedRecommendations = combineWithSuggestions(items);
      setRecommendations(combinedRecommendations);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Fallback to popular products
      await fetchPopularProducts();
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularProducts = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching popular products as fallback');
      const items = await CustomerExperienceService.getPopularProducts(limit);
      console.log('📊 Popular products received:', items);
      
      // Combine with suggested products
      const combinedRecommendations = combineWithSuggestions(items);
      setRecommendations(combinedRecommendations);
    } catch (error) {
      console.error('Error fetching popular products:', error);
    } finally {
      setLoading(false);
    }
  };

  const combineWithSuggestions = (systemRecommendations) => {
    console.log('🔄 Combining suggestions with system recommendations...');
    console.log('📊 Suggestions available:', suggestions?.length || 0);
    console.log('📊 System recommendations:', systemRecommendations?.length || 0);
    
    if (!suggestions || suggestions.length === 0) {
      console.log('⚠️ No suggestions available, returning system recommendations only');
      return systemRecommendations;
    }

    // Convert suggestions to recommendation format
    const suggestedProducts = suggestions.map(suggestion => ({
      id: suggestion.productId,
      name: suggestion.product?.name || 'Unknown Product',
      description: suggestion.product?.description || '',
      price: suggestion.product?.price || 0,
      discount: suggestion.product?.discount || 0,
      imageUrl: suggestion.product?.imageUrl || null,
      sku: suggestion.product?.sku || '',
      manufacturer: suggestion.product?.manufacturer || '',
      priority: suggestion.priority || 1,
      isSuggested: true,
      suggestionReason: suggestion.reason || ''
    }));

    // Combine and prioritize
    const combined = [...suggestedProducts, ...systemRecommendations];
    
    // Remove duplicates based on product ID
    const unique = combined.filter((product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
    );

    // Sort by priority (suggested products first, then by priority)
    unique.sort((a, b) => {
      if (a.isSuggested && !b.isSuggested) return -1;
      if (!a.isSuggested && b.isSuggested) return 1;
      if (a.isSuggested && b.isSuggested) return (b.priority || 1) - (a.priority || 1);
      return 0;
    });

    console.log('🎯 Combined recommendations:', unique.slice(0, limit));
    return unique.slice(0, limit);
  };

  const getImageUrl = (product) => {
    return getProductImageUrl(product, "200x200");
  };

  const getRecommendationBadge = (product) => {
    if (product.isSuggested) {
      return { text: 'Suggested', color: 'bg-yellow-100 text-yellow-800' };
    }
    
    switch (product.reason) {
      case 'Similar category':
        return { text: 'Similar Category', color: 'bg-blue-100 text-blue-800' };
      case 'Same manufacturer':
        return { text: 'Same Brand', color: 'bg-green-100 text-green-800' };
      case 'Popular product':
        return { text: 'Popular', color: 'bg-purple-100 text-purple-800' };
      default:
        return { text: 'Recommended', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        {showTitle && (
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2" />
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg mb-2"></div>
              <div className="bg-gray-200 h-4 rounded mb-1"></div>
              <div className="bg-gray-200 h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't show empty state
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2" />
            {title}
          </h2>
          <Link 
            href="/search" 
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((product) => {
          const badge = getRecommendationBadge(product);
          
          return (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group block"
            >
              <div className="relative">
                <img
                  src={getImageUrl(product)}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                />
                <div className={`absolute top-2 right-2 text-xs px-2 py-1 rounded ${badge.color}`}>
                  {badge.text}
                </div>
              </div>
              <div className="mt-2">
                <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500">
                  UGX {product.price?.toLocaleString() || 'N/A'}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
