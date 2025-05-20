// 



"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import CategoryForm from "./CategoryForm";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await deleteDoc(doc(db, "categories", id));
      fetchCategories();
    }
  };

  const cancelEditing = () => setEditing(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Manage Categories</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className={`p-4 border rounded-lg shadow-sm relative ${
              editing?.id === cat.id ? "bg-blue-50 border-blue-400" : ""
            }`}
          >
            <img
              src={cat.imageUrl}
              alt={cat.name}
              className="w-24 h-24 object-cover mb-2 rounded-full mx-auto"
            />
            <h4 className="text-center font-semibold text-lg">{cat.name}</h4>

            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => setEditing(cat)}
                className="text-sm px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-sm px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>

            {editing?.id === cat.id && (
              <div className="mt-4 border-t pt-4">
                <h5 className="font-medium mb-2 text-gray-900">Editing Category</h5>
                <CategoryForm
                  existingCategory={editing}
                  onSuccess={() => {
                    fetchCategories();
                    cancelEditing();
                  }}
                />
                <button
                  onClick={cancelEditing}
                  className="mt-2 text-sm text-gray-900 underline hover:text-black"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
