"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import ProductForm from "./ProductForm";

export default function ProductList() {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState("");
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      const snapshot = await getDocs(collection(db, "shops"));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setShops(list);
      if (list.length > 0) setSelectedShop(list[0].id);
    };
    fetchShops();
  }, []);

  useEffect(() => {
    if (!selectedShop) return;
    const fetchProducts = async () => {
      const q = query(collection(db, "products"), where("shopId", "==", selectedShop));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, [selectedShop]);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Products</h2>

      <select
        value={selectedShop}
        onChange={(e) => {
          setSelectedShop(e.target.value);
          setEditingProduct(null);
        }}
        className="p-2 border rounded"
      >
        {shops.map(shop => (
          <option key={shop.id} value={shop.id}>{shop.name}</option>
        ))}
      </select>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className={`p-4 border rounded shadow-sm ${editingProduct?.id === product.id ? "bg-blue-50 border-blue-400" : ""}`}
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-24 h-24 object-cover mb-2 rounded"
            />
            <h4 className="font-semibold">{product.name}</h4>
            <p className="text-sm text-gray-600 mb-2">UGX {product.price}</p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setEditingProduct(product)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>

            {editingProduct?.id === product.id && (
              <div className="mt-4 border-t pt-4">
                <h5 className="font-medium mb-2">Editing Product</h5>
                <ProductForm
                  existingProduct={editingProduct}
                  onSuccess={() => {
                    setEditingProduct(null);
                  }}
                />
                <button
                  onClick={() => setEditingProduct(null)}
                  className="mt-2 text-sm text-gray-700 underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
