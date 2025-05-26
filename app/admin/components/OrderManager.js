
// "use client";

// import { useEffect, useState } from "react";
// import { db } from "@/lib/firebase";
// import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
// import AdminUserChat from "./AdminUserChat"; // Adjust path as needed

// const statuses = ["Pending", "Confirmed", "Shipping", "Delivered", "Canceled"];

// export default function OrderManager() {
//   const [orders, setOrders] = useState([]);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       const querySnapshot = await getDocs(collection(db, "orders"));

//       const enrichedOrders = querySnapshot.docs.map((docSnap) => {
//         const data = docSnap.data();

//         return {
//           id: docSnap.id,
//           ...data,
//         };
//       });

//       setOrders(enrichedOrders);
//     };

//     fetchOrders();
//   }, []);

//   const updateStatus = async (orderId, newStatus) => {
//     const orderRef = doc(db, "orders", orderId);
//     await updateDoc(orderRef, { status: newStatus });

//     setOrders((prev) =>
//       prev.map((order) =>
//         order.id === orderId ? { ...order, status: newStatus } : order
//       )
//     );
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Manage Orders & Shipments</h2>
//       {orders.map((order) => (
//         <div key={order.id} className="border p-4 mb-4 rounded-md shadow-sm">
//           <p><strong>Order ID:</strong> {order.id}</p>
//           <p><strong>Status:</strong> <span className="text-blue-600">{order.status}</span></p>

//           <p className="mt-2"><strong>Ordered Items:</strong></p>
//           <ul className="list-disc pl-5 text-sm text-gray-700">
//             {order.items.map((item, idx) => (
//               <li key={idx}>
//                 {item.name} × {item.quantity}
//                 {item.shopName && (
//                   <span className="text-gray-500"> (Shop: {item.shopName})</span>
//                 )}
//               </li>
//             ))}
//           </ul>

//           <p className="mt-2"><strong>Total:</strong> UGX {order.totalAmount.toLocaleString()}</p>

//           <div className="mt-4 text-sm">
//             <p><strong>User Info:</strong></p>
//             <p>Name: {order.userName || "N/A"}</p>
//             <p>Email: {order.userEmail || "N/A"}</p>
//             <p>Phone: {order.userPhone || "N/A"}</p>
//             <p>Address: {order.address?.fullName}, {order.address?.city}, {order.address?.area}</p>
//           </div>

//           <div className="mt-3 flex gap-2 flex-wrap">
//             {statuses.map((status) => (
//               <button
//                 key={status}
//                 onClick={() => updateStatus(order.id, status)}
//                 className={`px-2 py-1 text-sm rounded-md ${
//                   status === order.status
//                     ? "bg-blue-600 text-white"
//                     : "bg-gray-200 hover:bg-gray-300"
//                 }`}
//               >
//                 {status}
//               </button>
//             ))}
//           </div>

//           {/* 🔁 Replace old message form with AdminUserChat */}
//           <AdminUserChat userId={order.userId} />
//         </div>
//       ))}
//     </div>
//   );
// }





"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation"; // for navigation

const statuses = ["Pending", "Confirmed", "Shipping", "Delivered", "Canceled"];

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const querySnapshot = await getDocs(collection(db, "orders"));

      const enrichedOrders = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
        };
      });

      setOrders(enrichedOrders);
    };

    fetchOrders();
  }, []);

  const updateStatus = async (orderId, newStatus) => {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status: newStatus });

    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const openChatForUser = (userId) => {
    router.push(`/admin/chat?userId=${userId}`); 
    // This assumes you have a page or tab at /admin/chat that loads AdminChatPanel component
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Orders & Shipments</h2>
      {orders.map((order) => (
        <div key={order.id} className="border p-4 mb-4 rounded-md shadow-sm">
          <p><strong>Order ID:</strong> {order.id}</p>
          <p>
            <strong>Status:</strong> <span className="text-blue-600">{order.status}</span>
          </p>

          <p className="mt-2"><strong>Ordered Items:</strong></p>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {order.items.map((item, idx) => (
              <li key={idx}>
                {item.name} × {item.quantity}
                {item.shopName && (
                  <span className="text-gray-500"> (Shop: {item.shopName})</span>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-2">
            <strong>Total:</strong> UGX {order.totalAmount.toLocaleString()}
          </p>

          <div className="mt-4 text-sm">
            <p><strong>User Info:</strong></p>
            <p>Name: {order.userName || "N/A"}</p>
            <p>Email: {order.userEmail || "N/A"}</p>
            <p>Phone: {order.userPhone || "N/A"}</p>
            <p>Address: {order.address?.fullName}, {order.address?.city}, {order.address?.area}</p>
          </div>

          <div className="mt-3 flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => updateStatus(order.id, status)}
                className={`px-2 py-1 text-sm rounded-md ${
                  status === order.status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Chat button */}
          <button
            onClick={() => openChatForUser(order.userId)}
            className="mt-3 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
          >
            Chat with User
          </button>
        </div>
      ))}
    </div>
  );
}
