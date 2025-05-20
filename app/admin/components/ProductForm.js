// "use client";

// import { useState, useEffect } from "react";
// import { db, storage } from "@/lib/firebase";
// import { collection, addDoc, getDocs } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// export default function ProductForm() {
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [category, setCategory] = useState("");
//   const [image, setImage] = useState(null);
//   const [categories, setCategories] = useState([]);

//   // Fetch categories from Firestore
//   useEffect(() => {
//     const fetchCategories = async () => {
//       const snapshot = await getDocs(collection(db, "categories"));
//       const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setCategories(cats);
//     };
//     fetchCategories();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!image) return alert("Please upload an image.");

//     // Upload image to Firebase Storage
//     const imageRef = ref(storage, `products/${image.name}`);
//     await uploadBytes(imageRef, image);
//     const imageUrl = await getDownloadURL(imageRef);

//     // Save product to Firestore
//     await addDoc(collection(db, "products"), {
//       name,
//       description,
//       price: parseFloat(price),
//       category,
//       imageUrl,
//       createdAt: new Date()
//     });

//     alert("Product created!");
//     setName(""); setDescription(""); setPrice(""); setCategory(""); setImage(null);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-md space-y-4">
//       <h2 className="text-lg font-semibold">Create New Product</h2>

//       <input
//         type="text"
//         placeholder="Product name"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         className="w-full p-2 border rounded"
//         required
//       />

//       <textarea
//         placeholder="Description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         className="w-full p-2 border rounded"
//         required
//       />

//       <input
//         type="number"
//         placeholder="Price"
//         value={price}
//         onChange={(e) => setPrice(e.target.value)}
//         className="w-full p-2 border rounded"
//         required
//       />

//       <select
//         value={category}
//         onChange={(e) => setCategory(e.target.value)}
//         className="w-full p-2 border rounded"
//         required
//       >
//         <option value="">Select category</option>
//         {categories.map(cat => (
//           <option key={cat.id} value={cat.name}>{cat.name}</option>
//         ))}
//       </select>

//       <input
//         type="file"
//         onChange={(e) => setImage(e.target.files[0])}
//         className="w-full p-2 border rounded"
//         accept="image/*"
//         required
//       />

//       <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
//         Add Product
//       </button>
//     </form>
//   );
// }




"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProductForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  // Fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      const snapshot = await getDocs(collection(db, "shops"));
      const shopList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setShops(shopList);
      if (shopList.length > 0) setSelectedShop(shopList[0].id);
    };
    fetchShops();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return alert("Please upload an image.");
    if (!selectedShop) return alert("Please select a shop.");
    if (!category) return alert("Please select a category.");

    // Upload image
    const imageRef = ref(storage, `products/${image.name}`);
    await uploadBytes(imageRef, image);
    const imageUrl = await getDownloadURL(imageRef);

    // Save product
    await addDoc(collection(db, "products"), {
      name,
      description,
      price: parseFloat(price),
      category,
      shopId: selectedShop,
      imageUrl,
      createdAt: new Date(),
    });

    alert("Product created!");
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-md space-y-4">
      <h2 className="text-lg font-semibold">Create New Product</h2>

      <select
        value={selectedShop}
        onChange={(e) => setSelectedShop(e.target.value)}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">Select shop</option>
        {shops.map(shop => (
          <option key={shop.id} value={shop.id}>{shop.name}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full p-2 border rounded"
        required
      >
        <option value="">Select category</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.name}>{cat.name}</option>
        ))}
      </select>

      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        className="w-full p-2 border rounded"
        accept="image/*"
        required
      />

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Add Product
      </button>
    </form>
  );
}
