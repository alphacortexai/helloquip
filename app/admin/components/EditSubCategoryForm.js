"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

export default function EditSubCategoryForm({ onSuccess }) {
  const [topCategories, setTopCategories] = useState([]);
  const [selectedTopCategory, setSelectedTopCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch all top-level categories (parentId === null)
  useEffect(() => {
    const fetchTopCategories = async () => {
      const q = query(collection(db, "categories"), where("parentId", "==", null));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTopCategories(list);
    };

    fetchTopCategories();
  }, []);

  // Fetch subcategories when top category is selected
  useEffect(() => {
    if (!selectedTopCategory) return;
    const fetchSubCategories = async () => {
      const q = query(
        collection(db, "categories"),
        where("parentId", "==", selectedTopCategory)
      );
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSubCategories(list);
    };

    fetchSubCategories();
    setSelectedSubCategory(""); // reset
    setName(""); // reset
  }, [selectedTopCategory]);

  // Load subcategory name for editing
  useEffect(() => {
    if (!selectedSubCategory) return;
    const fetchSubCategory = async () => {
      const docRef = doc(db, "categories", selectedSubCategory);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setName(docSnap.data().name);
      }
    };
    fetchSubCategory();
  }, [selectedSubCategory]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedSubCategory || !name.trim()) return alert("Please fill all fields.");
    setLoading(true);
    try {
      const docRef = doc(db, "categories", selectedSubCategory);
      await updateDoc(docRef, { name: name.trim() });
      alert("Subcategory updated!");
      onSuccess && onSuccess();
    } catch (error) {
      console.error("Error updating subcategory:", error);
      alert("Failed to update subcategory.");
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleUpdate}
      className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-6"
    >
      <h2 className="text-lg font-semibold text-gray-800">Edit Subcategory</h2>

      {/* Top-Level Category Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Category
        </label>
        <select
          value={selectedTopCategory}
          onChange={(e) => setSelectedTopCategory(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
          required
        >
          <option value="">-- Choose Category --</option>
          {topCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory Selector */}
      {selectedTopCategory && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Subcategory
          </label>
          <select
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
            required
          >
            <option value="">-- Choose Subcategory --</option>
            {subCategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Name Editor */}
      {selectedSubCategory && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Subcategory Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
            placeholder="Enter new name"
            required
            disabled={loading}
          />
        </div>
      )}

      {/* Submit Button */}
      {selectedSubCategory && (
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-3 rounded-md font-semibold transition-opacity ${
            loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
        >
          {loading ? "Updating..." : "Update Subcategory"}
        </button>
      )}
    </form>
  );
}
