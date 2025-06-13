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
// import {
//   ref,
//   uploadBytes,
//   getDownloadURL,
// } from "firebase/storage";

// export default function ProductForm({ existingProduct = null, onSuccess = () => {} }) {
//   const MAX_EXTRA_IMAGES = 5;  // Max number of extra images allowed

//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const [category, setCategory] = useState("");
//   const [image, setImage] = useState(null);
//   const [imageUrl, setImageUrl] = useState("");
//   const [extraImages, setExtraImages] = useState([]); // New state for additional images
//   const [extraImageUrls, setExtraImageUrls] = useState([]); // To display uploaded images
//   const [categories, setCategories] = useState([]);
//   const [shops, setShops] = useState([]);
//   const [selectedShop, setSelectedShop] = useState("");

//   useEffect(() => {
//     if (existingProduct) {
//       setName(existingProduct.name);
//       setDescription(existingProduct.description);
//       setPrice(existingProduct.price);
//       setCategory(existingProduct.category);
//       setSelectedShop(existingProduct.shopId);
//       setImageUrl(existingProduct.imageUrl);
//       setExtraImageUrls(existingProduct.extraImageUrls || []);
//     }
//   }, [existingProduct]);

//   useEffect(() => {
//     const fetchCategories = async () => {
//       const snapshot = await getDocs(collection(db, "categories"));
//       const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setCategories(cats);
//     };
//     fetchCategories();
//   }, []);

//   useEffect(() => {
//     const fetchShops = async () => {
//       const snapshot = await getDocs(collection(db, "shops"));
//       const shopList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
//       setShops(shopList);
//       if (!existingProduct && shopList.length > 0) {
//         setSelectedShop(shopList[0].id);
//       }
//     };
//     fetchShops();
//   }, [existingProduct]);


//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   if (!selectedShop) return alert("Please select a shop.");
//   if (!category) return alert("Please select a category.");

//   let finalImageUrl = imageUrl;
//   let uploadedExtraImageUrls = [];

//   // Upload main image
//   if (image) {
//     const imageRef = ref(storage, `products/${image.name}`);
//     await uploadBytes(imageRef, image);
//     finalImageUrl = await getDownloadURL(imageRef);
//   }

//   // Upload extra images (limit to MAX_EXTRA_IMAGES)
//   const imagesToUpload = extraImages.slice(0, MAX_EXTRA_IMAGES);
//   for (let i = 0; i < imagesToUpload.length; i++) {
//     const img = imagesToUpload[i];
//     const imgRef = ref(storage, `products/extras/${Date.now()}_${img.name}`);
//     await uploadBytes(imgRef, img);
//     const url = await getDownloadURL(imgRef);
//     uploadedExtraImageUrls.push(url);
//   }

//   // Data to save (excluding productCode for now)
//   const data = {
//     name,
//     description,
//     price: parseFloat(price),
//     category,
//     shopId: selectedShop,
//     imageUrl: finalImageUrl,
//     extraImageUrls: uploadedExtraImageUrls,
//     updatedAt: new Date(),
//   };

//   try {
//     if (existingProduct) {
//       const productRef = doc(db, "products", existingProduct.id);
//       await updateDoc(productRef, data);
//       alert("Product updated!");
//     } else {
//       // Generate productCode for new product
//       const generateProductCode = async (shopId, categoryName) => {
//         const shop = shops.find(s => s.id === shopId);
//         if (!shop) return null;

//         const firstWord = shop.name.trim().split(" ")[0];
//         const catSegment = categoryName.trim().substring(0, 4).toLowerCase();
//         const prefix = `${firstWord}_${catSegment}`;

//         const productsSnap = await getDocs(collection(db, "products"));
//         const count = productsSnap.docs.filter(doc =>
//           doc.data().productCode?.startsWith(prefix)
//         ).length;

//         const numberPart = String(count + 1).padStart(3, '0');
//         return `${prefix}_${numberPart}`;
//       };

//       const productCode = await generateProductCode(selectedShop, category);

//       await addDoc(collection(db, "products"), {
//         ...data,
//         createdAt: new Date(),
//         productCode,
//       });

//       alert("Product created!");

//       // Reset form
//       setName("");
//       setDescription("");
//       setPrice("");
//       setCategory("");
//       setImage(null);
//       setImageUrl("");
//       setExtraImages([]);
//       setExtraImageUrls([]);
//     }

//     onSuccess();
//   } catch (err) {
//     console.error(err);
//     alert("Something went wrong.");
//   }
// };


//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   if (!selectedShop) return alert("Please select a shop.");
//   //   if (!category) return alert("Please select a category.");

//   //   let finalImageUrl = imageUrl;
//   //   let uploadedExtraImageUrls = [];

//   //   // Upload main image
//   //   if (image) {
//   //     const imageRef = ref(storage, `products/${image.name}`);
//   //     await uploadBytes(imageRef, image);
//   //     finalImageUrl = await getDownloadURL(imageRef);
//   //   }

//   //   // Upload extra images (only up to MAX_EXTRA_IMAGES)
//   //   const imagesToUpload = extraImages.slice(0, MAX_EXTRA_IMAGES);
//   //   for (let i = 0; i < imagesToUpload.length; i++) {
//   //     const img = imagesToUpload[i];
//   //     const imgRef = ref(storage, `products/extras/${Date.now()}_${img.name}`);
//   //     await uploadBytes(imgRef, img);
//   //     const url = await getDownloadURL(imgRef);
//   //     uploadedExtraImageUrls.push(url);
//   //   }

//   //   const data = {
//   //     name,
//   //     description,
//   //     price: parseFloat(price),
//   //     category,
//   //     shopId: selectedShop,
//   //     imageUrl: finalImageUrl,
//   //     extraImageUrls: uploadedExtraImageUrls,
//   //     updatedAt: new Date(),
//   //   };

//   //   try {
//   //     if (existingProduct) {
//   //       const productRef = doc(db, "products", existingProduct.id);
//   //       await updateDoc(productRef, data);
//   //       alert("Product updated!");
//   //     } else {
//   //       await addDoc(collection(db, "products"), {
//   //         ...data,
//   //         createdAt: new Date(),
//   //       });
//   //       alert("Product created!");
//   //       setName("");
//   //       setDescription("");
//   //       setPrice("");
//   //       setCategory("");
//   //       setImage(null);
//   //       setImageUrl("");
//   //       setExtraImages([]);
//   //       setExtraImageUrls([]);
//   //     }

//   //     onSuccess();
//   //   } catch (err) {
//   //     console.error(err);
//   //     alert("Something went wrong.");
//   //   }
//   // };

//   const handleExtraImagesChange = (e) => {
//     let files = Array.from(e.target.files);

//     if (files.length > MAX_EXTRA_IMAGES) {
//       alert(`You can upload up to ${MAX_EXTRA_IMAGES} additional images.`);
//       files = files.slice(0, MAX_EXTRA_IMAGES); // keep only first 5
//     }
//     setExtraImages(files);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-white shadow-lg rounded-2xl space-y-5">
//       <h2 className="text-xl font-bold text-gray-800 text-center">
//         {existingProduct ? "Edit Product" : "Create New Product!!"}
//       </h2>

//       <select
//         value={selectedShop}
//         onChange={(e) => setSelectedShop(e.target.value)}
//         className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
//         className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//         required
//       />

//       <textarea
//         placeholder="Description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//         required
//       />

//       <input
//         type="number"
//         placeholder="Price"
//         value={price}
//         onChange={(e) => setPrice(e.target.value)}
//         className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//         required
//       />

//       <select
//         value={category}
//         onChange={(e) => setCategory(e.target.value)}
//         className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
//         required
//       >
//         <option value="">Select category</option>
//         {categories.map(cat => (
//           <option key={cat.id} value={cat.name}>{cat.name}</option>
//         ))}
//       </select>

//       <div>
//         <label className="block font-medium text-gray-700 mb-1">Main Image</label>
//         <input
//           type="file"
//           onChange={(e) => setImage(e.target.files[0])}
//           className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none"
//           accept="image/*"
//         />
//         {existingProduct && imageUrl && (
//           <img
//             src={imageUrl}
//             alt="Main"
//             className="w-24 h-24 mt-2 object-cover rounded-xl"
//           />
//         )}
//       </div>

//       <div>
//         <label className="block font-medium text-gray-700 mb-1">Extra Images (up to 5)</label>
//         <input
//           type="file"
//           onChange={handleExtraImagesChange}
//           multiple
//           className="w-full p-3 bg-gray-100 rounded-xl focus:outline-none"
//           accept="image/*"
//         />
//         {extraImageUrls.length > 0 && (
//           <div className="flex gap-2 flex-wrap mt-2">
//             {extraImageUrls.map((url, index) => (
//               <img key={index} src={url} alt={`Extra ${index}`} className="w-20 h-20 object-cover rounded-xl" />
//             ))}
//           </div>
//         )}
//       </div>

//       <button
//         type="submit"
//         className="w-full bg-blue-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
//       >
//         {existingProduct ? "Update Product" : "Add Product"}
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
  const MAX_EXTRA_IMAGES = 5;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [extraImages, setExtraImages] = useState([]);
  const [extraImageUrls, setExtraImageUrls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [attributes, setAttributes] = useState([{ name: "", description: "" }]);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setDescription(existingProduct.description);
      setPrice(existingProduct.price);
      setCategory(existingProduct.category);
      setSelectedShop(existingProduct.shopId);
      setImageUrl(existingProduct.imageUrl);
      setExtraImageUrls(existingProduct.extraImageUrls || []);
      setAttributes(existingProduct.attributes || [{ name: "", description: "" }]);
    }
  }, [existingProduct]);

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(cats);
    };
    fetchCategories();
  }, []);

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

  const handleAttributeChange = (index, field, value) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: "", description: "" }]);
  };

  const handleRemoveAttribute = (index) => {
    const updated = attributes.filter((_, i) => i !== index);
    setAttributes(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedShop) return alert("Please select a shop.");
    if (!category) return alert("Please select a category.");

    let finalImageUrl = imageUrl;
    let uploadedExtraImageUrls = [];

    if (image) {
      const imageRef = ref(storage, `products/${image.name}`);
      await uploadBytes(imageRef, image);
      finalImageUrl = await getDownloadURL(imageRef);
    }

    const imagesToUpload = extraImages.slice(0, MAX_EXTRA_IMAGES);
    for (let img of imagesToUpload) {
      const imgRef = ref(storage, `products/extras/${Date.now()}_${img.name}`);
      await uploadBytes(imgRef, img);
      const url = await getDownloadURL(imgRef);
      uploadedExtraImageUrls.push(url);
    }

    const data = {
      name,
      description,
      price: parseFloat(price),
      category,
      shopId: selectedShop,
      imageUrl: finalImageUrl,
      extraImageUrls: uploadedExtraImageUrls,
      attributes,
      updatedAt: new Date(),
    };

    try {
      if (existingProduct) {
        const productRef = doc(db, "products", existingProduct.id);
        await updateDoc(productRef, data);
        alert("Product updated!");
      } else {
        const generateProductCode = async (shopId, categoryName) => {
          const shop = shops.find(s => s.id === shopId);
          if (!shop) return null;
          const firstWord = shop.name.trim().split(" ")[0];
          const catSegment = categoryName.trim().substring(0, 4).toLowerCase();
          const prefix = `${firstWord}_${catSegment}`;
          const productsSnap = await getDocs(collection(db, "products"));
          const count = productsSnap.docs.filter(doc =>
            doc.data().productCode?.startsWith(prefix)
          ).length;
          return `${prefix}_${String(count + 1).padStart(3, '0')}`;
        };

        const productCode = await generateProductCode(selectedShop, category);

        await addDoc(collection(db, "products"), {
          ...data,
          createdAt: new Date(),
          productCode,
        });

        alert("Product created!");
        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setImage(null);
        setImageUrl("");
        setExtraImages([]);
        setExtraImageUrls([]);
        setAttributes([{ name: "", description: "" }]);
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  const handleExtraImagesChange = (e) => {
    let files = Array.from(e.target.files);
    if (files.length > MAX_EXTRA_IMAGES) {
      alert(`You can upload up to ${MAX_EXTRA_IMAGES} additional images.`);
      files = files.slice(0, MAX_EXTRA_IMAGES);
    }
    setExtraImages(files);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-4 bg-white shadow-lg rounded-2xl space-y-5">
      <h2 className="text-xl font-bold text-gray-800 text-center">
        {existingProduct ? "Edit Product" : "Create New Product!!"}
      </h2>

      <select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)} required className="w-full p-3 bg-gray-100 rounded-xl">
        <option value="">Select shop</option>
        {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.name}</option>)}
      </select>

      <input type="text" placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-gray-100 rounded-xl" />

      <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="w-full p-3 bg-gray-100 rounded-xl" />

      <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full p-3 bg-gray-100 rounded-xl" />

      <select value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full p-3 bg-gray-100 rounded-xl">
        <option value="">Select category</option>
        {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
      </select>

      <div>
        <label className="block mb-1 font-medium">Main Image</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="w-full p-3 bg-gray-100 rounded-xl" />
        {imageUrl && <img src={imageUrl} className="w-24 h-24 object-cover mt-2 rounded-xl" alt="Main" />}
      </div>

      <div>
        <label className="block mb-1 font-medium">Extra Images (up to 5)</label>
        <input type="file" accept="image/*" onChange={handleExtraImagesChange} multiple className="w-full p-3 bg-gray-100 rounded-xl" />
        {extraImageUrls.length > 0 && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {extraImageUrls.map((url, idx) => <img key={idx} src={url} className="w-20 h-20 object-cover rounded-xl" alt="Extra" />)}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Product Attributes</h3>
        {attributes.map((attr, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Attribute name"
              value={attr.name}
              onChange={(e) => handleAttributeChange(index, "name", e.target.value)}
              className="flex-1 p-2 bg-gray-100 rounded-xl"
              required
            />
            <input
              type="text"
              placeholder="Attribute description"
              value={attr.description}
              onChange={(e) => handleAttributeChange(index, "description", e.target.value)}
              className="flex-1 p-2 bg-gray-100 rounded-xl"
              required
            />
            {index > 0 && (
              <button type="button" onClick={() => handleRemoveAttribute(index)} className="text-red-600 hover:underline">Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={handleAddAttribute} className="text-blue-600 hover:underline">+ Add Attribute</button>
      </div>

      <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700">
        {existingProduct ? "Update Product" : "Add Product"}
      </button>
    </form>
  );
}
