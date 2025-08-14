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
  const [imagePreview, setImagePreview] = useState("");
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
  const [isDraft, setIsDraft] = useState(existingProduct?.isDraft || false);
  const [loading, setLoading] = useState(false);

  const generateUniqueSKU = async () => {
    let unique = false;
    let sku = '';

    while (!unique) {
      sku = generateRandomSKU();

      const q = query(collection(db, 'products'), where('sku', '==', sku));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        unique = true;
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
      setIsDraft(existingProduct.isDraft || false);
    } else {
      autoGenerateCodes();
    }

    fetchCategories();
    fetchShops();
  }, [existingProduct]);

  const fetchCategories = async () => {
    try {
      // Only fetch main categories (parentId is null)
      const q = query(collection(db, "categories"), where("parentId", "==", null));
      const querySnapshot = await getDocs(q);
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchShops = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "shops"));
      const shopsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setShops(shopsData);
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  const fetchSubCategories = async () => {
    if (!category) {
      setSubCategories([]);
      return;
    }

    try {
      const q = query(
        collection(db, "categories"),
        where("parentId", "==", category)
      );
      const querySnapshot = await getDocs(q);
      const subCategoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => a.name.localeCompare(b.name)); // Client-side sorting
      setSubCategories(subCategoriesData);
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
      setSubCategories([]);
    }
  };

  // Fetch sub-categories when category changes
  useEffect(() => {
    fetchSubCategories();
    // Clear sub-category when main category changes
    if (category !== existingProduct?.category) {
      setSubCategory("");
    }
  }, [category]);

  // Auto-generate codes when required fields change
  useEffect(() => {
    autoGenerateCodes();
  }, [selectedShop, category, subCategory, name]);

  // Handle image preview cleanup
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const handleAddAttribute = () => {
    setAttributes([...attributes, { name: "", description: "" }]);
  };

  const handleRemoveAttribute = (index) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
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
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const generateResizedUrls = (originalUrl) => {
    if (!originalUrl) return null;

    const urlWithoutToken = originalUrl.split('?')[0];
    const token = originalUrl.includes('?') ? '?' + originalUrl.split('?')[1] : '';

    const lastSlash = urlWithoutToken.lastIndexOf('/');
    const basePath = urlWithoutToken.substring(0, lastSlash + 1); // .../products/
    const filename = urlWithoutToken.substring(lastSlash + 1); // pdt1.jpg

    const dotIndex = filename.lastIndexOf('.');
    const nameWithoutExt = filename.substring(0, dotIndex); // pdt1

    const sizes = ['90x90', '100x100', '200x200', '680x680', '800x800'];
    const resizedUrls = {};

    sizes.forEach(size => {
      resizedUrls[size] = `${basePath}${encodeURIComponent(nameWithoutExt)}_${size}.webp${token}`;
    });

    resizedUrls.original = originalUrl;
    return resizedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mainImageUrl = existingProduct?.imageUrl || null;
      let extraImageUrlsArray = existingProduct?.extraImageUrls || [];

      if (image) {
        console.log("Uploading image:", image.name, image.size);
        const imageRef = ref(storage, `products/${Date.now()}_${image.name}`);
        const snapshot = await uploadBytes(imageRef, image);
        const originalUrl = await getDownloadURL(snapshot.ref);
        mainImageUrl = generateResizedUrls(originalUrl);
        console.log("Image uploaded successfully:", mainImageUrl);
      }

      if (extraImages.length > 0) {
        extraImageUrlsArray = [];
        const uploadPromises = extraImages.map(async (img, index) => {
          const imageRef = ref(storage, `products/extra/${Date.now()}_${index}_${img.name}`);
          const snapshot = await uploadBytes(imageRef, img);
          const originalUrl = await getDownloadURL(snapshot.ref);
          return generateResizedUrls(originalUrl);
        });
        extraImageUrlsArray = await Promise.all(uploadPromises);
      }

      const selectedShopData = shops.find(shop => shop.id === selectedShop);
      const selectedCategoryData = categories.find(cat => cat.id === category);
      const selectedSubCategoryData = subCategories.find(subCat => subCat.id === subCategory);

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category,
        categoryName: selectedCategoryData?.name || "",
        subCategory: subCategory || "",
        subCategoryName: selectedSubCategoryData?.name || "",
        imageUrl: mainImageUrl, // This is now an object with multiple resized URLs
        extraImageUrls: extraImageUrlsArray, // This is now an array of objects
        shopId: selectedShop,
        shopName: selectedShopData?.name || "",
        attributes: attributes.filter(attr => attr.name && attr.description),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        discount: discount ? parseFloat(discount) : 0,
        qty: parseInt(qty) || 0,
        warranty: warranty.trim(),
        manufacturer: manufacturer.trim(),
        isFeatured,
        sku: sku.trim(),
        productCode: productCode.trim(),
        slug: generateSlug(name),
        isDraft,
        createdAt: existingProduct ? existingProduct.createdAt : new Date(),
        updatedAt: new Date(),
        status: isDraft ? "draft" : "active"
      };

      if (existingProduct) {
        await updateDoc(doc(db, "products", existingProduct.id), productData);
      } else {
        await addDoc(collection(db, "products"), productData);
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExtraImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (extraImages.length + files.length > MAX_EXTRA_IMAGES) {
      alert(`You can only upload up to ${MAX_EXTRA_IMAGES} extra images.`);
      return;
    }
    setExtraImages([...extraImages, ...files]);
  };

  const removeExtraImage = (index) => {
    setExtraImages(extraImages.filter((_, i) => i !== index));
  };

  const removeExtraImageUrl = (index) => {
    setExtraImageUrls(extraImageUrls.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Shop Selection - Prominent at the top */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Shop Selection</h3>
            <p className="text-xs text-blue-700">Choose which shop this product belongs to</p>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-blue-800 mb-1">Shop *</label>
          <select
            required
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
            className="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Select shop</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>{shop.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Basic Information</h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter product name"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter product description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quantity</label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Categories</h3>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Main Category *</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select main category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">First, select the main category</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Sub Category (Optional)</label>
            <select
              value={subCategory}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                {!category 
                  ? "Select main category first"
                  : subCategories.length === 0
                    ? "No sub-categories available for this category"
                    : "Select sub category"
                }
              </option>
              {subCategories.map((subCat) => (
                <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {!category 
                ? "Sub-categories will appear after selecting a main category"
                : subCategories.length === 0
                  ? "No sub-categories available for this category"
                  : "Then, optionally select a sub-category"
              }
            </p>
          </div>
        </div>
      </div>

      {/* Product Codes */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Product Codes</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Auto-generated"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Product Code</label>
            <input
              type="text"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Auto-generated"
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Additional Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Discount (%)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
              min="0"
              max="100"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Warranty</label>
            <input
              type="text"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1 year"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Manufacturer</label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Manufacturer name"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter tags separated by commas"
          />
        </div>
      </div>

      {/* Product Attributes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h3 className="text-sm font-medium text-gray-900">Product Attributes</h3>
          <button
            type="button"
            onClick={handleAddAttribute}
            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            + Add Attribute
          </button>
        </div>
        
        <div className="space-y-3">
          {attributes.map((attribute, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Attribute Name</label>
                  <input
                    type="text"
                    value={attribute.name}
                    onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Color, Size, Material"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Attribute Value</label>
                  <input
                    type="text"
                    value={attribute.description}
                    onChange={(e) => handleAttributeChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Red, Large, Cotton"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveAttribute(index)}
                className="mt-6 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Remove
              </button>
            </div>
          ))}
          
          {attributes.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">No attributes added yet.</p>
              <p className="text-xs mt-1">Click "Add Attribute" to add product specifications like color, size, material, etc.</p>
            </div>
          )}
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Images</h3>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Main Image *</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
              } else {
                setImage(null);
                setImagePreview("");
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Main Image Preview" className="max-w-sm h-auto rounded-md" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Extra Images (Max {MAX_EXTRA_IMAGES})</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleExtraImagesChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Settings</h3>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Featured Product</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isDraft}
              onChange={(e) => setIsDraft(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Save as Draft</span>
          </label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : (existingProduct ? "Update Product" : "Create Product")}
        </button>
      </div>
    </form>
  );
}