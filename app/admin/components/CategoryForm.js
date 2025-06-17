// "use client";
// import { useState, useEffect } from "react";
// import { db, storage } from "@/lib/firebase";
// import {
//   collection,
//   addDoc,
//   updateDoc,
//   doc,
//   getDocs,
// } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// export default function CategoryForm({ existingCategory = null, onSuccess }) {
//   const [name, setName] = useState(existingCategory?.name || "");
//   const [image, setImage] = useState(null);
//   const [preview, setPreview] = useState(existingCategory?.imageUrl || null);
//   const [loading, setLoading] = useState(false);
//   const [parentId, setParentId] = useState(existingCategory?.parentId || "");
//   const [allCategories, setAllCategories] = useState([]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       const snapshot = await getDocs(collection(db, "categories"));
//       const list = snapshot.docs.map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setAllCategories(list);
//     };
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     if (!image) {
//       setPreview(existingCategory?.imageUrl || null);
//       return;
//     }
//     const objectUrl = URL.createObjectURL(image);
//     setPreview(objectUrl);
//     return () => URL.revokeObjectURL(objectUrl);
//   }, [image, existingCategory]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       let imageUrl = existingCategory?.imageUrl || "";
//       if (image) {
//         const imageRef = ref(
//           storage,
//           `categories/${image.name}-${Date.now()}`
//         );
//         await uploadBytes(imageRef, image);
//         imageUrl = await getDownloadURL(imageRef);
//       }

//       const data = {
//         name,
//         imageUrl,
//         parentId: parentId || null,
//       };

//       if (existingCategory) {
//         const docRef = doc(db, "categories", existingCategory.id);
//         await updateDoc(docRef, data);
//       } else {
//         await addDoc(collection(db, "categories"), data);
//       }

//       onSuccess && onSuccess();
//       setName("");
//       setImage(null);
//       setPreview(null);
//       setParentId("");
//     } catch (err) {
//       console.error("Error saving category:", err);
//       alert("Failed to save category.");
//     }

//     setLoading(false);
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-6"
//     >
//       <h2 className="text-lg font-semibold text-gray-800">
//         {existingCategory ? "Edit Category" : "Create Category"}
//       </h2>

//       {/* Category Name */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Category Name
//         </label>
//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Enter category name"
//           className="w-full border border-gray-300 rounded-md px-3 py-2"
//           required
//           disabled={loading}
//         />
//       </div>

//       {/* Parent Selector */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Parent Category (optional)
//         </label>
//         <select
//           value={parentId}
//           onChange={(e) => setParentId(e.target.value)}
//           className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
//           disabled={loading}
//         >
//           <option value="">-- No Parent (Top Level) --</option>
//           {allCategories
//             .filter((cat) => !existingCategory || cat.id !== existingCategory.id)
//             .map((cat) => (
//               <option key={cat.id} value={cat.id}>
//                 {cat.name}
//               </option>
//             ))}
//         </select>
//       </div>

//       {/* Image Uploader */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">
//           Category Image
//         </label>
//         <input
//           type="file"
//           accept="image/*"
//           onChange={(e) => setImage(e.target.files[0])}
//           disabled={loading}
//           className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//         />
//         {preview && (
//           <img
//             src={preview}
//             alt="Selected"
//             className="mt-4 w-32 h-32 object-cover rounded-md border border-gray-200 shadow-sm"
//           />
//         )}
//       </div>

//       {/* Submit Button */}
//       <button
//         type="submit"
//         disabled={loading}
//         className={`w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-3 rounded-md font-semibold transition-opacity ${
//           loading ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
//         }`}
//       >
//         {loading && (
//           <svg
//             className="animate-spin h-5 w-5 text-white"
//             xmlns="http://www.w3.org/2000/svg"
//             fill="none"
//             viewBox="0 0 24 24"
//           >
//             <circle
//               className="opacity-25"
//               cx="12"
//               cy="12"
//               r="10"
//               stroke="currentColor"
//               strokeWidth="4"
//             ></circle>
//             <path
//               className="opacity-75"
//               fill="currentColor"
//               d="M4 12a8 8 0 018-8v8H4z"
//             ></path>
//           </svg>
//         )}
//         {existingCategory ? "Update Category" : "Create Category"}
//       </button>
//     </form>
//   );
// }





"use client";
import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Helper to generate slug from name
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")         // Replace spaces with -
    .replace(/[^\w\-]+/g, "")     // Remove all non-word chars
    .replace(/\-\-+/g, "-");      // Replace multiple - with single -
}

export default function CategoryForm({ existingCategory = null, onSuccess }) {
  const [name, setName] = useState(existingCategory?.name || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(existingCategory?.imageUrl || null);
  const [loading, setLoading] = useState(false);
  const [parentId, setParentId] = useState(existingCategory?.parentId || "");
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAllCategories(list);
    };
    fetchCategories();
  }, []);

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

      const slug = generateSlug(name);

      const data = {
        name,
        slug,           // <-- save slug here
        imageUrl,
        parentId: parentId || null,
      };

      if (existingCategory) {
        const docRef = doc(db, "categories", existingCategory.id);
        await updateDoc(docRef, data);
      } else {
        await addDoc(collection(db, "categories"), data);
      }

      onSuccess && onSuccess();
      setName("");
      setImage(null);
      setPreview(null);
      setParentId("");
    } catch (err) {
      console.error("Error saving category:", err);
      alert("Failed to save category.");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md space-y-6"
    >
      <h2 className="text-lg font-semibold text-gray-800">
        {existingCategory ? "Edit Category" : "Create Category"}
      </h2>

      {/* Category Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter category name"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
          required
          disabled={loading}
        />
      </div>

      {/* Parent Selector */}
      {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Parent Category (optional)
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
          disabled={loading}
        >
          <option value="">-- No Parent (Top Level) --</option>
          {allCategories
            .filter((cat) => !existingCategory || cat.id !== existingCategory.id)
            .map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
        </select>
      </div> */}

      {/* Image Uploader */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          disabled={loading}
          className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {preview && (
          <img
            src={preview}
            alt="Selected"
            className="mt-4 w-32 h-32 object-cover rounded-md border border-gray-200 shadow-sm"
          />
        )}
      </div>

      {/* Submit Button */}
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


