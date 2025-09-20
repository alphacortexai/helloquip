"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function LatestProductsViewer() {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLatestProducts();
  }, []);

  const fetchLatestProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products ordered by createdAt descending (most recent first)
      const q = query(
        collection(db, "products"),
        orderBy("createdAt", "desc"),
        limit(50) // Increased to show more recent products
      );

      const snapshot = await getDocs(q);
      const products = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('Latest products fetched:', products.length);
      setLatestProducts(products);
    } catch (err) {
      console.error('Error fetching latest products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    
    try {
      let dateObj;
      // Handle Firestore Timestamp
      if (date && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      }
      // Handle JavaScript Date
      else if (date instanceof Date) {
        dateObj = date;
      }
      // Handle ISO string or timestamp
      else {
        dateObj = new Date(date);
      }
      
      const isToday = dateObj.toDateString() === new Date().toDateString();
      const formatted = dateObj.toLocaleString();
      
      return isToday ? `🆕 Today - ${formatted}` : formatted;
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    if (typeof imageUrl === 'string') {
      return imageUrl;
    }
    
    if (typeof imageUrl === 'object') {
      return imageUrl['200x200'] || imageUrl['original'] || Object.values(imageUrl)[0];
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Latest Product Uploads</h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading latest products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Latest Product Uploads</h2>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading products: {error}</p>
          <button 
            onClick={fetchLatestProducts}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Latest Product Uploads</h2>
        <button 
          onClick={fetchLatestProducts}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
        >
          Refresh
        </button>
      </div>

      {latestProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No products found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {latestProducts.map((product, index) => (
            <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  {getImageUrl(product.imageUrl) ? (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {product.name || 'Unnamed Product'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {product.description ? 
                          (product.description.length > 100 ? 
                            `${product.description.substring(0, 100)}...` : 
                            product.description
                          ) : 
                          'No description'
                        }
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        ${product.price || 0}
                      </div>
                      <div className="text-xs text-gray-500">
                        {product.status || 'active'}
                      </div>
                    </div>
                  </div>

                  {/* Product Metadata */}
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>
                      <strong>Created:</strong> {formatDate(product.createdAt)}
                    </span>
                    <span>
                      <strong>Updated:</strong> {formatDate(product.updatedAt)}
                    </span>
                    <span>
                      <strong>SKU:</strong> {product.sku || 'N/A'}
                    </span>
                    <span>
                      <strong>Category:</strong> {product.categoryName || 'N/A'}
                    </span>
                    <span>
                      <strong>Shop:</strong> {product.shopName || 'N/A'}
                    </span>
                  </div>

                  {/* Product ID for debugging */}
                  <div className="mt-1 text-xs text-gray-400">
                    ID: {product.id}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Showing {latestProducts.length} most recent products (newest first)
      </div>
    </div>
  );
}
