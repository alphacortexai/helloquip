// "use client";

// import { useEffect, useState } from "react";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function ShipmentsPage() {
//   const router = useRouter();
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userId, setUserId] = useState(null);

//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         router.push("/login");
//         return;
//       }
//       setUserId(user.uid);

//       // Query orders from Firestore for this user
//       const ordersRef = collection(db, "orders");
//       const q = query(
//         ordersRef,
//         where("userId", "==", user.uid),
//         orderBy("createdAt", "desc")
//       );

//       try {
//         const querySnapshot = await getDocs(q);
//         if (querySnapshot.empty) {
//           // No orders in Firestore, fallback to localStorage check
//           const localOrderItems = JSON.parse(localStorage.getItem("orderItems") || "[]");
//           if (localOrderItems.length === 0) {
//             setOrders([]);
//           } else {
//             setOrders([
//               {
//                 id: "local",
//                 items: localOrderItems,
//                 totalAmount: localOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
//                 status: "Pending",
//                 createdAt: new Date().toISOString(),
//               },
//             ]);
//           }
//         } else {
//           const fetchedOrders = [];
//           querySnapshot.forEach((doc) => {
//             fetchedOrders.push({ id: doc.id, ...doc.data() });
//           });
//           setOrders(fetchedOrders);
//         }
//       } catch (error) {
//         console.error("Error fetching orders:", error);
//       }
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, [router]);

//   if (loading) {
//     return <div className="p-6 text-center">Loading orders...</div>;
//   }

//   if (!orders.length) {
//     return (
//       <div className="p-6 text-center text-gray-600">
//         <p>No orders currently exist.</p>
//         <Link href="/" className="text-blue-600 underline mt-2 inline-block">
//           Continue Shopping
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-3xl mx-auto min-h-screen">
//       <h1 className="text-2xl font-semibold mb-6">Your Orders</h1>
//       {orders.map((order) => (
//         <div key={order.id} className="border rounded-md p-4 mb-6 shadow-sm">
//           <div className="flex justify-between items-center mb-2">
//             <span className="font-semibold">Order ID:</span>
//             <span className="text-sm text-gray-600">{order.id}</span>
//           </div>
//           <div className="mb-2">
//             <span className="font-semibold">Status:</span>{" "}
//             <span
//               className={`font-semibold ${
//                 order.status === "Confirmed"
//                   ? "text-green-600"
//                   : order.status === "Shipped"
//                   ? "text-blue-600"
//                   : "text-yellow-600"
//               }`}
//             >
//               {order.status}
//             </span>
//           </div>
//           <div className="mb-4">
//             <span className="font-semibold">Placed on:</span>{" "}
//             {new Date(order.createdAt).toLocaleString()}
//           </div>

//           <div>
//             <h3 className="font-semibold mb-1">Items:</h3>
//             {order.items.map((item) => (
//               <div
//                 key={item.id || item.name}
//                 className="flex justify-between border-b py-1"
//               >
//                 <span>{item.name}</span>
//                 <span>
//                   {item.quantity} × UGX {item.price.toLocaleString()}
//                 </span>
//               </div>
//             ))}
//           </div>

//           <div className="mt-3 font-semibold text-right">
//             Total: UGX {order.totalAmount.toLocaleString()}
//           </div>

//           {order.address && (
//             <div className="mt-3 border-t pt-3 text-sm text-gray-700">
//               <h4 className="font-semibold">Delivery Address:</h4>
//               <p>{order.address.fullName}</p>
//               <p>{order.address.area}</p>
//               <p>
//                 {order.address.city}, {order.address.state}
//               </p>
//               <p>Phone: {order.address.phoneNumber}</p>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ShipmentsPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      try {
        // Firestore query: userId filter + order by createdAt desc
        const ordersRef = collection(db, "orders");
        const q = query(
          ordersRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // No orders in Firestore, fallback to localStorage check
          const localOrderItems = JSON.parse(localStorage.getItem("orderItems") || "[]");
          if (localOrderItems.length === 0) {
            setOrders([]);
          } else {
            setOrders([
              {
                id: "local",
                items: localOrderItems,
                totalAmount: localOrderItems.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                ),
                status: "Pending",
                createdAt: new Date().toISOString(),
              },
            ]);
          }
        } else {
          const fetchedOrders = [];
          querySnapshot.forEach((doc) => {
            fetchedOrders.push({ id: doc.id, ...doc.data() });
          });
          setOrders(fetchedOrders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="p-6 text-center">Loading orders...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p>No orders currently exist.</p>
        <Link href="/" className="text-blue-600 underline mt-2 inline-block">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Your Orders</h1>
      {orders.map((order) => (
        <div key={order.id} className="border rounded-md p-4 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Order ID:</span>
            <span className="text-sm text-gray-600">{order.id}</span>
          </div>
          <div className="mb-2">
            <span className="font-semibold">Status:</span>{" "}
            <span
              className={`font-semibold ${
                order.status === "Confirmed"
                  ? "text-green-600"
                  : order.status === "Shipped"
                  ? "text-blue-600"
                  : "text-yellow-600"
              }`}
            >
              {order.status || "Pending"}
            </span>
          </div>
          <div className="mb-4">
            <span className="font-semibold">Placed on:</span>{" "}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : "Unknown"}
          </div>

          <div>
            <h3 className="font-semibold mb-1">Items:</h3>
            {order.items.map((item) => (
              <div
                key={item.id || item.name}
                className="flex justify-between border-b py-1"
              >
                <span>{item.name}</span>
                <span>
                  {item.quantity} × UGX {item.price.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 font-semibold text-right">
            Total: UGX {order.totalAmount.toLocaleString()}
          </div>

          {order.address && (
            <div className="mt-3 border-t pt-3 text-sm text-gray-700">
              <h4 className="font-semibold">Delivery Address:</h4>
              <p>{order.address.fullName}</p>
              <p>{order.address.area}</p>
              <p>
                {order.address.city}, {order.address.state}
              </p>
              <p>Phone: {order.address.phoneNumber}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
