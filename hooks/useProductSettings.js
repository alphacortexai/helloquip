"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

// Default settings
const defaultSettings = {
  showMOQ: true,
  showSKU: true,
  productNameCase: 'titlecase' // 'titlecase', 'uppercase', 'lowercase', 'normal'
};

function toTitleCase(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .trim()
    .split(/\s+/)
    .map((word) =>
      word
        .split('-')
        .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part))
        .join('-')
    )
    .join(' ');
}

// Create context
const ProductSettingsContext = createContext({
  settings: defaultSettings,
  loading: true,
  error: null
});

// Provider component
export function ProductSettingsProvider({ children }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'productDisplay');
    
    const unsubscribe = onSnapshot(
      settingsRef,
      (doc) => {
        if (doc.exists()) {
          setSettings({ ...defaultSettings, ...doc.data() });
        } else {
          setSettings(defaultSettings);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error loading product settings:', err);
        setError(err);
        setLoading(false);
        // Fallback to default settings on error
        setSettings(defaultSettings);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <ProductSettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </ProductSettingsContext.Provider>
  );
}

// Hook to use the settings
export function useProductSettings() {
  const context = useContext(ProductSettingsContext);
  if (context === undefined) {
    throw new Error('useProductSettings must be used within a ProductSettingsProvider');
  }
  return context;
}

// Utility function to format product name based on settings
export function formatProductName(name, settings) {
  if (!name) return 'Unnamed Product';
  const caseType = settings?.productNameCase || 'titlecase';

  switch (caseType) {
    case 'uppercase':
      return name.toUpperCase();
    case 'lowercase':
      return name.toLowerCase();
    case 'normal':
    case 'titlecase':
    default:
      return toTitleCase(name);
  }
}

// Utility function to check if MOQ should be shown
export function shouldShowMOQ(settings) {
  return settings.showMOQ;
}

// Utility function to check if SKU should be shown
export function shouldShowSKU(settings) {
  return settings.showSKU;
}

