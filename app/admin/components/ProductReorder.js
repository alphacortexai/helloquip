"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsUpDownIcon,
  CheckIcon,
  XMarkIcon,
  Cog6ToothIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Shuffle interval options in milliseconds
const SHUFFLE_INTERVALS = [
  { value: "manual", label: "Manual Only", ms: null },
  { value: "page_reload", label: "On Page Reload", ms: 0 },
  { value: "5min", label: "Every 5 minutes", ms: 5 * 60 * 1000 },
  { value: "30min", label: "Every 30 minutes", ms: 30 * 60 * 1000 },
  { value: "1hr", label: "Every 1 hour", ms: 60 * 60 * 1000 },
  { value: "5hr", label: "Every 5 hours", ms: 5 * 60 * 60 * 1000 },
  { value: "24hr", label: "Every 24 hours", ms: 24 * 60 * 60 * 1000 },
  { value: "48hr", label: "Every 48 hours", ms: 48 * 60 * 60 * 1000 },
  { value: "1week", label: "Every 1 week", ms: 7 * 24 * 60 * 60 * 1000 },
];

export default function ProductReorder() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filter, setFilter] = useState("all"); // 'all', 'ordered', 'unordered'
  
  // Reorder settings
  const [reorderMode, setReorderMode] = useState("manual"); // 'manual' or 'automatic'
  const [shuffleInterval, setShuffleInterval] = useState("page_reload");
  const [lastShuffleAt, setLastShuffleAt] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchReorderSettings();
  }, []);

  const fetchReorderSettings = async () => {
    setSettingsLoading(true);
    try {
      const settingsRef = doc(db, "settings", "productReorder");
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setReorderMode(data.mode || "manual");
        setShuffleInterval(data.interval || "page_reload");
        setLastShuffleAt(data.lastShuffleAt?.toDate?.() || null);
      }
    } catch (error) {
      console.error("Error fetching reorder settings:", error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveReorderSettings = async () => {
    setSavingSettings(true);
    try {
      const settingsRef = doc(db, "settings", "productReorder");
      await setDoc(settingsRef, {
        mode: reorderMode,
        interval: reorderMode === "manual" ? "manual" : shuffleInterval,
        updatedAt: serverTimestamp(),
        // Preserve lastShuffleAt if it exists
        ...(lastShuffleAt && { lastShuffleAt }),
      }, { merge: true });
      
      setMessage({ type: "success", text: "Reorder settings saved successfully!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      console.error("Error saving reorder settings:", error);
      setMessage({ type: "error", text: "Failed to save settings" });
    } finally {
      setSavingSettings(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "products"));
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter out drafts
      const activeProducts = productList.filter((p) => !p.isDraft);

      // Sort: products with displayOrder first, then by displayOrder, then by createdAt
      activeProducts.sort((a, b) => {
        const aHasOrder = a.displayOrder !== undefined && a.displayOrder !== null;
        const bHasOrder = b.displayOrder !== undefined && b.displayOrder !== null;

        if (aHasOrder && bHasOrder) {
          return (a.displayOrder || 0) - (b.displayOrder || 0);
        }
        if (aHasOrder && !bHasOrder) return -1;
        if (!aHasOrder && bHasOrder) return 1;

        // Both don't have displayOrder, sort by createdAt
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bDate - aDate; // Newest first for unordered products
      });

      setProducts(activeProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setMessage({ type: "error", text: "Failed to load products" });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (filter === "ordered") {
      return p.displayOrder !== undefined && p.displayOrder !== null;
    }
    if (filter === "unordered") {
      return p.displayOrder === undefined || p.displayOrder === null;
    }
    return true;
  });

  const moveProduct = (index, direction) => {
    const newProducts = [...filteredProducts];
    const newIndex = direction === "up" ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newProducts.length) return;

    // Swap products
    [newProducts[index], newProducts[newIndex]] = [
      newProducts[newIndex],
      newProducts[index],
    ];

    // Update displayOrder values
    newProducts.forEach((product, idx) => {
      product.displayOrder = idx + 1;
    });

    // Update the full products array
    const updatedProducts = [...products];
    newProducts.forEach((updatedProduct) => {
      const fullIndex = updatedProducts.findIndex(
        (p) => p.id === updatedProduct.id
      );
      if (fullIndex !== -1) {
        updatedProducts[fullIndex] = updatedProduct;
      }
    });

    setProducts(updatedProducts);
  };

  const shuffleProducts = (skipConfirm = false) => {
    if (!skipConfirm && !confirm("Are you sure you want to randomly shuffle all products?")) {
      return;
    }

    // Create a copy of ALL products (not just filtered)
    const allProductsCopy = products.map(p => ({ ...p }));
    
    // Fisher-Yates shuffle algorithm - shuffle ALL products
    for (let i = allProductsCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allProductsCopy[i], allProductsCopy[j]] = [allProductsCopy[j], allProductsCopy[i]];
    }

    // Reset ALL displayOrder values first, then assign new sequential order
    allProductsCopy.forEach((product, idx) => {
      product.displayOrder = idx + 1;
    });

    // Re-sort products by displayOrder to match the new shuffled order
    allProductsCopy.sort((a, b) => {
      const aHasOrder = a.displayOrder !== undefined && a.displayOrder !== null;
      const bHasOrder = b.displayOrder !== undefined && b.displayOrder !== null;

      if (aHasOrder && bHasOrder) {
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      }
      if (aHasOrder && !bHasOrder) return -1;
      if (!aHasOrder && bHasOrder) return 1;

      // Both don't have displayOrder, sort by createdAt
      const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
      const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
      return bDate - aDate;
    });

    // Update state with completely shuffled and sorted products
    setProducts(allProductsCopy);
  };

  // Function to shuffle and save automatically (used by automatic mode)
  const shuffleAndSaveProducts = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Create a copy of ALL products
      const allProductsCopy = products.map(p => ({ ...p }));
      
      // Fisher-Yates shuffle algorithm
      for (let i = allProductsCopy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allProductsCopy[i], allProductsCopy[j]] = [allProductsCopy[j], allProductsCopy[i]];
      }

      // Assign new sequential order
      allProductsCopy.forEach((product, idx) => {
        product.displayOrder = idx + 1;
      });

      // Save to Firestore in batches
      const BATCH_LIMIT = 500;
      const totalProducts = allProductsCopy.length;

      for (let i = 0; i < totalProducts; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        const batchProducts = allProductsCopy.slice(i, i + BATCH_LIMIT);
        
        batchProducts.forEach((product, batchIndex) => {
          const globalIndex = i + batchIndex;
          const newOrder = globalIndex + 1;
          const productRef = doc(db, "products", product.id);
          batch.update(productRef, { displayOrder: newOrder });
        });

        await batch.commit();
      }

      // Update lastShuffleAt timestamp
      const now = new Date();
      const settingsRef = doc(db, "settings", "productReorder");
      await setDoc(settingsRef, {
        lastShuffleAt: serverTimestamp(),
      }, { merge: true });
      setLastShuffleAt(now);

      setMessage({
        type: "success",
        text: `Products shuffled and saved! ${totalProducts} products reordered.`,
      });
      await fetchProducts();
    } catch (error) {
      console.error("Error shuffling products:", error);
      setMessage({ type: "error", text: "Failed to shuffle products: " + error.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  const clearOrder = async () => {
    if (
      !confirm(
        "Are you sure you want to clear all display order? Products will be sorted by creation date."
      )
    ) {
      return;
    }

    setSaving(true);
    try {
      const batch = writeBatch(db);
      const productsToUpdate = products.filter(
        (p) => p.displayOrder !== undefined && p.displayOrder !== null
      );

      productsToUpdate.forEach((product) => {
        const productRef = doc(db, "products", product.id);
        batch.update(productRef, { displayOrder: null });
      });

      await batch.commit();
      setMessage({
        type: "success",
        text: "Display order cleared successfully!",
      });
      await fetchProducts();
    } catch (error) {
      console.error("Error clearing order:", error);
      setMessage({ type: "error", text: "Failed to clear order" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    }
  };

  const saveOrder = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Firestore batch limit is 500 operations, so we need to split into multiple batches if needed
      const BATCH_LIMIT = 500;
      const totalProducts = products.length;
      let totalUpdated = 0;

      // Process products in batches of 500
      for (let i = 0; i < totalProducts; i += BATCH_LIMIT) {
        const batch = writeBatch(db);
        const batchProducts = products.slice(i, i + BATCH_LIMIT);
        
        batchProducts.forEach((product, batchIndex) => {
          const globalIndex = i + batchIndex;
          const newOrder = globalIndex + 1;
          const productRef = doc(db, "products", product.id);
          batch.update(productRef, { displayOrder: newOrder });
          totalUpdated++;
        });

        await batch.commit();
      }

      setMessage({
        type: "success",
        text: `Successfully updated order for ${totalUpdated} product(s)! The main page will now use this order.`,
      });
      await fetchProducts();
    } catch (error) {
      console.error("Error saving order:", error);
      setMessage({ type: "error", text: "Failed to save order: " + error.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading products...</div>
      </div>
    );
  }

  // Get current interval info
  const getCurrentIntervalInfo = () => {
    const interval = SHUFFLE_INTERVALS.find(i => i.value === shuffleInterval);
    return interval || SHUFFLE_INTERVALS[0];
  };

  // Format last shuffle time
  const formatLastShuffle = () => {
    if (!lastShuffleAt) return "Never";
    return lastShuffleAt.toLocaleString();
  };

  // Calculate next shuffle time
  const getNextShuffleInfo = () => {
    if (reorderMode === "manual") return "Manual mode - no automatic shuffle";
    
    const interval = getCurrentIntervalInfo();
    if (interval.value === "page_reload") return "Will shuffle on next page reload";
    if (!interval.ms) return "N/A";
    if (!lastShuffleAt) return "Will shuffle on next check";
    
    const nextShuffle = new Date(lastShuffleAt.getTime() + interval.ms);
    const now = new Date();
    
    if (nextShuffle <= now) return "Due now - will shuffle on next page load";
    return `Next shuffle: ${nextShuffle.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Reorder Products</h2>
        <p className="text-sm text-gray-600">
          Set the display order of products on the main page. Products with order
          numbers appear first, sorted by their order value.
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : message.type === "error"
              ? "bg-red-50 text-red-800 border border-red-200"
              : "bg-blue-50 text-blue-800 border border-blue-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Reorder Mode Settings */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Shuffle Settings</h3>
        </div>

        {settingsLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-500">Loading settings...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Mode Selection */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shuffle Mode
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reorderMode"
                      value="manual"
                      checked={reorderMode === "manual"}
                      onChange={(e) => setReorderMode(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Manual</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="reorderMode"
                      value="automatic"
                      checked={reorderMode === "automatic"}
                      onChange={(e) => setReorderMode(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Automatic</span>
                  </label>
                </div>
              </div>

              {/* Interval Selection (only for automatic mode) */}
              {reorderMode === "automatic" && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shuffle Interval
                  </label>
                  <select
                    value={shuffleInterval}
                    onChange={(e) => setShuffleInterval(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SHUFFLE_INTERVALS.filter(i => i.value !== "manual").map((interval) => (
                      <option key={interval.value} value={interval.value}>
                        {interval.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Status Info */}
            {reorderMode === "automatic" && (
              <div className="flex flex-col sm:flex-row gap-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    <strong>Last shuffle:</strong> {formatLastShuffle()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    {getNextShuffleInfo()}
                  </span>
                </div>
              </div>
            )}

            {/* Save Settings Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={saveReorderSettings}
                disabled={savingSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {savingSettings ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    Save Settings
                  </>
                )}
              </button>

              {reorderMode === "automatic" && (
                <button
                  onClick={shuffleAndSaveProducts}
                  disabled={saving || products.length === 0}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Shuffling...
                    </>
                  ) : (
                    <>
                      <ArrowsUpDownIcon className="w-4 h-4" />
                      Shuffle Now
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Mode Description */}
            <p className="text-xs text-gray-500">
              {reorderMode === "manual" 
                ? "In manual mode, you can manually reorder products using the controls below or the Shuffle All button."
                : "In automatic mode, products will be randomly shuffled based on the selected interval. The shuffle happens when any user loads the main page and the interval has passed."}
            </p>
          </div>
        )}
      </div>

      {/* Manual Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Products</option>
            <option value="ordered">With Order</option>
            <option value="unordered">Without Order</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={shuffleProducts}
            disabled={filteredProducts.length === 0 || saving}
            className="px-4 py-1.5 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowsUpDownIcon className="w-4 h-4" />
            Shuffle All
          </button>

          <button
            onClick={clearOrder}
            disabled={saving}
            className="px-4 py-1.5 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <XMarkIcon className="w-4 h-4" />
            Clear Order
          </button>

          <button
            onClick={saveOrder}
            disabled={saving || filteredProducts.length === 0}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                Save Order
              </>
            )}
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Product List */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No products found.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Order Number */}
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center font-semibold text-blue-700">
                {product.displayOrder !== undefined &&
                product.displayOrder !== null
                  ? product.displayOrder
                  : "-"}
              </div>

              {/* Product Image */}
              <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={
                      typeof product.imageUrl === "object"
                        ? product.imageUrl.original ||
                          product.imageUrl["200x200"] ||
                          product.imageUrl
                        : product.imageUrl
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-100"
                  style={{
                    display: product.imageUrl ? "none" : "flex",
                  }}
                >
                  🏥
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {product.categoryName || product.category} • UGX{" "}
                  {product.price?.toLocaleString()}
                </p>
                {product.sku && (
                  <p className="text-xs text-gray-400 mt-1">SKU: {product.sku}</p>
                )}
              </div>

              {/* Move Buttons */}
              <div className="flex-shrink-0 flex flex-col gap-1">
                <button
                  onClick={() => moveProduct(index, "up")}
                  disabled={index === 0 || saving}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <ArrowUpIcon className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={() => moveProduct(index, "down")}
                  disabled={index === filteredProducts.length - 1 || saving}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <ArrowDownIcon className="w-4 h-4 text-gray-700" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          How it works:
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>
            Products with order numbers appear first on the main page, sorted by
            their order value.
          </li>
          <li>
            <strong>Manual Mode:</strong> Use the up/down arrows to reorder products, or click "Shuffle All"
            for a random order. Click "Save Order" to apply changes.
          </li>
          <li>
            <strong>Automatic Mode:</strong> Products are automatically shuffled based on your selected interval
            (page reload, 5min, 30min, 1hr, 5hr, 24hrs, 48hrs, or 1 week).
          </li>
          <li>
            The automatic shuffle happens when a user visits the main page and the interval has passed since the last shuffle.
          </li>
          <li>
            Products without order numbers are sorted by creation date (newest
            first).
          </li>
        </ul>
      </div>
    </div>
  );
}

