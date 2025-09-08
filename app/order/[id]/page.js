"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const snap = await getDoc(doc(db, "orders", id));
        if (snap.exists()) {
          setOrder({ id: snap.id, ...snap.data() });
        } else {
          setError("Order not found");
        }
      } catch (e) {
        setError("Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!order) return null;

  const total = order.items?.reduce((sum, it) => {
    const price = it.discount > 0 ? it.price * (1 - it.discount / 100) : it.price;
    return sum + price * (it.quantity || 1);
  }, 0) || 0;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline mb-4">← Back</button>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold">Order #{order.id.slice(0,6).toUpperCase()}</h1>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {order.status || 'pending'}
          </span>
        </div>
        {order.paymentMethod && (
          <p className="text-xs text-gray-600 mb-2">Payment: {order.paymentMethod.toUpperCase()} ({order.paymentStatus || 'pending'})</p>
        )}
        <p className="text-xs text-gray-600 mb-4">Placed: {new Date(order.createdAt).toLocaleString()}</p>

        <h2 className="text-sm font-semibold mb-2">Items</h2>
        <ul className="divide-y divide-gray-200 mb-4">
          {order.items?.map((it) => (
            <li key={it.id} className="py-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{it.name}</p>
                <p className="text-xs text-gray-600">SKU: {it.sku}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-900">UGX {((it.discount>0? it.price*(1-it.discount/100):it.price)*(it.quantity||1)).toLocaleString()}</p>
                <p className="text-xs text-gray-500">Qty: {it.quantity || 1}</p>
              </div>
            </li>
          ))}
        </ul>

        <h2 className="text-sm font-semibold mb-2">Delivery Address</h2>
        <div className="text-sm text-gray-700 mb-4">
          {order.address?.customerType === 'company' ? (
            <>
              <p className="text-gray-900">{order.address?.organizationName}</p>
              <p>Contact: {order.address?.contactPerson}</p>
              {order.address?.designation && <p>Designation: {order.address?.designation}</p>}
              {order.address?.email && <p>Email: {order.address?.email}</p>}
            </>
          ) : (
            <p className="text-gray-900">{order.address?.fullName}</p>
          )}
          <p>{order.address?.area}</p>
          <p>{order.address?.city}</p>
          <p>{order.address?.phoneNumber}</p>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-3">
          <span className="text-sm font-medium">Total</span>
          <span className="text-base font-semibold text-green-700">UGX {total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}


