"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function RequestQuoteButton({ cartItems, address, userId }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    phone: "",
    email: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!userId) throw new Error("User not authenticated");
      if (!Array.isArray(cartItems) || cartItems.length === 0) {
        throw new Error("Your cart is empty. Add items before requesting a quotation.");
      }
      if (!formData.phone.trim() || !formData.email.trim()) {
        throw new Error("Please provide both phone number and email.");
      }

      const quoteRequestData = {
        userId,
        userPhone: formData.phone.trim(),
        userEmail: formData.email.trim(),
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          description: item.description || "",
          sku: item.sku || "",
        })),
        address,
        totalAmount: cartItems.reduce(
          (sum, item) => sum + item.price * (item.quantity || 1),
          0
        ),
        status: "pending", // pending, approved, rejected
        createdAt: new Date().toISOString(),
        type: "quote_request" // to distinguish from regular quotations
      };

      // Save quote request to Firestore
      await addDoc(collection(db, "quoteRequests"), quoteRequestData);
      
      setSuccess(true);
      setFormData({ phone: "", email: "" });
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
      }, 2000);
      
    } catch (err) {
      setError(err.message || "Failed to submit quote request");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (success) {
    return (
      <div className="w-full mt-4 px-6 py-3 bg-green-100 border border-green-300 rounded text-green-800 text-center">
        ✅ Quote request submitted successfully! We'll contact you soon.
      </div>
    );
  }

  return (
    <div>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-base font-semibold transition"
        >
          📋 Request Quote
        </button>
      ) : (
        <div className="w-full mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Request Quote</h3>
          <p className="text-sm text-gray-600 mb-4">
            Please provide your contact information and we'll send you a detailed quote.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+256 700 000 000"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded text-sm font-medium transition ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                  setFormData({ phone: "", email: "" });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
          
          {error && (
            <p className="text-red-600 mt-3 text-sm text-center">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}
