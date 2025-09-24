"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { 
  collection, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  doc 
} from "firebase/firestore";

export function useProductSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      console.log('🔍 Loading product suggestions from Firestore...');
      const suggestionsRef = collection(db, "productSuggestions");
      // Try without ordering first to see if that's the issue
      const q = query(suggestionsRef);
      const snapshot = await getDocs(q);
      
      console.log('📊 Found suggestions documents:', snapshot.docs.length);
      
      const suggestions = [];
      for (const docSnap of snapshot.docs) {
        const suggestionData = docSnap.data();
        console.log('🔍 Processing suggestion:', suggestionData);
        
        // Get product details
        const productRef = doc(db, "products", suggestionData.productId);
        const productSnap = await getDoc(productRef);
        if (productSnap.exists()) {
          const suggestion = {
            id: docSnap.id,
            productId: suggestionData.productId,
            product: productSnap.data(),
            priority: suggestionData.priority || 1,
            reason: suggestionData.reason || '',
            createdAt: suggestionData.createdAt,
            createdBy: suggestionData.createdBy || 'Admin'
          };
          suggestions.push(suggestion);
          console.log('✅ Added suggestion:', suggestion.product?.name);
        } else {
          console.log('⚠️ Product not found for suggestion:', suggestionData.productId);
        }
      }
      
      console.log('🎯 Final suggestions loaded:', suggestions.length);
      setSuggestions(suggestions);
    } catch (err) {
      console.error('Error loading product suggestions:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { suggestions, loading, error, refetch: loadSuggestions };
}
