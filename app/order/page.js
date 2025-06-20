"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import ContactButtons from "@/components/ContactButtons";

const regionsData = [
  {
    region: "Kampala",
    area: [
      "Bunga",
      "Kampala Central Division",
      "Kampala Nakawa Division",
      "Kasubi",
      "Kireka",
      "Kitintale",
      "Nakasero",
      "Wandegeya",
    ],
  },
  {
    region: "Wakiso",
    area: [
      "Nansana",
      "Kira Municipality",
      "Kasangati",
      "Kajjansi",
      "Busukuma",
      "Ssabagabo",
      "Kyengera",
      "Kajjansi Town Council",
    ],
  },
];

const mapCartItemsToOrderItems = (cartItems) =>
  cartItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    sop: item.sop || "",
    category: item.category || "",
    imageUrl: item.imageUrl || "",
    quantity: item.quantity || 1,
  }));

const calculateTotal = (items) =>
  items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

export default function OrderPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [address, setAddress] = useState({
    fullName: "",
    area: "",
    city: "",
    phoneNumber: "",
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/login");
      setUserId(user.uid);

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userAddress = userSnap.exists() ? userSnap.data().address || {} : {};
      setAddress(userAddress);

      const cartRef = collection(db, "carts", user.uid, "items");
      const cartSnap = await getDocs(cartRef);
      const items = cartSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCartItems(items);

      const order = {
        id: "order-firebase",
        items,
        address: userAddress,
        amount: calculateTotal(items),
        date: new Date().toISOString(),
      };
      setOrders(items.length ? [order] : []);
    });
    return () => unsubscribe();
  }, [router]);

  const updateQuantity = async (productId, delta) => {
    const item = cartItems.find((item) => item.id === productId);
    if (!item) return;
    const newQty = Math.max(1, (item.quantity || 1) + delta);
    const ref = doc(db, "carts", userId, "items", productId);
    await updateDoc(ref, { quantity: newQty });
    const updatedCart = cartItems.map((i) =>
      i.id === productId ? { ...i, quantity: newQty } : i
    );
    setCartItems(updatedCart);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === "order-firebase"
          ? { ...o, items: updatedCart, amount: calculateTotal(updatedCart) }
          : o
      )
    );
  };

  const removeItem = async (productId) => {
    await deleteDoc(doc(db, "carts", userId, "items", productId));
    const updatedCart = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedCart);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === "order-firebase"
          ? { ...o, items: updatedCart, amount: calculateTotal(updatedCart) }
          : o
      )
    );
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const saveAddress = () => {
    setOrders((prev) => prev.map((o) => ({ ...o, address })));
    setEditing(false);
  };

  const placeOrder = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user || !cartItems.length) return router.push("/login");

    const userSnap = await getDoc(doc(db, "users", user.uid));
    const userData = userSnap.exists() ? userSnap.data() : {};
    const finalAddress = {
      fullName: address.fullName || userData.fullName || "N/A",
      area: address.area || "N/A",
      city: address.city || "N/A",
      phoneNumber: address.phoneNumber || user.phoneNumber || "N/A",
    };

    const orderData = {
      userId: user.uid,
      userEmail: user.email || "N/A",
      userName: user.displayName || userData.fullName || "N/A",
      userPhone: user.phoneNumber || userData.phoneNumber || "N/A",
      address: finalAddress,
      items: mapCartItemsToOrderItems(cartItems),
      totalAmount: calculateTotal(cartItems),
      status: "Pending",
      paymentMethod: "Cash on Delivery",
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "orders"), orderData);
    const cartRef = collection(db, "carts", user.uid, "items");
    const snap = await getDocs(cartRef);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
    setCartItems([]);
    setOrders([]);
    router.push("/shipments");
  };

  const selectedRegion = regionsData.find((r) => r.region === address.city);

  return (
    <div className="flex flex-col px-0 py-6 min-h-screen">
      <div className="mb-1 ml-2 mr-2">
        <Link href="/" className="text-blue-600 hover:underline">
          <span className="px-4 py-1 rounded border border-blue-600 text-blue-600 font-semibold">
            Back to Shop
          </span>
        </Link>
      </div>

      {orders.length === 0 ? (
        <p>You have no orders. Please add items to your cart.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="mb-16">
            <div className="bg-white p-4  shadow-sm">
              <h1 className="text-lg font-semibold mb-1">Order Summary</h1>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center mb-3 border-b pb-3">
                    <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded" />
                    <div className="ml-4 flex-1">
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-sm text-gray-600">SOP: {item.sop}</p>
                      <p className="text-sm text-gray-700">Price: UGX {item.price.toLocaleString()}</p>
                      <div className="flex items-center mt-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 bg-gray-200 rounded-l">-</button>
                        <span className="px-3 py-1 border-t border-b">{item.quantity || 1}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 bg-gray-200 rounded-r">+</button>
                        <button onClick={() => removeItem(item.id)} className="ml-4 px-2 py-1 bg-red-400 text-white rounded">Remove</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-green-500 text-xl mt-4">Total: UGX {order.amount.toLocaleString()}</p>
            </div>

            <div className="mt-4 p-4 bg-white rounded shadow-sm">
              <h2 className="text-lg font-semibold mb-2">Shipping Address</h2>
              {!editing ? (
                <div>
                  <p><strong>Full Name:</strong> {address.fullName || "N/A"}</p>
                  <p><strong>Region:</strong> {address.city || "N/A"}</p>
                  <p><strong>Area:</strong> {address.area || "N/A"}</p>
                  <p><strong>Phone:</strong> {address.phoneNumber || "N/A"}</p>
                  <button onClick={() => setEditing(true)} className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded">Edit</button>
                </div>
              ) : (
                <div className="space-y-2">
                  <input name="fullName" value={address.fullName} onChange={handleAddressChange} placeholder="Full Name" className="w-full border p-2 rounded" />
                  <select name="city" value={address.city} onChange={(e) => { handleAddressChange(e); setAddress((prev) => ({ ...prev, city: e.target.value, area: "" })); }} className="w-full border p-2 rounded">
                    <option value="">Select Region</option>
                    {regionsData.map((r) => <option key={r.region} value={r.region}>{r.region}</option>)}
                  </select>
                  <select name="area" value={address.area} onChange={handleAddressChange} className="w-full border p-2 rounded" disabled={!address.city}>
                    <option value="">Select Area</option>
                    {selectedRegion?.area.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <input name="phoneNumber" value={address.phoneNumber} onChange={handleAddressChange} placeholder="Phone Number" className="w-full border p-2 rounded" />
                  <div className="flex gap-2 mt-2">
                    <button onClick={saveAddress} className="w-full bg-green-600 text-white py-2 rounded">Save</button>
                    <button onClick={() => setEditing(false)} className="w-full bg-gray-400 text-white py-2 rounded">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-4 mt-4 shadow-sm">
              <button onClick={placeOrder} className="w-full bg-blue-600 text-white px-6 py-3 rounded text-base font-semibold">🛒 Place Order</button>
            </div>

            <div className="bg-white p-4 mt-4 shadow-sm text-center">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <ContactButtons phoneNumber="+256700000000" />
            </div>
          </div>
        ))
      )}
    </div>
  );
}



// "use client";

// import { useEffect, useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { getAuth, onAuthStateChanged } from "firebase/auth";
// import {
//   doc,
//   getDoc,
//   addDoc,
//   collection,
//   query,
//   where,
//   getDocs,
//   orderBy,
//   updateDoc,
//   deleteDoc,
// } from "firebase/firestore";
// import { db } from "@/lib/firebase";
// import { ChevronUp, ChevronDown } from "lucide-react";
// import ContactButtons from "@/components/ContactButtons";


// // Your JSON data for regions and areas (cities and areas)
// const regionsData = [
//   {
//     region: "Kampala",
//     area: [
//       "Bunga",
//       "Kampala Central Division",
//       "Kampala Nakawa Division",
//       "Kasubi",
//       "Kireka",
//       "Kitintale",
//       "Nakasero",
//       "Wandegeya",
//     ],
//   },
//   {
//     region: "Wakiso",
//     area: [
//       "Nansana",
//       "Kira Municipality",
//       "Kasangati",
//       "Kajjansi",
//       "Busukuma",
//       "Ssabagabo",
//       "Kyengera",
//       "Kajjansi Town Council",
//     ],
//   },
// ];

// export default function OrderPage() {
//   const router = useRouter();
//   const [orders, setOrders] = useState([]);
//   const [shipments, setShipments] = useState([]);
//   const [delivered, setDelivered] = useState([]);
//   const [canceled, setCanceled] = useState([]);
//   const [address, setAddress] = useState({
//     fullName: "",
//     area: "",
//     city: "",
//     phoneNumber: "",
//   });
//   const [editing, setEditing] = useState(false);
//   const [userId, setUserId] = useState(null);
//   const [activeTab, setActiveTab] = useState("orders");
//   const [cartItems, setCartItems] = useState([]);

//   useEffect(() => {
//     const auth = getAuth();
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (!user) {
//         router.push("/login");
//         return;
//       }
//       setUserId(user.uid);

//       // Fetch user address
//       const userRef = doc(db, "users", user.uid);
//       const userSnap = await getDoc(userRef);
//       const userAddress = userSnap.exists() ? userSnap.data().address : null;
//       setAddress(userAddress || {});

//       // Fetch cart items
//       const cartCollectionRef = collection(db, "carts", user.uid, "items");
//       const cartSnapshot = await getDocs(cartCollectionRef);

//       if (cartSnapshot.empty) {
//         setCartItems([]);
//         setOrders([]);
//       } else {
//         const items = [];
//         cartSnapshot.forEach((doc) => {
//           items.push({ id: doc.id, ...doc.data() });
//         });

//         setCartItems(items);

//         const order = {
//           id: "order-firebase",
//           items,
//           address: userAddress || {},
//           amount: items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
//           date: new Date().toISOString(),
//         };
//         setOrders([order]);
//       }
//     });

//     return () => unsubscribe();
//   }, [router]);

//   useEffect(() => {
//     const fetchOrders = async () => {
//       if (!userId) return;
//       const ordersRef = collection(db, "orders");
//       const q = query(
//         ordersRef,
//         where("userId", "==", userId),
//         orderBy("createdAt", "desc")
//       );
//       const snapshot = await getDocs(q);
//       const data = [];
//       snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));

//       setShipments(data.filter((o) => o.status !== "Delivered" && o.status !== "Canceled"));
//       setDelivered(data.filter((o) => o.status === "Delivered"));
//       setCanceled(data.filter((o) => o.status === "Canceled"));
//     };
//     fetchOrders();
//   }, [userId]);

//   const updateQuantity = async (productId, delta) => {
//     const item = cartItems.find((item) => item.id === productId);
//     if (!item) return;

//     const newQuantity = Math.max(1, (item.quantity || 1) + delta);
//     const itemRef = doc(db, "carts", userId, "items", productId);
//     try {
//       await updateDoc(itemRef, { quantity: newQuantity });

//       const updatedCart = cartItems.map((i) =>
//         i.id === productId ? { ...i, quantity: newQuantity } : i
//       );
//       setCartItems(updatedCart);

//       const updatedOrders = orders.map((order) => {
//         if (order.id !== "order-firebase") return order;
//         const updatedItems = updatedCart;
//         return {
//           ...order,
//           items: updatedItems,
//           amount: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
//         };
//       });
//       setOrders(updatedOrders);
//     } catch (err) {
//       console.error("Error updating quantity:", err);
//       alert("Failed to update quantity.");
//     }
//   };

//   const removeItem = async (productId) => {
//     const itemRef = doc(db, "carts", userId, "items", productId);
//     try {
//       await deleteDoc(itemRef);

//       const updatedCart = cartItems.filter((item) => item.id !== productId);
//       setCartItems(updatedCart);

//       const updatedOrders = orders.map((order) => {
//         if (order.id !== "order-firebase") return order;
//         const updatedItems = updatedCart;
//         return {
//           ...order,
//           items: updatedItems,
//           amount: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
//         };
//       });
//       setOrders(updatedOrders);
//     } catch (err) {
//       console.error("Error removing item:", err);
//       alert("Failed to remove item.");
//     }
//   };

//   const handleAddressChange = (e) => {
//     const { name, value } = e.target;
//     setAddress((prev) => ({ ...prev, [name]: value }));
//   };

//   const saveAddress = () => {
//     setOrders((prevOrders) => prevOrders.map((o) => ({ ...o, address })));
//     setEditing(false);
//   };

//   const placeOrder = async () => {
//     try {
//       const auth = getAuth();
//       const user = auth.currentUser;

//       if (!user) {
//         alert("You must be logged in to place an order.");
//         router.push("/login");
//         return;
//       }

//       if (!cartItems.length) {
//         alert("Your cart is empty.");
//         return;
//       }

//       const userSnap = await getDoc(doc(db, "users", user.uid));
//       const userData = userSnap.exists() ? userSnap.data() : {};

//       const finalAddress = {
//         fullName: address.fullName || userData.fullName || "N/A",
//         area: address.area || "N/A",
//         city: address.city || "N/A",
//         phoneNumber: address.phoneNumber || user.phoneNumber || "N/A",
//       };

//       const orderItems = cartItems.map((item) => ({
//         id: item.id,
//         name: item.name,
//         price: item.price,
//         sop: item.sop || "",
//         category: item.category || "",
//         imageUrl: item.imageUrl || "",
//         quantity: item.quantity || 1,
//       }));

//       const totalAmount = orderItems.reduce(
//         (sum, item) => sum + item.price * item.quantity,
//         0
//       );

//       const orderData = {
//         userId: user.uid,
//         userEmail: user.email || "N/A",
//         userName: user.displayName || userData.fullName || "N/A",
//         userPhone: user.phoneNumber || userData.phoneNumber || "N/A",
//         address: finalAddress,
//         items: orderItems,
//         totalAmount,
//         status: "Pending",
//         paymentMethod: "Cash on Delivery",
//         createdAt: new Date().toISOString(),
//       };

//       await addDoc(collection(db, "orders"), orderData);

//       // Clear the cart
//       const cartCollectionRef = collection(db, "carts", user.uid, "items");
//       const cartSnapshot = await getDocs(cartCollectionRef);
//       const batchDeletes = [];
//       cartSnapshot.forEach((docSnap) => {
//         batchDeletes.push(deleteDoc(doc(db, "carts", user.uid, "items", docSnap.id)));
//       });
//       await Promise.all(batchDeletes);

//       setCartItems([]);
//       setOrders([]);
//       router.push("/shipments");
//     } catch (err) {
//       console.error("Error placing order:", err);
//       alert("Failed to place order. Please try again.");
//     }
//   };

//   // Find the selected region data object by city name (for area dropdown)
//   const selectedRegion = regionsData.find((r) => r.region === address.city);

//   return (

//     <div className="flex flex-col px-0 py-6 min-h-screen">

//       <div className="mb-1 ml-2 mr-2">
//         <Link href="/" className="flex items-center text-blue-600 hover:underline">
//           <span className="mb-2 top-[130px] right-2 px-4 py-1 rounded border border-blue-600 text-blue-600 cursor-pointer font-semibold">
//             Back to Shop
//           </span>
//         </Link>
//       </div>

//       {orders.length === 0 ? (
//         <p>You have no orders. Please add items to your cart.</p>
//       ) : (
//         orders.map((order) => (
//           <div key={order.id} className="mb-16">
//             {/* Card 5: Contact Buttons */}
//             <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm mb-2 mt-1">
//             <h1 className="text-[20px] font-semibold mb-1">Order Summary</h1>
//             <h3 className="text-xl font-semibold mb-4">Items:</h3>

//             <ul>
//               {order.items.map((item) => (
//                 <li key={item.id} className="flex items-center mb-3 border-b pb-3">
//                   <Image
//                     src={item.imageUrl}
//                     alt={item.name}
//                     width={80}
//                     height={80}
//                     className="rounded"
//                   />
//                   <div className="ml-4 flex-1">
//                     <p className="font-semibold">{item.name}</p>
//                     <p className="text-sm text-gray-600">{item.category}</p>
//                     <p className="text-sm text-gray-600">SOP: {item.sop}</p>
//                     <p className="text-sm text-gray-700">
//                       Price: UGX {item.price.toLocaleString()}
//                     </p>
//                     <div className="flex items-center mt-1">
//                       <button
//                         onClick={() => updateQuantity(item.id, -1)}
//                         className="px-2 py-1 bg-gray-200 rounded-l hover:bg-gray-300"
//                       >
//                         -
//                       </button>
//                       <span className="px-3 py-1 border-t border-b">
//                         {item.quantity || 1}
//                       </span>
//                       <button
//                         onClick={() => updateQuantity(item.id, 1)}
//                         className="px-2 py-1 bg-gray-200 rounded-r hover:bg-gray-300"
//                       >
//                         +
//                       </button>
//                       <button
//                         onClick={() => removeItem(item.id)}
//                         className="ml-4 px-2 py-1 bg-red-400 text-white rounded hover:bg-red-500"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 </li>
//               ))}
//             </ul>

//             <p className="text-[20px] font-semibold text-green-500 mt-6 mb-4">
//               Total Amount: UGX {order.amount.toLocaleString()}
//             </p>
//             </div>

//             <div className="mt-2 p-4 rounded shadow-sm shadow-gray-100 bg-white">
//               <h2 className="text-xl font-semibold mb-4">Shipping/Delivery Address</h2>

//               {!editing ? (
//                 <div>
//                   <p>
//                     <strong>Full Name:</strong> {address.fullName || "N/A"}
//                   </p>
//                   <p>
//                     <strong>Region:</strong> {address.city || "N/A"}
//                   </p>
//                   <p>
//                     <strong>Area:</strong> {address.area || "N/A"}
//                   </p>
//                   <p>
//                     <strong>Phone Number:</strong> {address.phoneNumber || "N/A"}
//                   </p>
//                   <button
//                     onClick={() => setEditing(true)}
//                     className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//                   >
//                     Edit Address
//                   </button>
//                 </div>
//               ) : (
//                 <div className="space-y-3">
//                   <div>
//                     <label className="block font-semibold">Name</label>
//                     <input
//                       type="text"
//                       name="fullName"
//                       value={address.fullName}
//                       onChange={handleAddressChange}
//                       className="border p-2 w-full rounded"
//                     />
//                   </div>

//                   <div>
//                     <label className="block font-semibold">Region</label>
//                     <select
//                       name="city"
//                       value={address.city}
//                       onChange={(e) => {
//                         handleAddressChange(e);
//                         setAddress((prev) => ({
//                           ...prev,
//                           city: e.target.value,
//                           area: "", // Reset area when region changes
//                         }));
//                       }}
//                       className="border p-2 w-full rounded"
//                     >
//                       <option value="">Select Region</option>
//                       {regionsData.map((reg) => (
//                         <option key={reg.region} value={reg.region}>
//                           {reg.region}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block font-semibold">Area</label>
//                     <select
//                       name="area"
//                       value={address.area}
//                       onChange={handleAddressChange}
//                       className="border p-2 w-full rounded"
//                       disabled={!address.city}
//                     >
//                       <option value="">Select Area</option>
//                       {selectedRegion &&
//                         selectedRegion.area.map((dist) => (
//                           <option key={dist} value={dist}>
//                             {dist}
//                           </option>
//                         ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block font-semibold">Phone Number</label>
//                     <input
//                       type="tel"
//                       name="phoneNumber"
//                       value={address.phoneNumber}
//                       onChange={handleAddressChange}
//                       className="border p-2 w-full rounded"
//                     />
//                   </div>

//                   <div className="space-y-3 mt-3">
//                     <button
//                       onClick={saveAddress}
//                       className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
//                     >
//                       Save
//                     </button>
//                     <button
//                       onClick={() => setEditing(false)}
//                       className="w-full px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </div>


//             {/* Place Order Buttons */}
//             <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm mb-2 mt-2">
//               <button
//                 onClick={placeOrder}
//                 className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md text-base font-semibold shadow-sm transition-all duration-200"
//               >
//                 🛒 Place Order
//               </button>
//             </div>




//             {/*  Contact Buttons */}
//             <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm mb-1">
//               <h3 className="text-base font-semibold text-gray-800 mb-2 text-center">Need Help?</h3>
//               <ContactButtons phoneNumber="+256700000000" />
//             </div>

//           </div>
//         ))
//       )}
//     </div>
//   );
// }
