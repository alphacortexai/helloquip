"use client";

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { FolderIcon } from "@heroicons/react/24/outline";

const generateSlug = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

function generateResizedUrls(originalUrl) {
  if (!originalUrl) return null;

  const decodedUrl = decodeURIComponent(originalUrl);
  const token = originalUrl.includes("?") ? "?" + originalUrl.split("?")[1] : "";

  const lastSlash = decodedUrl.lastIndexOf("/");
  const basePath = decodedUrl.substring(0, lastSlash + 1);
  const filename = decodedUrl.substring(lastSlash + 1);
  const dotIndex = filename.lastIndexOf(".");
  const nameWithoutExt = filename.substring(0, dotIndex);

  const sizes = ["90x90", "200x200", "800x800"];
  const resizedUrls = {};

  sizes.forEach((size) => {
    const resizedFile = `${nameWithoutExt}_${size}.webp`;
    const resizedUrl = `${basePath}${resizedFile}${token}`;
    resizedUrls[size] = resizedUrl;
  });

  resizedUrls.original = originalUrl;
  return resizedUrls;
}

export default function CategoryForm() {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !imageFile) {
      setMessage("Please provide both name and image.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const slug = generateSlug(name);

      // Upload original image
      const storageRef = ref(storage, `category-images/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(storageRef, imageFile);
      const originalUrl = await getDownloadURL(storageRef);

      // Generate resized URLs
      const imageUrl = generateResizedUrls(originalUrl);

      // Save to Firestore as object
      await addDoc(collection(db, "categories"), {
        name,
        slug,
        imageUrl,
        parentId: null, // This marks it as a MAIN category
        createdAt: new Date(),
      });

      setMessage("✅ Main category created successfully!");
      setName("");
      setImageFile(null);
    } catch (error) {
      setMessage("❌ Error uploading category: " + error.message);
    }

    setUploading(false);
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FolderIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Create Main Category</h2>
            <p className="text-sm text-gray-600">Add a new main product category</p>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Main Categories Only</h3>
              <p className="text-sm text-blue-700 mt-1">
                This form creates main categories. To create sub-categories, use the "Sub Categories" section in the admin panel.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g., Medical Equipment, Electronics, Tools"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload an image that represents this category
            </p>
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Creating..." : "Create Main Category"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-md text-sm ${
            message.includes("✅") 
              ? "bg-green-50 text-green-800 border border-green-200" 
              : "bg-red-50 text-red-800 border border-red-200"
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
