"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where 
} from "firebase/firestore";
import { 
  StarIcon, 
  PlusIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";

export default function ProductSuggestions() {
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSuggestedProducts();
    loadAllProducts();
  }, []);

  const loadSuggestedProducts = async () => {
    try {
      const suggestionsRef = collection(db, "productSuggestions");
      const q = query(suggestionsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      
      const suggestions = [];
      for (const docSnap of snapshot.docs) {
        const suggestionData = docSnap.data();
        // Get product details
        const productRef = doc(db, "products", suggestionData.productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          suggestions.push({
            id: docSnap.id,
            productId: suggestionData.productId,
            product: productSnap.data(),
            priority: suggestionData.priority || 1,
            reason: suggestionData.reason || '',
            createdAt: suggestionData.createdAt,
            createdBy: suggestionData.createdBy || 'Admin'
          });
        }
      }
      setSuggestedProducts(suggestions);
    } catch (error) {
      console.error('Error loading suggested products:', error);
      setMessage({ type: 'error', text: 'Failed to load suggested products' });
    }
  };

  const loadAllProducts = async () => {
    try {
      const productsRef = collection(db, "products");
      const snapshot = await getDocs(productsRef);
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAllProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSuggestion = async (productId, priority = 1, reason = '') => {
    setSaving(true);
    try {
      // Check if already suggested
      const existing = suggestedProducts.find(s => s.productId === productId);
      if (existing) {
        setMessage({ type: 'error', text: 'Product is already suggested' });
        return;
      }

      await addDoc(collection(db, "productSuggestions"), {
        productId,
        priority,
        reason,
        createdAt: new Date(),
        createdBy: 'Admin'
      });

      setMessage({ type: 'success', text: 'Product added to suggestions successfully!' });
      loadSuggestedProducts();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error adding suggestion:', error);
      setMessage({ type: 'error', text: 'Failed to add suggestion' });
    } finally {
      setSaving(false);
    }
  };

  const removeSuggestion = async (suggestionId) => {
    try {
      await deleteDoc(doc(db, "productSuggestions", suggestionId));
      setMessage({ type: 'success', text: 'Suggestion removed successfully!' });
      loadSuggestedProducts();
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error removing suggestion:', error);
      setMessage({ type: 'error', text: 'Failed to remove suggestion' });
    }
  };

  const filteredProducts = allProducts.filter(product => {
    const isAlreadySuggested = suggestedProducts.some(s => s.productId === product.id);
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
    return !isAlreadySuggested && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <StarIcon className="h-6 w-6 text-yellow-600 mr-3" />
            <h1 className="text-xl font-semibold text-gray-900">Product Suggestions</h1>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Suggest products to be recommended to all users. These will be added to the system's automatic recommendations.
          </p>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mx-6 mt-4 flex items-center p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 mr-2" />
            ) : (
              <XCircleIcon className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <div className="p-6">
          {/* Current Suggestions */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Current Suggestions ({suggestedProducts.length})
            </h2>
            
            {suggestedProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestedProducts.map((suggestion) => (
                  <div key={suggestion.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          {suggestion.product?.name || 'Unknown Product'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {suggestion.product?.manufacturer || 'Unknown Manufacturer'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          UGX {suggestion.product?.price?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeSuggestion(suggestion.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Remove suggestion"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Priority: {suggestion.priority}</span>
                      <span>{suggestion.createdBy}</span>
                    </div>
                    
                    {suggestion.reason && (
                      <p className="text-xs text-gray-600 mt-2 italic">
                        "{suggestion.reason}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <StarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No products suggested yet</p>
                <p className="text-sm">Add suggestions below to recommend products to all users</p>
              </div>
            )}
          </div>

          {/* Add New Suggestions */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Add Product Suggestions</h2>
            
            {/* Search */}
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products to suggest..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Product List */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.slice(0, 20).map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          {product.name || 'Unnamed Product'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {product.manufacturer || 'Unknown Manufacturer'}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          UGX {product.price?.toLocaleString() || 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => addSuggestion(product.id)}
                        disabled={saving}
                        className="text-blue-600 hover:text-blue-700 p-1 disabled:opacity-50"
                        title="Add to suggestions"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {product.description && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>{searchTerm ? 'No products found matching your search' : 'All products have been suggested'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
