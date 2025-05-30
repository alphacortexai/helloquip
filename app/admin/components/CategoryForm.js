// "use client";
// import { useState } from "react";
// import { db, storage } from "@/lib/firebase";
// import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// export default function CategoryForm({ existingCategory = null, onSuccess }) {
//   const [name, setName] = useState(existingCategory?.name || "");
//   const [image, setImage] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       let imageUrl = existingCategory?.imageUrl || "";
//       if (image) {
//         const imageRef = ref(storage, `categories/${image.name}`);
//         await uploadBytes(imageRef, image);
//         imageUrl = await getDownloadURL(imageRef);
//       }

//       if (existingCategory) {
//         const docRef = doc(db, "categories", existingCategory.id);
//         await updateDoc(docRef, { name, imageUrl });
//       } else {
//         await addDoc(collection(db, "categories"), { name, imageUrl });
//       }

//       onSuccess && onSuccess();
//       setName("");
//       setImage(null);
//     } catch (err) {
//       console.error("Error submitting category:", err);
//     }

//     setLoading(false);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <input
//         type="text"
//         placeholder="Category Name"
//         className="w-full p-2 border rounded"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         required
//       />
//       <input
//         type="file"
//         accept="image/*"
//         onChange={(e) => setImage(e.target.files[0])}
//       />
//       <button
//         type="submit"
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//         disabled={loading}
//       >
//         {existingCategory ? "Update Category" : "Create Category"}
//       </button>
//     </form>
//   );
// }




"use client";
import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function CategoryForm({ existingCategory = null, onSuccess }) {
  const [name, setName] = useState(existingCategory?.name || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(existingCategory?.imageUrl || null);
  const [loading, setLoading] = useState(false);

  // Generate preview URL when image changes
  useEffect(() => {
    if (!image) {
      setPreview(existingCategory?.imageUrl || null);
      return;
    }
    const objectUrl = URL.createObjectURL(image);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [image, existingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = existingCategory?.imageUrl || "";
      if (image) {
        const imageRef = ref(storage, `categories/${image.name}-${Date.now()}`);
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
      setPreview(null);
    } catch (err) {
      console.error("Error submitting category:", err);
      alert("Failed to save category. Please try again.");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-6"
    >
      <div>
        <label
          htmlFor="categoryName"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category Name
        </label>
        <input
          id="categoryName"
          type="text"
          placeholder="Enter category name"
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="categoryImage"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Category Image
        </label>
        <input
          id="categoryImage"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          disabled={loading}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {preview && (
          <img
            src={preview}
            alt="Selected preview"
            className="mt-4 w-32 h-32 object-cover rounded-md border border-gray-200 shadow-sm"
          />
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-3 rounded-md font-semibold transition-opacity ${
          loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
        }`}
      >
        {loading && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        )}
        {existingCategory ? "Update Category" : "Create Category"}
      </button>
    </form>
  );
}
