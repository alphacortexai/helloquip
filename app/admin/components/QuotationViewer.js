"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function QuotationViewer() {
  const [quotations, setQuotations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const snapshot = await getDocs(collection(db, "quotations"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuotations(data);
      } catch (error) {
        console.error("Error fetching quotations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotations();
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Quotation List */}
      <div className="w-full md:w-1/3 bg-white border rounded-xl p-4 h-[500px] overflow-auto">
        <h2 className="text-lg font-bold mb-4">Quotations</h2>
        {loading ? (
          <p>Loading...</p>
        ) : quotations.length === 0 ? (
          <p>No quotations found.</p>
        ) : (
          quotations.map((q) => (
            <button
              key={q.id}
              onClick={() => setSelected(q)}
              className={`block w-full text-left p-3 rounded hover:bg-gray-100 ${
                selected?.id === q.id ? "bg-yellow-100" : ""
              }`}
            >
              <p className="font-semibold">Quote #{q.id.slice(-5)}</p>
              <p className="text-sm text-gray-500">
                {q.address?.fullName || "No Name"} —{" "}
                {new Date(q.createdAt).toLocaleDateString()}
              </p>
            </button>
          ))
        )}
      </div>

      {/* Quotation Details */}
      <div className="w-full md:w-2/3 bg-white border rounded-xl p-4 h-[500px] overflow-auto">
        {selected ? (
          <>
            <h3 className="text-lg font-bold mb-2">Quotation Details</h3>
            <p>
              <strong>Name:</strong> {selected.address?.fullName || "N/A"}
            </p>
            <p>
              <strong>City:</strong> {selected.address?.city || "N/A"},{" "}
              {selected.address?.area}
            </p>
            <p>
              <strong>Phone:</strong> {selected.address?.phoneNumber || "N/A"}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selected.createdAt).toLocaleDateString()}
            </p>

            <hr className="my-4" />

            <h4 className="font-semibold mb-2">Items</h4>
            <ul className="text-sm space-y-2">
              {selected.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between border-b py-1 text-gray-700"
                >
                  <span>{item.name}</span>
                  <span>
                    UGX {item.price.toLocaleString()} x {item.quantity}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 font-semibold">
              <p>
                Subtotal: UGX{" "}
                {selected.totalAmount?.toLocaleString() || "0"}
              </p>
              <p>
                Tax (10%): UGX{" "}
                {Math.round(selected.totalAmount * 0.1).toLocaleString()}
              </p>
              <p>
                Total: UGX{" "}
                {(selected.totalAmount * 1.1).toLocaleString()}
              </p>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a quotation to view details.</p>
        )}
      </div>
    </div>
  );
}
