"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ChevronUp, ChevronDown, ArrowLeft } from "lucide-react";

const MyOrders = () => {
  const currency = "UGX ";
  const [orders, setOrders] = useState([]);
  const [address, setAddress] = useState({
    fullName: "",
    area: "",
    city: "",
    state: "",
    phoneNumber: "",
  });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("orderItems") || "[]");
    const storedAddress = JSON.parse(localStorage.getItem("userAddress") || "null");

    const order = {
      id: "order-local",
      items: stored.map((p) => ({
        id: p.id,
        name: p.name,
        imageUrl: p.imageUrl,
        price: parseFloat(p.price),
        quantity: p.quantity || 1,
      })),
      address: storedAddress || {
        fullName: "John Doe",
        area: "Default Area",
        city: "Default City",
        state: "Default State",
        phoneNumber: "000000000",
      },
      amount: stored.reduce(
        (sum, item) => sum + parseFloat(item.price || 0) * (item.quantity || 1),
        0
      ),
      date: new Date().toISOString(),
    };

    setOrders([order]);
    setAddress(order.address);
  }, []);

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

  return (
    <>
      <div className="flex flex-col px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <div className="mb-4">
          <Link href="/" className="flex items-center text-blue-600 hover:underline text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Link>
        </div>

        <h2 className="text-lg font-medium mb-4">My Orders</h2>

        {orders.map((order, index) => (
          <div key={index} className="space-y-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 items-center">
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
                    UGX {item.price.toLocaleString()} × {item.quantity} = {currency}
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

            <div className="text-right font-semibold">
              Total: {currency}
              {order.amount.toLocaleString()}
            </div>

            <div className="border-t pt-6 space-y-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="text-sm text-gray-700 space-y-1">
                  <p>{address.fullName}</p>
                  <p>{address.area}</p>
                  <p>
                    {address.city}, {address.state}
                  </p>
                  <p>{address.phoneNumber}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
