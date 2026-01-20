
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





// "use client";

// import { useEffect, useState } from "react";
// import { db } from "@/lib/firebase";
// import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
// import { useRouter } from "next/navigation"; // for navigation

// const statuses = ["Pending", "Confirmed", "Shipping", "Delivered", "Canceled"];

// export default function OrderManager() {
//   const [orders, setOrders] = useState([]);
//   const router = useRouter();

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

//   const openChatForUser = (userId) => {
//     router.push(`/admin/chat?userId=${userId}`); 
//     // This assumes you have a page or tab at /admin/chat that loads AdminChatPanel component
//   };

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Manage Orders & Shipments</h2>
//       {orders.map((order) => (
//         <div key={order.id} className="border p-4 mb-4 rounded-md shadow-sm">
//           <p><strong>Order ID:</strong> {order.id}</p>
//           <p>
//             <strong>Status:</strong> <span className="text-blue-600">{order.status}</span>
//           </p>

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

//           <p className="mt-2">
//             <strong>Total:</strong> UGX {order.totalAmount.toLocaleString()}
//           </p>

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

//           {/* Chat button */}
//           <button
//             onClick={() => openChatForUser(order.userId)}
//             className="mt-3 bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 text-sm"
//           >
//             Chat with User
//           </button>
//         </div>
//       ))}
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp, getDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

const statuses = ["Pending", "Confirmed", "Shipping", "Delivered", "Canceled"];

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Confirmed":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Shipping":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Delivered":
      return "bg-green-100 text-green-800 border-green-200";
    case "Canceled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const snapshot = await getDocs(collection(db, "orders"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setOrders(data);
    };

    fetchOrders();
  }, []);

  // If navigated with an orderId query param, auto-select it
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const orderId = url.searchParams.get('orderId');
    if (!orderId) return;
    const found = orders.find((o) => o.id === orderId);
    if (found) setSelected(found);
  }, [orders]);

  const updateStatus = async (orderId, newStatus) => {
    const orderRef = doc(db, "orders", orderId);
    const current = orders.find((o) => o.id === orderId);
    const prev = current?.status || "";
    if (prev === newStatus) {
      return; // No-op: avoid sending duplicate notifications
    }
    await updateDoc(orderRef, { status: newStatus });
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    if (selected?.id === orderId) {
      setSelected((prev) => ({ ...prev, status: newStatus }));
    }

    // Try notify user of status change with 3s delay
    try {
      const updated = current;
      if (!updated) return;
      // Delay before sending
      await new Promise((res) => setTimeout(res, 3000));
      const userRef = doc(db, "users", updated.userId);
      const userSnap = await getDoc(userRef);
      const fcmToken = userSnap.exists() ? userSnap.data().fcmToken : null;
      const title = "Order Status Updated";
      const total = (updated.totalAmount != null ? updated.totalAmount : (updated.items||[]).reduce((sum, it) => sum + ((it.discount>0? it.price*(1-it.discount/100):it.price)*(it.quantity||1)), 0));
      const items = (updated.items || []).map((it) => `${it.name} x ${it.quantity||1}`);
      const summary = items.length > 3 ? `${items.slice(0,3).join(", ")} and ${items.length-3} more` : items.join(", ");
      const orderIdDisplay = orderId.toUpperCase();
      const body = `Your order ${orderIdDisplay} (${summary}, UGX ${Number(total||0).toLocaleString()}) changed from ${prev || 'previous'} to ${newStatus}.`;
      if (fcmToken) {
        try {
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          const deepLink = `${origin}/order/${orderId}`;
          console.log("📱 Attempting to send FCM notification:", {
            orderId,
            userId: updated.userId,
            tokenLength: fcmToken?.length,
            title,
            body: body.substring(0, 50) + "..."
          });
          
          const res = await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              fcmToken, 
              title, 
              body, 
              target: `/order/${orderId}`, 
              link: deepLink,
              userId: updated.userId,
              notificationType: "fcm"
            })
          });
          
          const result = await res.json();
          if (result.success) {
            console.log("✅ FCM notification sent successfully");
          } else {
            console.error("❌ FCM notification failed:", result.error, result.code);
          }
        } catch (fcmError) {
          console.error("❌ FCM request failed:", fcmError.message);
        }
      } else {
        console.warn("⚠️ No FCM token found for user:", updated.userId);
      }
      // Always create in-app notification so it appears in the UI
      const messageData = {
        from: "system",
        to: updated.userId,
        title,
        text: body,
        timestamp: serverTimestamp(),
        chatId: `system_${updated.userId}`,
        type: "notification",
        orderId,
        target: `/order/${orderId}`,
        read: false,
      };
      
      const messageRef = await addDoc(collection(db, "messages"), messageData);

      // Track this in-app notification in the notifications collection
      const notificationData = {
        userId: updated.userId,
        title,
        body,
        target: `/order/${orderId}`,
        type: "in_app",
        status: "sent",
        read: false,
        sentAt: serverTimestamp(),
        readAt: null,
        source: "order_status_update",
        orderId,
        messageId: messageRef.id // Use the actual document ID
      };
      await addDoc(collection(db, "notifications"), notificationData);
    } catch (e) {
      console.warn('Order status notify failed', e);
    }
  };

  const openChatForUser = (userId) => {
    router.push(`/admin/chat?userId=${userId}`);
  };

  const deleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, "orders", orderId));
      setOrders(prev => prev.filter(order => order.id !== orderId));
      if (selected?.id === orderId) {
        setSelected(null);
      }
      alert('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again.');
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left: Order List */}
      <div className="w-full md:w-1/3 bg-white border rounded-xl p-4 h-[500px] overflow-auto">
        <h2 className="text-lg font-bold mb-4">Orders</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map((order) => (
            <button
              key={order.id}
              onClick={() => setSelected(order)}
              className={`block w-full text-left p-3 rounded hover:bg-gray-100 ${
                selected?.id === order.id ? "bg-blue-100" : ""
              }`}
            >
              <p className="font-semibold">Order #{order.id.toUpperCase()}</p>
              <p className="text-sm text-gray-500">
                {(order.userName || order.address?.fullName || "No Name")} —{" "}
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </p>
            </button>
          ))
        )}
      </div>

      {/* Right: Order Details */}
      <div className="w-full md:w-2/3 bg-white border rounded-xl p-4 h-[500px] overflow-auto">
        {selected ? (
          <>
            <h3 className="text-lg font-bold mb-2">Order Details</h3>
            <p>
              <strong>Order ID:</strong> {selected.id}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selected.status)}`}>
                {selected.status}
              </span>
            </p>
            {selected.paymentMethod && (
              <p className="mt-1">
                <strong>Payment:</strong> {selected.paymentMethod.toUpperCase()} ({selected.paymentStatus || 'pending'})
              </p>
            )}

            <hr className="my-4" />

            <h4 className="font-semibold mb-2">Items</h4>
            <ul className="text-sm space-y-2">
              {selected.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between border-b py-1 text-gray-700"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  {item.shopName && (
                    <span className="text-gray-500 text-xs">
                      (Shop: {item.shopName})
                    </span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-4 font-semibold">
              <p>Total: UGX {selected.totalAmount.toLocaleString()}</p>
            </div>

            <hr className="my-4" />

            <h4 className="font-semibold mb-2">Customer Info</h4>
            {selected.address?.customerType === 'company' ? (
              <div className="text-sm">
                <p><strong>Organization:</strong> {selected.address.organizationName || 'N/A'}</p>
                <p><strong>Contact Person:</strong> {selected.address.contactPerson || 'N/A'}</p>
                {selected.address.designation && (
                  <p><strong>Designation:</strong> {selected.address.designation}</p>
                )}
                <p><strong>Email:</strong> {selected.userEmail || selected.address.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {selected.userPhone || selected.address.phoneNumber || 'N/A'}</p>
              </div>
            ) : (
              <div className="text-sm">
                <p><strong>Name:</strong> {selected.userName || selected.address?.fullName || 'N/A'}</p>
                <p><strong>Email:</strong> {selected.userEmail || 'N/A'}</p>
                <p><strong>Phone:</strong> {selected.userPhone || selected.address?.phoneNumber || 'N/A'}</p>
              </div>
            )}
            <p className="mt-1 text-sm">
              <strong>Address:</strong>{" "}
              {selected.address
                ? `${selected.address.city}, ${selected.address.area}`
                : "N/A"}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(selected.id, status)}
                  className={`px-3 py-2 text-sm rounded-full font-medium border transition-colors ${
                    status === selected.status
                      ? getStatusColor(status)
                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Payment Actions for COD */}
            {selected.paymentMethod === 'cod' && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-sm">Payment</h4>
                <button
                  onClick={async () => {
                    try {
                      await updateDoc(doc(db, 'orders', selected.id), { paymentStatus: 'paid' });
                      setSelected((prev) => ({ ...prev, paymentStatus: 'paid' }));
                      setOrders((prev) => prev.map((o) => o.id === selected.id ? { ...o, paymentStatus: 'paid' } : o));
                    } catch (e) {
                      console.warn('Failed to update payment status', e);
                    }
                  }}
                  className={`px-3 py-2 text-xs rounded-md ${selected.paymentStatus === 'paid' ? 'bg-green-600 text-white' : 'bg-[#2e4493] text-white hover:bg-[#131a2f]'}`}
                  disabled={selected.paymentStatus === 'paid'}
                  title={selected.paymentStatus === 'paid' ? 'Payment already marked as received' : 'Mark cash as received'}
                >
                  {selected.paymentStatus === 'paid' ? 'Cash Received' : 'Mark Cash Received'}
                </button>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => openChatForUser(selected.userId)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Chat with User
              </button>
              <button
                onClick={() => deleteOrder(selected.id)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
              >
                Delete Order
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select an order to view details.</p>
        )}
      </div>
    </div>
  );
}
