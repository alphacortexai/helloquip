"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import ProductForm from "./ProductForm";

export default function EditProducts({ currentAdminUid }) {
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [products, setProducts] = useState([]);
  const [loadingShops, setLoadingShops] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const q = query(
          collection(db, "shops"),
          where("createdBy", "==", currentAdminUid)
        );
        const snapshot = await getDocs(q);
        const shopList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShops(shopList);
        if (shopList.length === 1) {
          setSelectedShopId(shopList[0].id);
        }
      } catch (error) {
        console.error("Error fetching shops: ", error);
      } finally {
        setLoadingShops(false);
      }
    };

    if (currentAdminUid) fetchShops();
  }, [currentAdminUid]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedShopId) return;
      setLoadingProducts(true);
      try {
        const q = query(
          collection(db, "products"),
          where("shopId", "==", selectedShopId)
        );
        const snapshot = await getDocs(q);
        const productList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList.filter((p) => !p.isDraft));
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [selectedShopId]);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (error) {
        alert("Failed to delete product. Please try again.");
        console.error("Delete error:", error);
      }
    }
  };

  const handleEdit = async (product) => {
    // Optional: fetch latest version from Firestore
    // const snap = await getDoc(doc(db, "products", product.id));
    // if (snap.exists()) {
    //   setEditingProduct({ id: snap.id, ...snap.data() });
    // } else {
    //   alert("Product no longer exists.");
    // }

    setEditingProduct(product);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setSearchTerm(""); // clear search input
  };

  const handleUpdateSuccess = async () => {
    setEditingProduct(null);
    setSearchTerm(""); // clear search input

    try {
      const q = query(
        collection(db, "products"),
        where("shopId", "==", selectedShopId)
      );
      const snapshot = await getDocs(q);
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList.filter((p) => !p.isDraft));
    } catch (error) {
      console.error("Error refreshing products after update:", error);
    }
  };

  const filteredProducts = products.filter((p) =>
    (p.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loadingShops) return <p>Loading your shops...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Edit Products</h2>

      {/* Shop Selection */}
      {shops.length > 1 && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Select a shop:</label>
          <select
            className="px-3 py-2 rounded w-full bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            disabled={!!editingProduct}
          >
            <option value="">-- Select Shop --</option>
            {shops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Product Form for Editing */}
      {editingProduct && (
        <div className="mb-6">
          <ProductForm
            key={editingProduct.id}
            existingProduct={editingProduct}
            onSuccess={handleUpdateSuccess}
          />
          <button
            onClick={handleCancelEdit}
            className="mt-3 text-sm text-red-600 underline"
          >
            Cancel Edit
          </button>
        </div>
      )}

      {/* Product Search + List */}
      {selectedShopId && !editingProduct && (
        <>
          <input
            type="text"
            placeholder="Search product by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4 w-full px-4 py-2 border rounded-lg bg-white"
          />

          {loadingProducts ? (
            <p>Loading products...</p>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{product.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {product.category} — UGX {product.price}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No products found.</p>
          )}
        </>
      )}

      {!selectedShopId && <p>Please select a shop to manage its products.</p>}
    </div>
  );
}












// "use client";

// import { useEffect, useState } from "react";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   getDocs,
//   query,
//   where,
//   doc,
//   deleteDoc,
// } from "firebase/firestore";
// import ProductForm from "./ProductForm"; // ✅ adjust if needed

// export default function EditProducts({ currentAdminUid }) {
//   const [shops, setShops] = useState([]);
//   const [selectedShopId, setSelectedShopId] = useState("");
//   const [products, setProducts] = useState([]);
//   const [loadingShops, setLoadingShops] = useState(true);
//   const [loadingProducts, setLoadingProducts] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);

//   useEffect(() => {
//     const fetchShops = async () => {
//       try {
//         const q = query(
//           collection(db, "shops"),
//           where("createdBy", "==", currentAdminUid)
//         );
//         const snapshot = await getDocs(q);
//         const shopList = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setShops(shopList);
//         if (shopList.length === 1) {
//           setSelectedShopId(shopList[0].id);
//         }
//       } catch (error) {
//         console.error("Error fetching shops: ", error);
//       } finally {
//         setLoadingShops(false);
//       }
//     };

//     if (currentAdminUid) fetchShops();
//   }, [currentAdminUid]);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!selectedShopId) return;
//       setLoadingProducts(true);
//       try {
//         const q = query(
//           collection(db, "products"),
//           where("shopId", "==", selectedShopId)
//         );
//         const snapshot = await getDocs(q);
//         const productList = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setProducts(productList);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoadingProducts(false);
//       }
//     };

//     fetchProducts();
//   }, [selectedShopId]);

//   const handleDelete = async (id) => {
//     if (confirm("Are you sure you want to delete this product?")) {
//       await deleteDoc(doc(db, "products", id));
//       setProducts(products.filter((p) => p.id !== id));
//     }
//   };

//   const handleEdit = (product) => {
//     setEditingProduct(product);
//   };

//   const handleCancelEdit = () => {
//     setEditingProduct(null);
//   };

//   const handleUpdateSuccess = async () => {
//     setEditingProduct(null);
//     const q = query(
//       collection(db, "products"),
//       where("shopId", "==", selectedShopId)
//     );
//     const snapshot = await getDocs(q);
//     const productList = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//     setProducts(productList);
//   };

//   if (loadingShops) return <p>Loading your shops...</p>;

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Edit Products</h2>

//       {/* Shop Selection */}
//       {shops.length > 1 && (
//         <div className="mb-4">
//           <label className="block mb-2 font-medium">Select a shop:</label>
//           <select
//             className=" px-3 py-2 rounded w-full  p-3 bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
//             value={selectedShopId}
//             onChange={(e) => setSelectedShopId(e.target.value)}
//           >
//             <option value="">-- Select Shop --</option>
//             {shops.map((shop) => (
//               <option key={shop.id} value={shop.id}>
//                 {shop.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Product Form for Editing */}
//       {editingProduct && (
//         <div className="mb-6">
//           <ProductForm
//             key={editingProduct.id} // ✅ Forces remount on switching products
//             existingProduct={editingProduct}
//             onSuccess={handleUpdateSuccess}
//           />
//           <button
//             onClick={handleCancelEdit}
//             className="mt-3 text-sm text-red-600 underline"
//           >
//             Cancel Edit
//           </button>
//         </div>
//       )}

//       {/* Product List */}
//       {selectedShopId ? (
//         loadingProducts ? (
//           <p>Loading products...</p>
//         ) : products.length > 0 ? (
//           <div className="space-y-4">
//             {products.map((product) => (
//               <div
//                 key={product.id}
//                 className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center shadow-sm"
//               >
//                 <div className="flex-1 min-w-0">
//                   <p className="font-semibold truncate">{product.name}</p>
//                   <p className="text-sm text-gray-500 truncate">
//                     {product.category} — UGX {product.price}
//                   </p>
//                 </div>
//                 <div className="flex space-x-2 ml-4 flex-shrink-0">
//                   <button
//                     onClick={() => handleEdit(product)}
//                     className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded whitespace-nowrap"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => handleDelete(product.id)}
//                     className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded whitespace-nowrap"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </div>

//             ))}
//           </div>
//         ) : (
//           <p>No products found for this shop.</p>
//         )
//       ) : (
//         <p>Please select a shop to manage its products.</p>
//       )}
//     </div>
//   );
// }










// "use client";

// import { useEffect, useState } from "react";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   getDocs,
//   query,
//   where,
//   doc,
//   deleteDoc,
// } from "firebase/firestore";
// import ProductForm from "./ProductForm";

// export default function EditProducts({ currentAdminUid }) {
//   const [shops, setShops] = useState([]);
//   const [selectedShopId, setSelectedShopId] = useState("");
//   const [products, setProducts] = useState([]);
//   const [loadingShops, setLoadingShops] = useState(true);
//   const [loadingProducts, setLoadingProducts] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     const fetchShops = async () => {
//       try {
//         const q = query(
//           collection(db, "shops"),
//           where("createdBy", "==", currentAdminUid)
//         );
//         const snapshot = await getDocs(q);
//         const shopList = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setShops(shopList);
//         if (shopList.length === 1) {
//           setSelectedShopId(shopList[0].id);
//         }
//       } catch (error) {
//         console.error("Error fetching shops: ", error);
//       } finally {
//         setLoadingShops(false);
//       }
//     };

//     if (currentAdminUid) fetchShops();
//   }, [currentAdminUid]);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!selectedShopId) return;
//       setLoadingProducts(true);
//       try {
//         const q = query(
//           collection(db, "products"),
//           where("shopId", "==", selectedShopId)
//         );
//         const snapshot = await getDocs(q);
//         const productList = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         // setProducts(productList);
//         setProducts(productList.filter((p) => !p.isDraft));
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       } finally {
//         setLoadingProducts(false);
//       }
//     };

//     fetchProducts();
//   }, [selectedShopId]);

//   const handleDelete = async (id) => {
//     if (confirm("Are you sure you want to delete this product?")) {
//       await deleteDoc(doc(db, "products", id));
//       setProducts(products.filter((p) => p.id !== id));
//     }
//   };

//   const handleEdit = (product) => {
//     setEditingProduct(product);
//   };

//   const handleCancelEdit = () => {
//     setEditingProduct(null);
//     setSearchTerm(""); // clear search input
//   };

//   const handleUpdateSuccess = async () => {
//     setEditingProduct(null);
//     setSearchTerm(""); // clear search input
//     const q = query(
//       collection(db, "products"),
//       where("shopId", "==", selectedShopId)
//     );
//     const snapshot = await getDocs(q);
//     const productList = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));
//     setProducts(productList);
//   };

//   const filteredProducts = products.filter((p) =>
//     p.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loadingShops) return <p>Loading your shops...</p>;

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Edit Products</h2>

//       {/* Shop Selection */}
//       {shops.length > 1 && (
//         <div className="mb-4">
//           <label className="block mb-2 font-medium">Select a shop:</label>
//           <select
//             className="px-3 py-2 rounded w-full bg-blue-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
//             value={selectedShopId}
//             onChange={(e) => setSelectedShopId(e.target.value)}
//           >
//             <option value="">-- Select Shop --</option>
//             {shops.map((shop) => (
//               <option key={shop.id} value={shop.id}>
//                 {shop.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* Product Form for Editing */}
//       {editingProduct && (
//         <div className="mb-6">
//           <ProductForm
//             key={editingProduct.id}
//             existingProduct={editingProduct}
//             onSuccess={handleUpdateSuccess}
//           />
//           <button
//             onClick={handleCancelEdit}
//             className="mt-3 text-sm text-red-600 underline"
//           >
//             Cancel Edit
//           </button>
//         </div>
//       )}

//       {/* Product Search + List */}
//       {selectedShopId && !editingProduct && (
//         <>
//           <input
//             type="text"
//             placeholder="Search product by name..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="mb-4 w-full px-4 py-2 border rounded-lg bg-white"
//           />

//           {loadingProducts ? (
//             <p>Loading products...</p>
//           ) : filteredProducts.length > 0 ? (
//             <div className="space-y-4">
//               {filteredProducts.map((product) => (
//                 <div
//                   key={product.id}
//                   className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex justify-between items-center shadow-sm"
//                 >
//                   <div className="flex-1 min-w-0">
//                     <p className="font-semibold truncate">{product.name}</p>
//                     <p className="text-sm text-gray-500 truncate">
//                       {product.category} — UGX {product.price}
//                     </p>
//                   </div>
//                   <div className="flex space-x-2 ml-4 flex-shrink-0">
//                     <button
//                       onClick={() => handleEdit(product)}
//                       className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(product.id)}
//                       className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p>No products found.</p>
//           )}
//         </>
//       )}

//       {!selectedShopId && <p>Please select a shop to manage its products.</p>}
//     </div>
//   );
// }
