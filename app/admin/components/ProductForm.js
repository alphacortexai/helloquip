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
//   const [shops, setShops] = useState([]);
//   const [selectedShop, setSelectedShop] = useState("");

//   // Fetch categories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       const snapshot = await getDocs(collection(db, "categories"));
//       const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setCategories(cats);
//     };
//     fetchCategories();
//   }, []);

//   // Fetch shops
//   useEffect(() => {
//     const fetchShops = async () => {
//       const snapshot = await getDocs(collection(db, "shops"));
//       const shopList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setShops(shopList);
//       if (shopList.length > 0) setSelectedShop(shopList[0].id);
//     };
//     fetchShops();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!image) return alert("Please upload an image.");
//     if (!selectedShop) return alert("Please select a shop.");
//     if (!category) return alert("Please select a category.");

//     // Upload image
//     const imageRef = ref(storage, `products/${image.name}`);
//     await uploadBytes(imageRef, image);
//     const imageUrl = await getDownloadURL(imageRef);

//     // Save product
//     await addDoc(collection(db, "products"), {
//       name,
//       description,
//       price: parseFloat(price),
//       category,
//       shopId: selectedShop,
//       imageUrl,
//       createdAt: new Date(),
//     });

//     alert("Product created!");
//     setName("");
//     setDescription("");
//     setPrice("");
//     setCategory("");
//     setImage(null);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-md space-y-4">
//       <h2 className="text-lg font-semibold">Create New Product</h2>

//       <select
//         value={selectedShop}
//         onChange={(e) => setSelectedShop(e.target.value)}
//         className="w-full p-2 border rounded"
//         required
//       >
//         <option value="">Select shop</option>
//         {shops.map(shop => (
//           <option key={shop.id} value={shop.id}>{shop.name}</option>
//         ))}
//       </select>

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
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export default function ProductForm({ existingProduct = null, onSuccess = () => {} }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");

  // Prefill form if editing
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setDescription(existingProduct.description);
      setPrice(existingProduct.price);
      setCategory(existingProduct.category);
      setSelectedShop(existingProduct.shopId);
      setImageUrl(existingProduct.imageUrl);
    }
  }, [existingProduct]);

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
      if (!existingProduct && shopList.length > 0) {
        setSelectedShop(shopList[0].id);
      }
    };
    fetchShops();
  }, [existingProduct]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShop) return alert("Please select a shop.");
    if (!category) return alert("Please select a category.");

    let finalImageUrl = imageUrl;

    // If new image is selected, upload it
    if (image) {
      const imageRef = ref(storage, `products/${image.name}`);
      await uploadBytes(imageRef, image);
      finalImageUrl = await getDownloadURL(imageRef);
    }

    const data = {
      name,
      description,
      price: parseFloat(price),
      category,
      shopId: selectedShop,
      imageUrl: finalImageUrl,
      updatedAt: new Date(),
    };

    try {
      if (existingProduct) {
        // Update product
        const productRef = doc(db, "products", existingProduct.id);
        await updateDoc(productRef, data);
        alert("Product updated!");
      } else {
        // Create new product
        await addDoc(collection(db, "products"), {
          ...data,
          createdAt: new Date(),
        });
        alert("Product created!");
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setImage(null);
        setImageUrl("");
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-md space-y-4">
      <h2 className="text-lg font-semibold">{existingProduct ? "Edit Product" : "Create New Product"}</h2>

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
      />

      {existingProduct && imageUrl && (
        <img
          src={imageUrl}
          alt="Current product"
          className="w-24 h-24 object-cover rounded"
        />
      )}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        {existingProduct ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
}
