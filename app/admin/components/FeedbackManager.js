"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { StarIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";

export default function FeedbackManager() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, approved, rejected

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const feedbackData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setFeedback(feedbackData);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (feedbackId, newStatus) => {
    try {
      await updateDoc(doc(db, "feedback", feedbackId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setFeedback(prev => 
        prev.map(item => 
          item.id === feedbackId 
            ? { ...item, status: newStatus }
            : item
        )
      );
      
      toast.success(`Feedback ${newStatus}`);
    } catch (error) {
      console.error("Error updating feedback:", error);
      toast.error("Failed to update feedback");
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    
    try {
      await deleteDoc(doc(db, "feedback", feedbackId));
      setFeedback(prev => prev.filter(item => item.id !== feedbackId));
      toast.success("Feedback deleted");
    } catch (error) {
      console.error("Error deleting feedback:", error);
      toast.error("Failed to delete feedback");
    }
  };

  const getInitials = (name) => {
    if (!name) return "AN";
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredFeedback = feedback.filter(item => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="ml-3">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-4/5"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Customer Feedback Management</h2>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Feedback</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        {filteredFeedback.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No feedback found for the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFeedback.map((item) => (
              <div key={item.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      {getInitials(item.userName)}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-800">
                        {item.userName || "Anonymous"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.userEmail}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.profession || "Customer"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      {item.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`w-4 h-4 ${
                        star <= item.rating 
                          ? "text-yellow-400" 
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {item.rating}/5
                  </span>
                </div>

                {/* Testimonial */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    "{item.testimonial}"
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {item.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(item.id, "approved")}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(item.id, "rejected")}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {item.status === "approved" && (
                      <button
                        onClick={() => handleStatusUpdate(item.id, "rejected")}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    {item.status === "rejected" && (
                      <button
                        onClick={() => handleStatusUpdate(item.id, "approved")}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                  
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>

                {/* Public Display Info */}
                <div className="mt-3 text-xs text-gray-500">
                  {item.allowPublicDisplay ? (
                    <span className="text-green-600">✓ Customer agreed to public display</span>
                  ) : (
                    <span className="text-red-600">✗ Customer did not agree to public display</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
