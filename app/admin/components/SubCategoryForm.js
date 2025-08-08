

"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { toast } from "sonner";
import { FolderIcon } from "@heroicons/react/24/outline";

export default function SubCategoryForm({ onSuccess }) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Only fetch main categories (parentId is null)
        const q = query(collection(db, "categories"), where("parentId", "==", null));
        const snapshot = await getDocs(q);
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(list);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const generateSlug = (name) =>
    name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!parentId) {
      toast.warning("Please select a parent category.");
      return;
    }
    
    if (!name.trim()) {
      toast.warning("Please enter a subcategory name.");
      return;
    }

    setLoading(true);
    try {
      const slug = generateSlug(name);
      
      await addDoc(collection(db, "categories"), {
        name: name.trim(),
        slug,
        parentId, // Use parentId to link to main category
        imageUrl: "", // Optional
        createdAt: new Date(),
      });

      toast.success("Subcategory created successfully!");
      onSuccess && onSuccess();
      setName("");
      setParentId("");
    } catch (err) {
      console.error("Error adding subcategory:", err);
      toast.error("Failed to create subcategory.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <FolderIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create Sub Category</h2>
            <p className="text-sm text-gray-600">Add a new sub-category under a main category</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Sub-Categories Only</h3>
              <p className="text-sm text-green-700 mt-1">
                This form creates sub-categories that belong to main categories. To create main categories, use the "Add Category" section.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Category *
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
              required
            >
              <option value="">-- Select Main Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose the main category this sub-category will belong to
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub-Category Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Surgical Tools, Diagnostic Equipment, Monitoring Devices"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a specific name for this sub-category
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Sub-Category"}
          </button>
        </form>

        {/* Example Structure */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Example Structure:</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>📁 Medical Equipment (Main Category)</div>
            <div className="ml-4">└── 🗂️ Surgical Tools (Sub-Category)</div>
            <div className="ml-4">└── 🗂️ Diagnostic Equipment (Sub-Category)</div>
            <div className="ml-4">└── 🗂️ Monitoring Devices (Sub-Category)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
