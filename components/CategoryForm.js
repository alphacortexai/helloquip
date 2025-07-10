// "use client";

// import { useState } from "react";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { collection, addDoc } from "firebase/firestore";
// import { db, storage } from "@/lib/firebase";

// export default function CategoryForm() {
//   const [name, setName] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [message, setMessage] = useState("");

//   const handleImageChange = (e) => {
//     if (e.target.files[0]) {
//       setImageFile(e.target.files[0]);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!name || !imageFile) {
//       setMessage("Please provide both name and image.");
//       return;
//     }

//     setUploading(true);
//     setMessage("");

//     try {
//       const storageRef = ref(storage, `category-images/${Date.now()}_${imageFile.name}`);
//       const snapshot = await uploadBytes(storageRef, imageFile);
//       const imageUrl = await getDownloadURL(snapshot.ref);

//       await addDoc(collection(db, "categories"), {
//         name,
//         imageUrl,
//         parentId: null, // 🔥 Marking as top-level category
//         createdAt: new Date(),
//       });

//       setMessage("✅ Category created successfully!");
//       setName("");
//       setImageFile(null);
//     } catch (error) {
//       setMessage("❌ Error uploading category: " + error.message);
//     }

//     setUploading(false);
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md mt-8">
//       <h1 className="text-xl font-bold mb-4">Create New Category</h1>
//       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <input
//           type="text"
//           placeholder="Category Name"
//           className="p-2 border rounded"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//         <input type="file" accept="image/*" onChange={handleImageChange} />
//         <button
//           type="submit"
//           disabled={uploading}
//           className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
//         >
//           {uploading ? "Uploading..." : "Create Category"}
//         </button>
//       </form>
//       {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
//     </div>
//   );
// }



















// "use client";

// import { useState } from "react";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { collection, addDoc } from "firebase/firestore";
// import { db, storage } from "@/lib/firebase";

// export default function CategoryForm() {
//   const [name, setName] = useState("");
//   const [imageFile, setImageFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [message, setMessage] = useState("");

//   const handleImageChange = (e) => {
//     if (e.target.files[0]) {
//       setImageFile(e.target.files[0]);
//     }
//   };

//   // 🔤 Generate URL-friendly slug
//   const generateSlug = (name) =>
//     name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!name || !imageFile) {
//       setMessage("Please provide both name and image.");
//       return;
//     }

//     setUploading(true);
//     setMessage("");

//     try {
//       const slug = generateSlug(name);
//       const storageRef = ref(storage, `category-images/${Date.now()}_${imageFile.name}`);
//       const snapshot = await uploadBytes(storageRef, imageFile);
//       const imageUrl = await getDownloadURL(snapshot.ref);

//       await addDoc(collection(db, "categories"), {
//         name,
//         slug,
//         imageUrl,
//         parentId: null, // 🔥 Marking as top-level category
//         createdAt: new Date(),
//       });

//       setMessage("✅ Category created successfully!");
//       setName("");
//       setImageFile(null);
//     } catch (error) {
//       setMessage("❌ Error uploading category: " + error.message);
//     }

//     setUploading(false);
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md mt-8">
//       <h1 className="text-xl font-bold mb-4">Create New Category</h1>
//       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
//         <input
//           type="text"
//           placeholder="Category Name"
//           className="p-2 border rounded"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//         />
//         <input type="file" accept="image/*" onChange={handleImageChange} />
//         <button
//           type="submit"
//           disabled={uploading}
//           className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
//         >
//           {uploading ? "Uploading..." : "Create Category"}
//         </button>
//       </form>
//       {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";

// Helper to generate slug from category name
const generateSlug = (name) =>
  name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

// Helper to generate resized URLs with .webp extension and keep token
function generateResizedUrls(originalUrl) {
  if (!originalUrl) return null;

  const urlWithoutToken = originalUrl.split("?")[0];
  const token = originalUrl.includes("?") ? "?" + originalUrl.split("?")[1] : "";

  // Correctly decode any previously encoded path
  const decodedUrl = decodeURIComponent(urlWithoutToken);

  const lastSlash = decodedUrl.lastIndexOf("/");
  const basePath = decodedUrl.substring(0, lastSlash + 1);
  const filename = decodedUrl.substring(lastSlash + 1);
  const dotIndex = filename.lastIndexOf(".");
  const nameWithoutExt = filename.substring(0, dotIndex);

  const sizes = ["90x90", "200x200", "800x800"];
  const resizedUrls = {};

  sizes.forEach((size) => {
    // We avoid encoding slashes again
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

      // Generate resized URLs (assume Cloud Functions generate these .webp files)
      const imageUrl = generateResizedUrls(originalUrl);

      // Save to Firestore as object
      await addDoc(collection(db, "categories"), {
        name,
        slug,
        imageUrl, // now an object with resized URLs
        parentId: null, // top-level category
        createdAt: new Date(),
      });

      setMessage("✅ Category created successfully!");
      setName("");
      setImageFile(null);
    } catch (error) {
      setMessage("❌ Oh No Error uploading category: " + error.message);
    }

    setUploading(false);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md mt-8">
      <h1 className="text-xl font-bold mb-4">Create New Category</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Category Name"
          className="p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white p-2 rounded disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Create Category"}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
    </div>
  );
}
