// "use client";

// import { useEffect, useState } from "react";
// import { db } from "@/lib/firebase";
// import {
//   collection,
//   getDocs,
//   getCountFromServer,
//   query,
//   where,
//   doc,
//   deleteDoc,
//   Timestamp,
// } from "firebase/firestore";

// export default function SummaryCard() {
//   const [stats, setStats] = useState({
//     users: 0,
//     products: 0,
//     trending: 0,
//     pendingOrders: 0,
//     completedOrders: 0,
//     monthlyOrders: 0,
//     yearlyOrders: 0,
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       const now = new Date();
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const startOfYear = new Date(now.getFullYear(), 0, 1);

//       try {
//         const [usersSnap, productsSnap, trendingSnap, pendingSnap, completedSnap, monthlySnap, yearlySnap] = await Promise.all([
//           getCountFromServer(collection(db, 'users')),
//           getCountFromServer(collection(db, 'products')),
//           getCountFromServer(collection(db, 'trendingProducts')),
//           getCountFromServer(query(collection(db, 'orders'), where('status', '==', 'Pending'))),
//           getCountFromServer(query(collection(db, 'orders'), where('status', '==', 'Delivered'))),
//           getCountFromServer(query(collection(db, 'orders'), where('createdAt', '>=', Timestamp.fromDate(startOfMonth)))),
//           getCountFromServer(query(collection(db, 'orders'), where('createdAt', '>=', Timestamp.fromDate(startOfYear)))),
//         ]);

//         setStats({
//           users: usersSnap.data().count,
//           products: productsSnap.data().count,
//           trending: trendingSnap.data().count,
//           pendingOrders: pendingSnap.data().count,
//           completedOrders: completedSnap.data().count,
//           monthlyOrders: monthlySnap.data().count,
//           yearlyOrders: yearlySnap.data().count,
//         });
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm">
//       <h2 className="text-xl font-semibold text-center mb-4">Admin Metrics Summary</h2>
//       <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
//         <div><p className="text-gray-600 text-sm">Users</p><p className="text-lg font-bold">{stats.users}</p></div>
//         <div><p className="text-gray-600 text-sm">Products</p><p className="text-lg font-bold">{stats.products}</p></div>
//         <div><p className="text-gray-600 text-sm">Trending Products</p><p className="text-lg font-bold">{stats.trending}</p></div>
//         <div><p className="text-gray-600 text-sm">Pending Orders</p><p className="text-lg font-bold">{stats.pendingOrders}</p></div>
//         <div><p className="text-gray-600 text-sm">Completed Orders</p><p className="text-lg font-bold">{stats.completedOrders}</p></div>
//         <div><p className="text-gray-600 text-sm">Monthly Orders</p><p className="text-lg font-bold">{stats.monthlyOrders}</p></div>
//         <div><p className="text-gray-600 text-sm">Yearly Orders</p><p className="text-lg font-bold">{stats.yearlyOrders}</p></div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getCountFromServer,
  query,
  where,
} from "firebase/firestore";

export default function SummaryCard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    trending: 0,
    pendingOrders: 0,
    completedOrders: 0,
    monthlyOrders: 0,
    yearlyOrders: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

      try {
        const [
          usersSnap,
          productsSnap,
          trendingSnap,
          pendingSnap,
          completedSnap,
          monthlySnap,
          yearlySnap
        ] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'products')),
          getCountFromServer(collection(db, 'trendingProducts')),
          getCountFromServer(query(collection(db, 'orders'), where('status', '==', 'Pending'))),
          getCountFromServer(query(collection(db, 'orders'), where('status', '==', 'Delivered'))),
          getCountFromServer(query(collection(db, 'orders'), where('createdAt', '>=', startOfMonth))),
          getCountFromServer(query(collection(db, 'orders'), where('createdAt', '>=', startOfYear))),
        ]);

        setStats({
          users: usersSnap.data().count,
          products: productsSnap.data().count,
          trending: trendingSnap.data().count,
          pendingOrders: pendingSnap.data().count,
          completedOrders: completedSnap.data().count,
          monthlyOrders: monthlySnap.data().count,
          yearlyOrders: yearlySnap.data().count,
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="mt-8 bg-white p-6 rounded-2xl shadow-sm">
      <h2 className="text-xl font-semibold text-center mb-4">Admin Metrics Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center">
        <div><p className="text-gray-600 text-sm">Users</p><p className="text-lg font-bold">{stats.users}</p></div>
        <div><p className="text-gray-600 text-sm">Products</p><p className="text-lg font-bold">{stats.products}</p></div>
        <div><p className="text-gray-600 text-sm">Trending Products</p><p className="text-lg font-bold">{stats.trending}</p></div>
        <div><p className="text-gray-600 text-sm">Pending Orders</p><p className="text-lg font-bold">{stats.pendingOrders}</p></div>
        <div><p className="text-gray-600 text-sm">Completed Orders</p><p className="text-lg font-bold">{stats.completedOrders}</p></div>
        <div><p className="text-gray-600 text-sm">Monthly Orders</p><p className="text-lg font-bold">{stats.monthlyOrders}</p></div>
        <div><p className="text-gray-600 text-sm">Yearly Orders</p><p className="text-lg font-bold">{stats.yearlyOrders}</p></div>
      </div>
    </div>
  );
}
