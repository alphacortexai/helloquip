// // components/TrendingProductSelector.js
// "use client";

// import { useEffect, useState } from "react";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   getDocs,
//   doc,
//   setDoc,
//   deleteDoc,
//   query,
//   where,
// } from "firebase/firestore";

// export default function TrendingProductSelector() {
//   const [shops, setShops] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [selectedShopId, setSelectedShopId] = useState("");
//   const [trendingProductIds, setTrendingProductIds] = useState([]);

//   useEffect(() => {
//     const fetchShops = async () => {
//       const snapshot = await getDocs(collection(db, "shops"));
//       setShops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     };
//     fetchShops();
//   }, []);

//   useEffect(() => {
//     const fetchTrendingProducts = async () => {
//       const snapshot = await getDocs(collection(db, "trendingProducts"));
//       setTrendingProductIds(snapshot.docs.map(doc => doc.data().productId));
//     };
//     fetchTrendingProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!selectedShopId) return;
//       const q = query(collection(db, "products"), where("shopId", "==", selectedShopId));
//       const snapshot = await getDocs(q);
//       setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     };
//     fetchProducts();
//   }, [selectedShopId]);

//   const toggleTrending = async (productId) => {
//     const trendingRef = doc(db, "trendingProducts", productId);
//     const isTrending = trendingProductIds.includes(productId);
//     if (isTrending) {
//       await deleteDoc(trendingRef);
//       setTrendingProductIds(prev => prev.filter(id => id !== productId));
//     } else {
//       await setDoc(trendingRef, { productId, shopId: selectedShopId });
//       setTrendingProductIds(prev => [...prev, productId]);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold">Select Trending Products</h2>

//       <select
//         value={selectedShopId}
//         onChange={(e) => setSelectedShopId(e.target.value)}
//         className="p-2 border rounded"
//       >
//         <option value="">Select a shop</option>
//         {shops.map((shop) => (
//           <option key={shop.id} value={shop.id}>{shop.name}</option>
//         ))}
//       </select>

//       {products.length > 0 && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//           {products.map(product => (
//             <div key={product.id} className="border p-4 rounded shadow">
//               <h3 className="font-semibold">{product.name}</h3>
//               <p>{product.description}</p>
//               <label className="flex items-center space-x-2 mt-2">
//                 <input
//                   type="checkbox"
//                   checked={trendingProductIds.includes(product.id)}
//                   onChange={() => toggleTrending(product.id)}
//                 />
//                 <span>Mark as Trending</span>
//               </label>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }



// // components/TrendingProductSelector.js
// "use client";

// import { useEffect, useState } from "react";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   getDocs,
//   doc,
//   setDoc,
//   deleteDoc,
//   query,
//   where,
// } from "firebase/firestore";

// export default function TrendingProductSelector() {
//   const [shops, setShops] = useState([]);
//   const [products, setProducts] = useState([]);
//   const [selectedShopId, setSelectedShopId] = useState("");
//   const [trendingProductIds, setTrendingProductIds] = useState([]);

//   useEffect(() => {
//     const fetchShops = async () => {
//       const snapshot = await getDocs(collection(db, "shops"));
//       setShops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     };
//     fetchShops();
//   }, []);

//   useEffect(() => {
//     const fetchTrendingProducts = async () => {
//       const snapshot = await getDocs(collection(db, "trendingProducts"));
//       setTrendingProductIds(snapshot.docs.map(doc => doc.data().productId));
//     };
//     fetchTrendingProducts();
//   }, []);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!selectedShopId) return;
//       const q = query(collection(db, "products"), where("shopId", "==", selectedShopId));
//       const snapshot = await getDocs(q);
//       setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
//     };
//     fetchProducts();
//   }, [selectedShopId]);

//   const toggleTrending = async (productId) => {
//     const trendingRef = doc(db, "trendingProducts", productId);
//     const isTrending = trendingProductIds.includes(productId);

//     if (isTrending) {
//       await deleteDoc(trendingRef);
//       setTrendingProductIds(prev => prev.filter(id => id !== productId));
//     } else {
//       const product = products.find(p => p.id === productId);
//       if (!product) return;

//       const trendingData = {
//         productId,
//         shopId: selectedShopId,
//         name: product.name || "Unnamed",
//         description: product.description || "",
//         price: product.price || 0,
//         imageUrl: product.imageUrl || "/placeholder.png",
//       };

//       await setDoc(trendingRef, trendingData);
//       setTrendingProductIds(prev => [...prev, productId]);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold">Select Trending Products</h2>

//       <select
//         value={selectedShopId}
//         onChange={(e) => setSelectedShopId(e.target.value)}
//         className="p-2 border rounded"
//       >
//         <option value="">Select a shop</option>
//         {shops.map((shop) => (
//           <option key={shop.id} value={shop.id}>{shop.name}</option>
//         ))}
//       </select>

//       {products.length > 0 && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//           {products.map(product => (
//             <div key={product.id} className="border p-4 rounded shadow">
//               <h3 className="font-semibold">{product.name}</h3>
//               <p>{product.description}</p>
//               <label className="flex items-center space-x-2 mt-2">
//                 <input
//                   type="checkbox"
//                   checked={trendingProductIds.includes(product.id)}
//                   onChange={() => toggleTrending(product.id)}
//                 />
//                 <span>Mark as Trending</span>
//               </label>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";

export default function TrendingProductSelector() {
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [trendingProductIds, setTrendingProductIds] = useState([]);

  useEffect(() => {
    const fetchShops = async () => {
      const snapshot = await getDocs(collection(db, "shops"));
      setShops(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchShops();
  }, []);

  useEffect(() => {
    const fetchTrendingProducts = async () => {
      const snapshot = await getDocs(collection(db, "trendingProducts"));
      setTrendingProductIds(snapshot.docs.map(doc => doc.data().productId));
    };
    fetchTrendingProducts();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedShopId) return;
      const q = query(collection(db, "products"), where("shopId", "==", selectedShopId));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, [selectedShopId]);

  const toggleTrending = async (productId) => {
    const trendingRef = doc(db, "trendingProducts", productId);
    const isTrending = trendingProductIds.includes(productId);

    if (isTrending) {
      await deleteDoc(trendingRef);
      setTrendingProductIds(prev => prev.filter(id => id !== productId));
    } else {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const trendingData = {
        productId,
        shopId: selectedShopId,
        name: product.name || "Unnamed",
        description: product.description || "",
        price: product.price || 0,
        imageUrl: product.imageUrl || "/placeholder.png",
      };

      await setDoc(trendingRef, trendingData);
      setTrendingProductIds(prev => [...prev, productId]);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Select Trending Products</h2>

      <select
        value={selectedShopId}
        onChange={(e) => setSelectedShopId(e.target.value)}
        className="w-full max-w-sm p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">Select a shop</option>
        {shops.map((shop) => (
          <option key={shop.id} value={shop.id}>
            {shop.name}
          </option>
        ))}
      </select>

      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm flex items-start space-x-4"
            >
              {product.imageUrl && (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  loading="lazy"
                />
              )}

              <div className="flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                <p className="text-gray-600 text-sm">{product.description || "No description"}</p>

                <label className="mt-auto flex items-center space-x-3 cursor-pointer select-none pt-2">
                  <input
                    type="checkbox"
                    checked={trendingProductIds.includes(product.id)}
                    onChange={() => toggleTrending(product.id)}
                    className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-900 font-medium">Mark as Trending</span>
                </label>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}
