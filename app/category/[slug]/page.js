"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

// Helper to decode URL and pick preferred size
const getPreferredImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (typeof imageUrl === "string") {
    try {
      return decodeURIComponent(imageUrl);
    } catch {
      return imageUrl;
    }
  }
  if (typeof imageUrl === "object") {
    const preferred = imageUrl["200x200"] || imageUrl["original"] || Object.values(imageUrl)[0];
    try {
      return decodeURIComponent(preferred);
    } catch {
      return preferred;
    }
  }
  return null;
};

export default function CategoryPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      setLoading(true);
      try {
        const categorySnap = await getDocs(collection(db, "categories"));
        let currentCategory = null;
        const categories = [];

        categorySnap.forEach((doc) => {
          const data = doc.data();
          categories.push({ id: doc.id, ...data });
          if (data.slug === slug) {
            currentCategory = { id: doc.id, ...data };
          }
        });

        if (!currentCategory) {
          setCategoryName("Unknown Category");
          setProducts([]);
          return;
        }

        setCategoryName(currentCategory.name);

        // Load subcategories
        const subCats = categories.filter((cat) => cat.parentId === currentCategory.id);
        setSubcategories(subCats);

        // Load products in category
        const productSnap = await getDocs(
          query(collection(db, "products"), where("category", "==", currentCategory.id))
        );

        let allProducts = productSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Filter by subcategory if selected
        if (selectedSubCategory) {
          allProducts = allProducts.filter((p) => p.subCategory === selectedSubCategory);
        }

        setProducts(allProducts);
      } catch (error) {
        console.error("Error loading category products:", error);
        setProducts([]);
      }
      setLoading(false);
    };

    fetchCategoryAndProducts();
  }, [slug, selectedSubCategory]);

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Link href="/" className="hover:text-[#2e4493]">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{categoryName}</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">{categoryName}</h1>
          </div>
          <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
            {products.length} Products Found
          </div>
        </div>

        {/* Subcategories */}
        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedSubCategory(null)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                selectedSubCategory === null
                  ? "bg-[#2e4493] text-white shadow-lg"
                  : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              All Items
            </button>
            {subcategories.map((subcat) => (
              <button
                key={subcat.id}
                onClick={() => setSelectedSubCategory(selectedSubCategory === subcat.id ? null : subcat.id)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedSubCategory === subcat.id
                    ? "bg-[#2e4493] text-white shadow-lg"
                    : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                }`}
              >
                {subcat.name}
              </button>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 h-80 animate-pulse border border-gray-100"></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100">
            <div className="text-6xl mb-6">🏥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500 mb-8">We couldn't find any products in this category at the moment.</p>
            <Link href="/" className="bg-[#2e4493] text-white px-8 py-3 rounded-full font-bold hover:bg-[#1a2a5e] transition-all">
              Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="portrait"
                onClick={() => router.push(`/product/${product.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
