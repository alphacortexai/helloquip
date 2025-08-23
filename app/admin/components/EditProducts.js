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
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [userNames, setUserNames] = useState({});

  // Function to check all products and their shop assignments
  const checkAllProducts = async () => {
    try {
      const q = query(collection(db, "products"));
      const snapshot = await getDocs(q);
      const allProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      console.log("🔍 All Products in Database:", allProducts.map(p => ({
        id: p.id,
        name: p.name,
        shopId: p.shopId,
        isDraft: p.isDraft,
        status: p.status
      })));
      
      // Group by shopId
      const groupedByShop = {};
      allProducts.forEach(p => {
        const shopId = p.shopId || 'NO_SHOP';
        if (!groupedByShop[shopId]) {
          groupedByShop[shopId] = [];
        }
        groupedByShop[shopId].push(p);
      });
      
      console.log("📊 Products grouped by shopId:", groupedByShop);
      
      // Show alert with summary
      const summary = Object.entries(groupedByShop).map(([shopId, products]) => {
        const activeProducts = products.filter(p => !p.isDraft);
        const draftProducts = products.filter(p => p.isDraft);
        return `${shopId}: ${activeProducts.length} active, ${draftProducts.length} drafts`;
      }).join('\n');
      
      alert(`Product Summary:\n\n${summary}`);
    } catch (error) {
      console.error("Error checking all products:", error);
    }
  };

  useEffect(() => {
    const fetchShops = async () => {
      try {
        // Remove the createdBy filter to allow all admins to see all shops
        const q = query(collection(db, "shops"));
        const snapshot = await getDocs(q);
        const shopList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShops(shopList);
        if (shopList.length === 1) {
          setSelectedShopId(shopList[0].id);
        }

        // Fetch user names for all unique createdBy IDs
        const uniqueUserIds = [...new Set(shopList.map(shop => shop.createdBy).filter(Boolean))];
        await fetchUserNames(uniqueUserIds);
      } catch (error) {
        console.error("Error fetching shops: ", error);
      } finally {
        setLoadingShops(false);
      }
    };

    if (currentAdminUid) fetchShops();
  }, [currentAdminUid]);

         const fetchUserNames = async (userIds) => {
         try {
           const names = {};
           for (const userId of userIds) {
             try {
               // Get the user document directly by ID (since user ID is the document ID)
               const userDocRef = doc(db, "users", userId);
               const userDocSnap = await getDoc(userDocRef);
               
               if (userDocSnap.exists()) {
                 const userData = userDocSnap.data();
                 // Get the name field from the user document
                 names[userId] = userData.name || userId;
               } else {
                 names[userId] = userId; // Fallback to ID if user not found
               }
             } catch (error) {
               console.warn(`Error fetching user ${userId}:`, error);
               names[userId] = userId; // Fallback to ID
             }
           }
           setUserNames(names);
         } catch (error) {
           console.error("Error fetching user names:", error);
         }
       };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedShopId) return;
      setLoadingProducts(true);
      try {
        let q;
        if (selectedShopId === "other") {
          // Fetch products that don't have a shopId or have empty/null shopId
          // We'll fetch all products and filter on the client side
          q = query(collection(db, "products"));
        } else {
          // Fetch products for the selected shop
          q = query(
            collection(db, "products"),
            where("shopId", "==", selectedShopId)
          );
        }
        
        const snapshot = await getDocs(q);
        const productList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        
        console.log(`🔍 Debug: Fetched ${productList.length} products for shop "${selectedShopId}"`);
        console.log(`📋 Debug: All products:`, productList.map(p => ({
          id: p.id,
          name: p.name,
          shopId: p.shopId,
          isDraft: p.isDraft,
          status: p.status
        })));
        
        // Filter products based on selection
        let filteredProducts;
        if (selectedShopId === "other") {
          // Filter for products without shopId (null, empty string, or missing field)
          filteredProducts = productList.filter((p) => 
            !p.shopId || p.shopId === "" || p.shopId === null
          );
        } else {
          filteredProducts = productList;
        }
        
        const finalProducts = filteredProducts.filter((p) => !p.isDraft);
        console.log(`✅ Debug: Final products after filtering: ${finalProducts.length}`);
        console.log(`📋 Debug: Final products:`, finalProducts.map(p => ({
          id: p.id,
          name: p.name,
          shopId: p.shopId,
          isDraft: p.isDraft
        })));
        
        setProducts(finalProducts);
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
        // Delete the product
        await deleteDoc(doc(db, "products", id));
        
        // Also remove from trending products if it exists there
        try {
          const trendingRef = doc(db, "trendingProducts", id);
          await deleteDoc(trendingRef);
          console.log(`Removed product ${id} from trending products`);
        } catch (trendingError) {
          // Product wasn't trending, which is fine
          console.log(`Product ${id} was not in trending products`);
        }
        
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
      let q;
      if (selectedShopId === "other") {
        // Fetch all products and filter on client side
        q = query(collection(db, "products"));
      } else {
        q = query(
          collection(db, "products"),
          where("shopId", "==", selectedShopId)
        );
      }
      const snapshot = await getDocs(q);
      const productList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Filter products based on selection
      let filteredProducts;
      if (selectedShopId === "other") {
        // Filter for products without shopId (null, empty string, or missing field)
        filteredProducts = productList.filter((p) => 
          !p.shopId || p.shopId === "" || p.shopId === null
        );
      } else {
        filteredProducts = productList;
      }
      
      setProducts(filteredProducts.filter((p) => !p.isDraft));
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
               {shop.name} {shop.createdBy && `(by ${userNames[shop.createdBy] || shop.createdBy})`}
             </option>
           ))}
          <option value="other">Other (No Shop)</option>
        </select>
      </div>

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

          {/* Debug Information */}
          <div className="mb-4 p-3 bg-gray-100 rounded-lg text-sm">
            <div className="font-semibold mb-2">🔍 Debug Info:</div>
            <div>Selected Shop ID: <span className="font-mono">{selectedShopId}</span></div>
            <div>Total Products Fetched: <span className="font-mono">{products.length}</span></div>
            <div>Filtered Products: <span className="font-mono">{filteredProducts.length}</span></div>
            <div>Search Term: <span className="font-mono">"{searchTerm}"</span></div>
            {products.length > 0 && (
              <div className="mt-2">
                <div className="font-semibold">Product Shop IDs:</div>
                <div className="text-xs font-mono">
                  {products.map(p => `${p.name}: ${p.shopId || 'null'}`).join(', ')}
                </div>
              </div>
            )}
            <button
              onClick={checkAllProducts}
              className="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
            >
              🔍 Check All Products
            </button>
          </div>

          {loadingProducts ? (
            <p>Loading products...</p>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-4">
              {selectedShopId === "other" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Products Without Shop Assignment
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>These products don't belong to any shop. You can edit them to assign a shop or delete them if they're no longer needed.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`p-4 border rounded-lg flex items-center gap-4 shadow-sm ${
                    selectedShopId === "other" 
                      ? "bg-red-50 border-red-200" 
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={typeof product.imageUrl === 'object' ? product.imageUrl.original || product.imageUrl['200x200'] : product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Fallback icon when no image */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm bg-gray-100" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                      🏥
                    </div>
                  </div>

                  {/* Product Information */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{product.name}</p>
                      {selectedShopId === "other" && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          No Shop
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {product.categoryName || product.category} — UGX {product.price}
                    </p>
                    {product.sku && (
                      <p className="text-xs text-gray-400 mt-1">
                        SKU: {product.sku}
                      </p>
                    )}
                    {selectedShopId === "other" && (
                      <p className="text-xs text-red-600 mt-1">
                        Shop ID: {product.shopId || "Not assigned"}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(product)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
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
