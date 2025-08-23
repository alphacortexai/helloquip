"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function QuoteRequestManager() {
  const [quoteRequests, setQuoteRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchQuoteRequests = async () => {
      try {
        const q = query(collection(db, "quoteRequests"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setQuoteRequests(data);
      } catch (error) {
        console.error("Error fetching quote requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteRequests();
  }, []);

  const handleStatusUpdate = async (requestId, newStatus) => {
    setUpdating(true);
    try {
      await updateDoc(doc(db, "quoteRequests", requestId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      
      // Update local state
      setQuoteRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: newStatus, updatedAt: new Date().toISOString() }
            : req
        )
      );
      
      if (selected?.id === requestId) {
        setSelected(prev => ({ ...prev, status: newStatus, updatedAt: new Date().toISOString() }));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending": return "⏳ Pending";
      case "approved": return "✅ Approved";
      case "rejected": return "❌ Rejected";
      default: return "❓ Unknown";
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Quote Request List */}
      <div className="w-full md:w-1/3 bg-white border rounded-xl p-4 h-[600px] overflow-auto">
        <h2 className="text-lg font-bold mb-4">Quote Requests</h2>
        {loading ? (
          <p>Loading...</p>
        ) : quoteRequests.length === 0 ? (
          <p className="text-gray-500">No quote requests found.</p>
        ) : (
          quoteRequests.map((request) => (
            <button
              key={request.id}
              onClick={() => setSelected(request)}
              className={`block w-full text-left p-3 rounded hover:bg-gray-100 mb-2 ${
                selected?.id === request.id ? "bg-blue-100 border border-blue-200" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm">#{request.id.slice(-6)}</p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {getStatusBadge(request.status)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {request.address?.fullName || "No Name"}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500">
                UGX {request.totalAmount?.toLocaleString() || "0"}
              </p>
            </button>
          ))
        )}
      </div>

      {/* Quote Request Details */}
      <div className="w-full md:w-2/3 bg-white border rounded-xl p-4 h-[600px] overflow-auto">
        {selected ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Quote Request Details</h3>
              <div className="flex gap-2">
                <select
                  value={selected.status}
                  onChange={(e) => handleStatusUpdate(selected.id, e.target.value)}
                  disabled={updating}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Customer Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Name:</strong> {selected.address?.fullName || "N/A"}</p>
                  <p><strong>Phone:</strong> {selected.userPhone || "N/A"}</p>
                </div>
                <div>
                  <p><strong>Email:</strong> {selected.userEmail || "N/A"}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selected.status)}`}>
                      {getStatusBadge(selected.status)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Shipping Address</h4>
              <div className="text-sm">
                <p><strong>City:</strong> {selected.address?.city || "N/A"}</p>
                <p><strong>Area:</strong> {selected.address?.area || "N/A"}</p>
                <p><strong>Phone:</strong> {selected.address?.phoneNumber || "N/A"}</p>
              </div>
            </div>

            {/* Items */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Requested Items</h4>
              <div className="space-y-2">
                {selected.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-gray-600 text-xs">SKU: {item.sku || "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <p>UGX {item.price?.toLocaleString() || "0"} x {item.quantity}</p>
                      <p className="font-medium">UGX {(item.price * item.quantity)?.toLocaleString() || "0"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Order Summary</h4>
              <div className="text-sm space-y-1">
                <p><strong>Subtotal:</strong> UGX {selected.totalAmount?.toLocaleString() || "0"}</p>
                <p><strong>Tax (10%):</strong> UGX {Math.round((selected.totalAmount || 0) * 0.1).toLocaleString()}</p>
                <p className="text-lg font-bold">
                  <strong>Total:</strong> UGX {Math.round((selected.totalAmount || 0) * 1.1).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="text-xs text-gray-500">
              <p>Created: {new Date(selected.createdAt).toLocaleString()}</p>
              {selected.updatedAt && (
                <p>Last Updated: {new Date(selected.updatedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Select a quote request to view details.</p>
        )}
      </div>
    </div>
  );
}
