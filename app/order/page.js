"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, addDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ChevronUp, ChevronDown, ArrowLeft } from "lucide-react";

export default function OrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [address, setAddress] = useState({
    fullName: "",
    area: "",
    city: "",
    state: "",
    phoneNumber: "",
  });
  const [editing, setEditing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState("orders"); // "orders" or "shipments"
  const [loadingShipments, setLoadingShipments] = useState(false);

  // Load user info and orders from localStorage + Firestore user address
  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.uid);

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userAddress = userSnap.exists() ? userSnap.data().address : null;

      const stored = JSON.parse(localStorage.getItem("orderItems") || "[]");
      if (!stored.length) {
        setOrders([]);
      } else {
        const order = {
          id: "order-local",
          items: stored,
          address: userAddress || address,
          amount: stored.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
          date: new Date().toISOString(),
        };
        setOrders([order]);
        setAddress(order.address);
      }
    });
  }, []);

  // Load shipments (orders from Firestore) when shipments tab is active
  useEffect(() => {
    if (activeTab === "shipments" && userId) {
      setLoadingShipments(true);
      const fetchShipments = async () => {
        try {
          const ordersRef = collection(db, "orders");
          const q = query(
            ordersRef,
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          const fetchedShipments = [];
          querySnapshot.forEach((doc) => {
            fetchedShipments.push({ id: doc.id, ...doc.data() });
          });
          setShipments(fetchedShipments);
        } catch (error) {
          console.error("Error loading shipments:", error);
          setShipments([]);
        } finally {
          setLoadingShipments(false);
        }
      };
      fetchShipments();
    }
  }, [activeTab, userId]);

  // Order handlers (same as your code)
  const updateQuantity = (productId, delta) => {
    const updatedOrders = orders.map((order) => {
      const updatedItems = order.items.map((item) => {
        if (item.id === productId) {
          return { ...item, quantity: Math.max(1, item.quantity + delta) };
        }
        return item;
      });
      return {
        ...order,
        items: updatedItems,
        amount: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      };
    });
    setOrders(updatedOrders);
    localStorage.setItem("orderItems", JSON.stringify(updatedOrders[0].items));
  };

  const removeItem = (productId) => {
    const updatedItems = orders[0].items.filter((item) => item.id !== productId);
    const updatedOrder = {
      ...orders[0],
      items: updatedItems,
      amount: updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    };
    setOrders([updatedOrder]);
    localStorage.setItem("orderItems", JSON.stringify(updatedItems));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const saveAddress = () => {
    localStorage.setItem("userAddress", JSON.stringify(address));
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

      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.exists() ? userSnap.data() : {};

      const order = orders[0];

      // Add fallback if address was not set manually
      const finalAddress = {
        fullName: address.fullName || userData.fullName || "N/A",
        area: address.area || "N/A",
        city: address.city || "N/A",
        state: address.state || "N/A",
        phoneNumber: address.phoneNumber || user.phoneNumber || "N/A",
      };

      const orderItems = order.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        sop: item.sop || "", // Include sop if present
        category: item.category || "",
        imageUrl: item.imageUrl || "",
        quantity: item.quantity || 1,
      }));

      const orderData = {
        userId: user.uid,
        userEmail: user.email || "N/A",
        userName: user.displayName || userData.fullName || "N/A",
        userPhone: user.phoneNumber || userData.phoneNumber || "N/A",
        address: finalAddress,
        items: orderItems,
        totalAmount: order.amount,
        status: "Pending",
        paymentMethod: "Cash on Delivery",
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "orders"), orderData);

      localStorage.removeItem("orderItems");
      router.push("/shipments");

    } catch (err) {
      console.error("Error placing order:", err);
      alert("Failed to place order. Please try again.");
    }
  };



  // Render tabs and content
  return (
    <div className="flex flex-col px-6 md:px-16 lg:px-32 py-6 min-h-screen">
      <div className="mb-4">
        <Link href="/" className="flex items-center text-blue-600 hover:underline text-sm">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-6 border-b">
        <button
          onClick={() => setActiveTab("orders")}
          className={`pb-2 font-semibold ${
            activeTab === "orders"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Order Summary
        </button>
        <button
          onClick={() => setActiveTab("shipments")}
          className={`pb-2 font-semibold ${
            activeTab === "shipments"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Shipments Summary
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "orders" && (
        <>
          {!orders.length ? (
            <div className="text-center text-gray-500">
              <p>No orders currently exist.</p>
              <Link href="/" className="text-blue-600 underline text-sm mt-2 inline-block">
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              {orders[0].items.map((item) => (
                <div key={item.id} className="flex gap-4 items-center mb-4">
                  <Image
                    src={item.imageUrl || "/assets/box_icon.png"}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      UGX {item.price.toLocaleString()} × {item.quantity} = UGX{" "}
                      {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 text-sm hover:underline mt-1"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex flex-col items-center">
                    <button onClick={() => updateQuantity(item.id, 1)}>
                      <ChevronUp />
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, -1)}>
                      <ChevronDown />
                    </button>
                  </div>
                </div>
              ))}

              <div className="text-right font-semibold mt-4">
                Total: UGX {orders[0].amount.toLocaleString()}
              </div>

              <div className="border-t pt-6 mt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Delivery Address</h3>
                  {!editing && (
                    <button
                      className="text-blue-600 text-sm font-medium"
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    {["fullName", "area", "city", "state", "phoneNumber"].map((field) => (
                      <input
                        key={field}
                        name={field}
                        value={address[field]}
                        onChange={handleAddressChange}
                        placeholder={field.replace(/([A-Z])/g, " $1")}
                        className="border border-gray-300 px-3 py-2 rounded-md text-sm"
                      />
                    ))}
                    <div className="col-span-full flex justify-end gap-3">
                      <button
                        onClick={() => setEditing(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:underline"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveAddress}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-700 space-y-1 mt-3">
                    <p>{address.fullName}</p>
                    <p>{address.area}</p>
                    <p>
                      {address.city}, {address.state}
                    </p>
                    <p>{address.phoneNumber}</p>
                  </div>
                )}
              </div>

              <button
                onClick={placeOrder}
                className="mt-8 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 w-full sm:w-auto"
              >
                Confirm & Place Order
              </button>
            </>
          )}
        </>
      )}

      {activeTab === "shipments" && (
        <div>
          {loadingShipments ? (
            <p className="text-center text-gray-500">Loading shipments...</p>
          ) : shipments.length === 0 ? (
            <div className="text-center text-gray-500">
              <p>No shipments found.</p>
              <Link href="/" className="text-blue-600 underline text-sm mt-2 inline-block">
                Continue Shopping
              </Link>
            </div>
          ) : (
            shipments.map((shipment) => (
              <div key={shipment.id} className="border rounded-md p-4 mb-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Order ID:</span>
                  <span className="text-sm text-gray-600">{shipment.id}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`font-semibold ${
                      shipment.status === "Confirmed"
                        ? "text-green-600"
                        : shipment.status === "Shipped"
                        ? "text-blue-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {shipment.status || "Pending"}
                  </span>
                </div>
                <div className="mb-4">
                  <span className="font-semibold">Placed on:</span>{" "}
                  {shipment.createdAt
                    ? new Date(shipment.createdAt).toLocaleString()
                    : "Unknown"}
                </div>

                <div>
                  <h3 className="font-semibold mb-1">Items:</h3>
                  {shipment.items.map((item) => (
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
                  Total: UGX {shipment.totalAmount.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
