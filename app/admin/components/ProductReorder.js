"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsUpDownIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function ProductReorder() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filter, setFilter] = useState("all"); // 'all', 'ordered', 'unordered'

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const shuffleProducts = () => {
    if (!confirm("Are you sure you want to randomly shuffle all products?")) {
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

      {/* Controls */}
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
            Use the up/down arrows to reorder products, or click "Shuffle All"
            for a random order.
          </li>
          <li>
            Click "Save Order" to save your changes. Changes take effect
            immediately on the main page.
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

