"use client";
import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CategoryForm({ existingCategory = null, onSuccess }) {
  const [name, setName] = useState(existingCategory?.name || "");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = existingCategory?.imageUrl || "";
      if (image) {
        const imageRef = ref(storage, `categories/${image.name}`);
        await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(imageRef);
      }

      if (existingCategory) {
        const docRef = doc(db, "categories", existingCategory.id);
        await updateDoc(docRef, { name, imageUrl });
      } else {
        await addDoc(collection(db, "categories"), { name, imageUrl });
      }

      onSuccess && onSuccess();
      setName("");
      setImage(null);
    } catch (err) {
      console.error("Error submitting category:", err);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Category Name"
        className="w-full p-2 border rounded"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {existingCategory ? "Update Category" : "Create Category"}
      </button>
    </form>
  );
}
