// "use client";

// import { useEffect, useState } from "react";
// import { db } from "@/lib/firebase";
// import { collection, getDocs, doc, getDoc } from "firebase/firestore";

// export default function TrendingProductsTab() {
//   const [trendingList, setTrendingList] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchTrending = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, "trendingProducts"));
//         const items = await Promise.all(
//           snapshot.docs.map(async (docSnap) => {
//             const data = docSnap.data();
//             const productRef = doc(db, "products", data.productId);
//             const productSnap = await getDoc(productRef);

//             const shopRef = doc(db, "shops", data.shopId);
//             const shopSnap = await getDoc(shopRef);

//             return {
//               id: docSnap.id,
//               ...productSnap.data(),
//               shopName: shopSnap.exists() ? shopSnap.data().name : "Unknown Shop",
//             };
//           })
//         );
//         setTrendingList(items);
//       } catch (error) {
//         console.error("Error fetching trending products:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTrending();
//   }, []);

//   if (loading) return <p>Loading trending products...</p>;

//   return (
//     <section>
//       <h2 className="text-xl font-semibold mb-4">Trending Products</h2>
//       {trendingList.length === 0 ? (
//         <p>No trending products selected.</p>
//       ) : (
//         <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//           {trendingList.map((item) => (
//             <li key={item.id} className="border rounded-md p-4 bg-white shadow">
//               <h3 className="font-semibold text-lg">{item.name}</h3>
//               <p className="text-sm text-gray-600">{item.description}</p>
//               <p className="text-sm mt-2 italic text-gray-500">
//                 From shop: <strong>{item.shopName}</strong>
//               </p>
//             </li>
//           ))}
//         </ul>
//       )}
//     </section>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function TrendingProductsTab() {
  const [trendingList, setTrendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const snapshot = await getDocs(collection(db, "trendingProducts"));
        const items = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data() || {};
            const productId = data.productId || docSnap.id;

            // Fetch product data if possible
            let productData = null;
            try {
              if (productId) {
                const productRef = doc(db, "products", productId);
                const productSnap = await getDoc(productRef);
                if (productSnap.exists()) {
                  productData = productSnap.data();
                }
              }
            } catch {}

            // Fetch shop name if shopId is present
            let shopName = "Unknown Shop";
            try {
              if (data.shopId) {
                const shopRef = doc(db, "shops", data.shopId);
                const shopSnap = await getDoc(shopRef);
                if (shopSnap.exists()) {
                  shopName = shopSnap.data().name || shopName;
                }
              }
            } catch {}

            return {
              id: docSnap.id,
              name: productData?.name || data.name || "Unnamed",
              description: productData?.description,
              price: productData?.price ?? data.price ?? 0,
              imageUrl: productData?.imageUrl ?? data.imageUrl ?? null,
              sku: productData?.sku,
              shopName,
              source: data.source,
            };
          })
        );
        setTrendingList(items);
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) return <p>Loading trending products...</p>;

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Current Trending Products</h2>
      {trendingList.length === 0 ? (
        <p>No trending products selected.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trendingList.map((item) => (
            <li
              key={item.id}
              className="flex bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm space-x-4"
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                  loading="lazy"
                />
              )}
              <div className="flex flex-col justify-center flex-grow">
                <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {item.description || "No description available."}
                </p>
                {item.source && (
                  <p className="text-xs mt-1 text-gray-500">Source: {item.source}</p>
                )}
                <p className="text-sm mt-2 italic text-gray-500">
                  From shop: <strong>{item.shopName}</strong>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
