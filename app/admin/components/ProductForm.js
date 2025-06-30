"use client";

import { useState, useEffect } from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
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
  const [subCategory, setSubCategory] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [extraImages, setExtraImages] = useState([]);
  const [extraImageUrls, setExtraImageUrls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [attributes, setAttributes] = useState([{ name: "", description: "" }]);
  const [tags, setTags] = useState("");
  const [discount, setDiscount] = useState("");
  const [qty, setQty] = useState("");
  const [warranty, setWarranty] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [sku, setSku] = useState("");
  const [productCode, setProductCode] = useState("");
  // state declaration new
  const [isDraft, setIsDraft] = useState(existingProduct?.isDraft || false);  // state declaration new

  const generateUniqueSKU = async () => {
  let unique = false;
  let sku = '';

  while (!unique) {
    sku = generateRandomSKU();

    const q = query(collection(db, 'products'), where('sku', '==', sku));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      unique = true; // No product has this SKU, so it's unique
    }
  }

  return sku;
};



  const generateRandomSKU = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)];

    let alphaPart = '';
    for (let i = 0; i < 3; i++) {
      alphaPart += getRandomChar();
    }

    const numberPart = String(Math.floor(Math.random() * 100)).padStart(2, '0');

    return `H-${alphaPart}-${numberPart}`;
  };




  useEffect(() => {
  if (existingProduct) {
    setName(existingProduct.name);
    setDescription(existingProduct.description);
    setPrice(existingProduct.price);
    setCategory(existingProduct.category);
    setSubCategory(existingProduct.subCategory || "");
    setSelectedShop(existingProduct.shopId);
    setImageUrl(existingProduct.imageUrl);
    setExtraImageUrls(existingProduct.extraImageUrls || []);
    setAttributes(existingProduct.attributes || [{ name: "", description: "" }]);
    
    // Fix here: convert array to string if needed
    if (Array.isArray(existingProduct.tags)) {
      setTags(existingProduct.tags.join(", "));
    } else {
      setTags(existingProduct.tags || "");
    }
    
    setDiscount(existingProduct.discount || "");
    setQty(existingProduct.qty || "");
    setWarranty(existingProduct.warranty || "");
    setManufacturer(existingProduct.manufacturer || "");
    setIsFeatured(existingProduct.isFeatured || false);
    setSku(existingProduct.sku || "");
    setProductCode(existingProduct.productCode || "");
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

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!category) return setSubCategories([]);
      const q = query(collection(db, "categories"), where("parentId", "==", category));
      const snapshot = await getDocs(q);
      const subs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSubCategories(subs);
    };
    fetchSubCategories();
  }, [category]);



  useEffect(() => {
  const autoGenerateCodes = async () => {
    if (!selectedShop || !category || !subCategory || !name) return;

    const shopName = shops.find(s => s.id === selectedShop)?.name || "SHOP";
    const catName = categories.find(c => c.id === category)?.name || "CAT";
    const subCatName = subCategories.find(sc => sc.id === subCategory)?.name || "SUBCAT";

    const newProductCode = await generateProductCode(shopName, catName, subCatName, name);
    const newSku = await generateUniqueSKU();

    setProductCode(newProductCode);
    setSku(newSku);
  };

  autoGenerateCodes();
}, [selectedShop, category, subCategory, name]);




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

  const shortCode = (text) => text.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
  const cleanCode = (text) => text.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

  const generateProductCode = async (shopName, catName, subCatName, prodName) => {
    const shopCode = cleanCode(shopName);
    const catCode = cleanCode(catName);
    const subCatCode = cleanCode(subCatName);
    const prodCode = cleanCode(prodName);
    const baseCode = `${shopCode}_${catCode}_${subCatCode}_${prodCode}`;

    const q = query(
      collection(db, "products"),
      orderBy("productCode"),
      where("productCode", ">=", baseCode)
    );

    const snapshot = await getDocs(q);
    let existingCodes = snapshot.docs.map(doc => doc.data().productCode).filter(code => code.startsWith(baseCode));
    let num = 1;
    while (existingCodes.includes(`${baseCode}_${String(num).padStart(3, '0')}`)) {
      num++;
    }
    return `${baseCode}_${String(num).padStart(3, '0')}`;
  };

  const generateSlug = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedShop || !category || !subCategory) {
    return alert("Please complete all required fields.");
  }

  if (!isDraft && !price) {
    return alert("Price is required for non-draft products.");
  }

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

  const slug = generateSlug(name);
  const shopName = shops.find(s => s.id === selectedShop)?.name || "SHOP";
  const catName = categories.find(c => c.id === category)?.name || "CAT";
  const subCatName = subCategories.find(sc => sc.id === subCategory)?.name || "SUBCAT";
  const generatedProductCode = await generateProductCode(shopName, catName, subCatName, name);
  const generatedSku = existingProduct ? sku : await generateUniqueSKU();

  const data = {
    name,
    slug,
    productCode: generatedProductCode,
    sku: generatedSku,
    description,
    price: isDraft ? parseFloat(price) || 0 : parseFloat(price),
    discount: parseFloat(discount) || 0,
    qty: parseInt(qty) || 0,
    category,
    subCategory,
    shopId: selectedShop,
    tags: tags.split(",").map(t => t.trim()).filter(Boolean),
    isFeatured,
    warranty,
    manufacturer,
    imageUrl: finalImageUrl,
    extraImageUrls: uploadedExtraImageUrls,
    attributes,
    updatedAt: new Date(),
    isDraft,
    promoted: "false",
  };

  if (!existingProduct) data.createdAt = new Date();

  try {
    let collectionName = isDraft ? "drafts" : "products";

    if (existingProduct) {
      const existingCollection = existingProduct.isDraft ? "drafts" : "products";

      // Promote draft to product or update in place
      if (!isDraft && existingProduct.isDraft) {
        // Promote to product
        const newDoc = await addDoc(collection(db, "products"), { ...data, isDraft: false });
        await updateDoc(doc(db, "drafts", existingProduct.id), { promoted: true });
        alert("Draft promoted to product!");
      } else {
        // Update in the current collection
        const productRef = doc(db, existingCollection, existingProduct.id);
        await updateDoc(productRef, data);
        alert("Product updated!");
      }
    } else {
      await addDoc(collection(db, collectionName), data);
      alert(isDraft ? "Draft saved!" : "Product created!");
    }

    onSuccess();

    // Reset only if it's a new product
    if (!existingProduct) {
      setName("");
      setDescription("");
      setPrice("");
      setDiscount("");
      setQty("");
      setCategory("");
      setSubCategory("");
      setImage(null);
      setImageUrl("");
      setExtraImages([]);
      setExtraImageUrls([]);
      setAttributes([{ name: "", description: "" }]);
      setTags("");
      setWarranty("");
      setManufacturer("");
      setIsFeatured(false);
      setSku("");
      setProductCode("");
      setIsDraft(false);
    }

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
  <form
    onSubmit={handleSubmit}
    className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6 space-y-6"
  >
    <h2 className="text-2xl font-bold text-gray-800 text-center">
      {existingProduct ? "Edit Product" : "Create New Product"}
    </h2>

    {/* Shop */}
    <select
      value={selectedShop}
      onChange={(e) => setSelectedShop(e.target.value)}
      required
      className="w-full p-3 bg-gray-100 rounded-xl"
    >
      <option value="">Select shop</option>
      {shops.map((shop) => (
        <option key={shop.id} value={shop.id}>
          {shop.name}
        </option>
      ))}
    </select>

    {/* Category + Subcategory */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
        className="w-full p-3 bg-gray-100 rounded-xl"
      >
        <option value="">Select category</option>
        {categories.filter((c) => !c.parentId).map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <select
        value={subCategory}
        onChange={(e) => setSubCategory(e.target.value)}
        className="w-full p-3 bg-gray-100 rounded-xl"
      >
        <option value="">Select subcategory</option>
        {subCategories.map((sub) => (
          <option key={sub.id} value={sub.id}>
            {sub.name}
          </option>
        ))}
      </select>
    </div>

    {/* Product Name, Price, Discount */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <input
        type="text"
        placeholder="Product Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        className="w-full p-3 bg-gray-100 rounded-xl"
      />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-3 bg-gray-100 rounded-xl"
      />
      <input
        type="number"
        placeholder="Discount (%)"
        value={discount}
        onChange={(e) => setDiscount(e.target.value)}
        className="w-full p-3 bg-gray-100 rounded-xl"
      />
    </div>

    {/* Quantity, Warranty, Manufacturer */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <input
        type="number"
        placeholder="Quantity"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        className="w-full p-3 bg-gray-100 rounded-xl"
      />
      <input
        type="text"
        placeholder="Warranty"
        value={warranty}
        onChange={(e) => setWarranty(e.target.value)}
        className="w-full p-3 bg-gray-100 rounded-xl"
      />
      <input
        type="text"
        placeholder="Manufacturer"
        value={manufacturer}
        onChange={(e) => setManufacturer(e.target.value)}
        className="w-full p-3 bg-gray-100 rounded-xl"
      />
    </div>

    {/* Tags */}
    <input
      type="text"
      placeholder="Tags (comma separated)"
      value={tags}
      onChange={(e) => setTags(e.target.value)}
      className="w-full p-3 bg-gray-100 rounded-xl"
    />

    {/* SKU & Product Code */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input
        type="text"
        value={sku}
        readOnly
        className="w-full p-3 bg-gray-100 rounded-xl text-gray-500"
        placeholder="SKU"
      />
      <input
        type="text"
        value={productCode}
        readOnly
        className="w-full p-3 bg-gray-100 rounded-xl text-gray-500"
        placeholder="Product Code"
      />
    </div>

    {/* Featured */}
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={isFeatured}
        onChange={(e) => setIsFeatured(e.target.checked)}
        className="h-4 w-4"
      />
      <label className="text-sm text-gray-700">Mark as Featured</label>
    </div>

    {/* Description */}
    <textarea
      placeholder="Product Description"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      rows={4}
      className="w-full p-3 bg-gray-100 rounded-xl"
    />

    {/* Image Upload */}
    <div>
      <label className="block mb-1 font-medium">Main Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="w-full p-3 bg-gray-100 rounded-xl"
      />
    </div>

    {/* Extra Images */}
    <div>
      <label className="block mb-1 font-medium">Extra Images (up to 5)</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleExtraImagesChange}
        multiple
        className="w-full p-3 bg-gray-100 rounded-xl"
      />
    </div>

    {/* Attributes */}
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Product Attributes</h3>
      {attributes.map((attr, index) => (
        <div
          key={index}
          className="flex flex-col sm:flex-row gap-2 items-center"
        >
          <input
            type="text"
            placeholder="Attribute name"
            value={attr.name}
            onChange={(e) => handleAttributeChange(index, "name", e.target.value)}
            className="flex-1 p-3 bg-gray-100 rounded-xl"
          />
          <input
            type="text"
            placeholder="Attribute description"
            value={attr.description}
            onChange={(e) => handleAttributeChange(index, "description", e.target.value)}
            className="flex-1 p-3 bg-gray-100 rounded-xl"
          />
          {index > 0 && (
            <button
              type="button"
              onClick={() => handleRemoveAttribute(index)}
              className="text-red-600 hover:underline text-sm"
            >
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddAttribute}
        className="text-blue-600 hover:underline text-sm"
      >
        + Add Attribute
      </button>
    </div>

        {/*Mark as Draft */}
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={isDraft}
        onChange={(e) => setIsDraft(e.target.checked)}
        className="h-4 w-4"
      />
      <label className="text-md text-gray-700">Save this product Draft (Check box to save this product as draft)</label>
    </div>

    {/* Submit */}
    <button
      type="submit"
      className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700"
    >
      {existingProduct ? "Update Product" : "Save / Add Product"}
    </button>
  </form>
);
}