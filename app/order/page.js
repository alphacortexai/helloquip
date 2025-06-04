// 



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
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChevronUp, ChevronDown, ArrowLeft } from "lucide-react";

export default function OrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [delivered, setDelivered] = useState([]);
  const [canceled, setCanceled] = useState([]);
  const [address, setAddress] = useState({
    fullName: "",
    area: "",
    city: "",
    phoneNumber: "",
  });
  const [editing, setEditing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");

  // New: Cart items stored here
  const [cartItems, setCartItems] = useState([]);

  // Fetch user, cart items, and orders on load
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.uid);

      // Fetch user address
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userAddress = userSnap.exists() ? userSnap.data().address : null;
      setAddress(userAddress || {});

      // Fetch cart items from Firestore under `carts/{userId}/items`
      const cartCollectionRef = collection(db, "carts", user.uid, "items");
      const cartSnapshot = await getDocs(cartCollectionRef);

      if (cartSnapshot.empty) {
        setCartItems([]);
        setOrders([]);
      } else {
        const items = [];
        cartSnapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() });
        });

        setCartItems(items);

        const order = {
          id: "order-firebase",
          items,
          address: userAddress || {},
          amount: items.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
          date: new Date().toISOString(),
        };
        setOrders([order]);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch orders for tabs
  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));

      setShipments(data.filter((o) => o.status !== "Delivered" && o.status !== "Canceled"));
      setDelivered(data.filter((o) => o.status === "Delivered"));
      setCanceled(data.filter((o) => o.status === "Canceled"));
    };
    fetchOrders();
  }, [userId]);

  // Update quantity in Firestore cart and local state
  const updateQuantity = async (productId, delta) => {
    const item = cartItems.find((item) => item.id === productId);
    if (!item) return;

    const newQuantity = Math.max(1, (item.quantity || 1) + delta);
    const itemRef = doc(db, "carts", userId, "items", productId);
    try {
      await updateDoc(itemRef, { quantity: newQuantity });

      const updatedCart = cartItems.map((i) =>
        i.id === productId ? { ...i, quantity: newQuantity } : i
      );
      setCartItems(updatedCart);

      const updatedOrders = orders.map((order) => {
        if (order.id !== "order-firebase") return order;
        const updatedItems = updatedCart;
        return {
          ...order,
          items: updatedItems,
          amount: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        };
      });
      setOrders(updatedOrders);
    } catch (err) {
      console.error("Error updating quantity:", err);
      alert("Failed to update quantity.");
    }
  };

  // Remove item from Firestore cart and local state
  const removeItem = async (productId) => {
    const itemRef = doc(db, "carts", userId, "items", productId);
    try {
      await deleteDoc(itemRef);

      const updatedCart = cartItems.filter((item) => item.id !== productId);
      setCartItems(updatedCart);

      const updatedOrders = orders.map((order) => {
        if (order.id !== "order-firebase") return order;
        const updatedItems = updatedCart;
        return {
          ...order,
          items: updatedItems,
          amount: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        };
      });
      setOrders(updatedOrders);
    } catch (err) {
      console.error("Error removing item:", err);
      alert("Failed to remove item.");
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const saveAddress = () => {
    // You may want to update this address in Firestore user doc as well
    setOrders((prevOrders) => prevOrders.map((o) => ({ ...o, address })));
    setEditing(false);
  };

  const placeOrder = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("You must be logged in to place an order.");
        router.push("/login");
        return;
      }

      if (!cartItems.length) {
        alert("Your cart is empty.");
        return;
      }

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.exists() ? userSnap.data() : {};

      const finalAddress = {
        fullName: address.fullName || userData.fullName || "N/A",
        area: address.area || "N/A",
        city: address.city || "N/A",
        phoneNumber: address.phoneNumber || user.phoneNumber || "N/A",
      };

      const orderItems = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        sop: item.sop || "",
        category: item.category || "",
        imageUrl: item.imageUrl || "",
        quantity: item.quantity || 1,
      }));

      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const orderData = {
        userId: user.uid,
        userEmail: user.email || "N/A",
        userName: user.displayName || userData.fullName || "N/A",
        userPhone: user.phoneNumber || userData.phoneNumber || "N/A",
        address: finalAddress,
        items: orderItems,
        totalAmount,
        status: "Pending",
        paymentMethod: "Cash on Delivery",
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "orders"), orderData);

      // Clear the cart from Firestore after placing order
      const cartCollectionRef = collection(db, "carts", user.uid, "items");
      const cartSnapshot = await getDocs(cartCollectionRef);
      const batchDeletes = [];
      cartSnapshot.forEach((docSnap) => {
        batchDeletes.push(deleteDoc(doc(db, "carts", user.uid, "items", docSnap.id)));
      });
      await Promise.all(batchDeletes);

      setCartItems([]);
      setOrders([]);
      router.push("/shipments");
    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    }
  };

  const renderOrderList = (list, type) => {
    if (!list.length) {
      return (
        <div className="text-center text-gray-500">
          <p>No {type} found.</p>
          <Link href="/" className="text-blue-600 underline text-sm mt-2 inline-block">
            Continue Shopping
          </Link>
        </div>
      );
    }

    return list.map((order) => (
      <div key={order.id} className="border rounded-md p-4 mb-4 shadow-sm">
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
                : order.status === "Delivered"
                ? "text-purple-600"
                : order.status === "Canceled"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {order.status}
          </span>
        </div>
        <div className="mb-4">
          <span className="font-semibold">Placed on:</span>{" "}
          {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Unknown"}
        </div>
        <div>
          <h3 className="font-semibold mb-1">Items:</h3>
          {order.items.map((item) => (
            <div key={item.id || item.name} className="flex justify-between border-b py-1">
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
      </div>
    ));
  };

  return (
    <div className="flex flex-col px-6 md:px-16 lg:px-32 py-6 min-h-screen">
      <div className="mb-4">
        <Link href="/" className="flex items-center text-blue-600 hover:underline">
          <span className="mb-4 top-[130px] right-2  px-4 py-2 bg-blue-100 text-blue-700 text-sm  shadow-sm hover:bg-blue-200 transition-all">Back to Home</span>
        </Link>




      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("orders")}
          className={`py-2 px-4 font-semibold ${
            activeTab === "orders" ? "border-b-2 border-blue-600" : "text-gray-600"
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab("shipments")}
          className={`py-2 px-4 font-semibold ${
            activeTab === "shipments" ? "border-b-2 border-blue-600" : "text-gray-600"
          }`}
        >
          Shipments
        </button>
        <button
          onClick={() => setActiveTab("delivered")}
          className={`py-2 px-4 font-semibold ${
            activeTab === "delivered" ? "border-b-2 border-blue-600" : "text-gray-600"
          }`}
        >
          Delivered
        </button>
        {/* <button
          onClick={() => setActiveTab("canceled")}
          className={`py-2 px-4 font-semibold ${
            activeTab === "canceled" ? "border-b-2 border-blue-600" : "text-gray-600"
          }`}
        >
          Canceled
        </button> */}
      </div>

{activeTab === "orders" && (
  <div className="flex flex-col max-h-[800px] overflow-y-auto">
    <h2 className="text-2xl font-bold mb-4">Your Selected Orders</h2>

    {cartItems.length === 0 ? (
      <div className="text-center text-gray-500 mb-4">
        You have no orders!
        <br />
        <Link href="/" className="text-blue-600 underline">
          Continue Shopping
        </Link>
      </div>
    ) : (
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex border rounded-md p-2 items-center justify-between"
          >
            <Image
              src={item.imageUrl || "/no-image.png"}
              alt={item.name}
              width={80}
              height={80}
              className="object-cover rounded"
            />
            <div className="flex-1 ml-4">
              <h2 className="font-semibold">{item.name}</h2>
              <p className="text-gray-600">UGX {item.price.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="px-2 py-1 border rounded-l hover:bg-gray-100"
                >
                  <ChevronDown size={16} />
                </button>
                <span className="px-4">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="px-2 py-1 border rounded-r hover:bg-gray-100"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-4 text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Total Amount */}
    {/* Total Amount */}
    {cartItems.length > 0 && (
      <div className="text-right font-semibold text-lg mb-4 text-green-600">
        Total: UGX{" "}
        {cartItems
          .reduce((total, item) => total + item.price * item.quantity, 0)
          .toLocaleString()}
      </div>
    )}


    {/* Address Card with Edit Functionality */}
    <div className="border rounded-md p-4 mb-6">
      <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
      {!editing ? (
        <div className="space-y-2">
          <p>
            <span className="font-semibold">Name:</span> {address.fullName || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Area:</span> {address.area || "N/A"}
          </p>
          <p>
            <span className="font-semibold">City:</span> {address.city || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Phone Number:</span> {address.phoneNumber || "N/A"}
          </p>
          <button
            onClick={() => setEditing(true)}
            className="mt-2 text-blue-600 hover:underline"
          >
            Edit Address
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={address.fullName}
            onChange={handleAddressChange}
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            name="area"
            placeholder="Area"
            value={address.area}
            onChange={handleAddressChange}
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            name="city"
            placeholder="City"
            value={address.city}
            onChange={handleAddressChange}
            className="border p-2 w-full rounded"
          />
          {/* <input
            type="text"
            name="state"
            placeholder="State"
            value={address.state}
            onChange={handleAddressChange}
            className="border p-2 w-full rounded"
          /> */}
          <input
            type="text"
            name="phoneNumber"
            placeholder="Phone Number"
            value={address.phoneNumber}
            onChange={handleAddressChange}
            className="border p-2 w-full rounded"
          />
          <div className="flex space-x-2 mt-2">
            <button
              onClick={saveAddress}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-300 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Place Order Button */}
    <button
      onClick={placeOrder}
      disabled={cartItems.length === 0}
      className={`w-full mb-18 py-3 text-white font-semibold rounded ${
        cartItems.length === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600"
      }`}
    >
      Place Order
    </button>
  </div>
)}



      {activeTab === "shipments" && (
        <div className="flex flex-col max-h-[800px] overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Shipments</h1>
          {renderOrderList(shipments, "shipments")}
        </div>
      )}

      {activeTab === "delivered" && (
        <div className="flex flex-col max-h-[800px] overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Delivered Orders</h1>
          {renderOrderList(delivered, "delivered orders")}
        </div>
      )}

      {activeTab === "canceled" && (
        <div className="flex flex-col max-h-[800px] overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4">Canceled Orders</h1>
          {renderOrderList(canceled, "canceled orders")}
        </div>
      )}
    </div>
  );
}
