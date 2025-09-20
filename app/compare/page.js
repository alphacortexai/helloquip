"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CustomerExperienceService } from '@/lib/customerExperienceService';
import { toast } from 'sonner';
import Link from 'next/link';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

export default function ProductComparisonPage() {
  const [user, setUser] = useState(null);
  const [comparisonList, setComparisonList] = useState({ products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchComparisonList();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchComparisonList = async () => {
    try {
      setLoading(true);
      const list = await CustomerExperienceService.getComparisonList(user.uid);
      setComparisonList(list);
    } catch (error) {
      console.error('Error fetching comparison list:', error);
      toast.error('Failed to load comparison list');
    } finally {
      setLoading(false);
    }
  };

  const removeFromComparison = async (productId) => {
    try {
      const result = await CustomerExperienceService.removeFromComparison(user.uid, productId);
      if (result.success) {
        setComparisonList(prev => ({
          ...prev,
          products: prev.products.filter(p => p.id !== productId)
        }));
        toast.success('Removed from comparison');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to remove product');
    }
  };

  const getImageUrl = (product) => {
    if (product.imageUrl && typeof product.imageUrl === 'object') {
      return product.imageUrl['680x680'] || product.imageUrl.original;
    }
    return product.imageUrl || product.image || "/fallback.jpg";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to compare products.</p>
          <Link href="/register" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (comparisonList.products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Products to Compare</h1>
          <p className="text-gray-600 mb-6">Add products to your comparison list to see them here.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Comparison</h1>
          <p className="text-gray-600 mt-2">Compare {comparisonList.products.length} products side by side</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  {comparisonList.products.map((product) => (
                    <th key={product.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider relative">
                      <button
                        onClick={() => removeFromComparison(product.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        title="Remove from comparison"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                      <div className="pt-6">
                        <img
                          src={getImageUrl(product)}
                          alt={product.name}
                          className="h-32 w-32 object-cover rounded-lg mx-auto mb-2"
                        />
                        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Price Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Price
                  </td>
                  {comparisonList.products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      <span className="text-lg font-semibold">
                        UGX {product.price?.toLocaleString() || 'N/A'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* SKU Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    SKU
                  </td>
                  {comparisonList.products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {product.sku || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Category Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Category
                  </td>
                  {comparisonList.products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {product.categoryName || product.category || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Manufacturer Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Manufacturer
                  </td>
                  {comparisonList.products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {product.manufacturer || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Stock Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Stock
                  </td>
                  {comparisonList.products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        (product.qty || 0) > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(product.qty || 0) > 0 ? `${product.qty} in stock` : 'Out of stock'}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Warranty Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Warranty
                  </td>
                  {comparisonList.products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      {product.warranty || 'N/A'}
                    </td>
                  ))}
                </tr>

                {/* Description Row */}
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Description
                  </td>
                  {comparisonList.products.map((product) => (
                    <td key={product.id} className="px-6 py-4 text-sm text-gray-500">
                      <p className="line-clamp-3">
                        {product.description || 'No description available'}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Actions Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Actions
                  </td>
                  {comparisonList.products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      <div className="flex flex-col space-y-2">
                        <Link
                          href={`/product/${product.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => {
                            // Add to cart functionality
                            toast.success('Added to cart');
                          }}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm flex items-center justify-center"
                        >
                          <ShoppingCartIcon className="h-4 w-4 mr-1" />
                          Add to Cart
                        </button>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
