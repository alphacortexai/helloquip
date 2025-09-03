"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/lib/firebase";
import { StarIcon } from "@heroicons/react/24/solid";
import { toast } from "sonner";

export default function FeedbackPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    rating: 0,
    feedback: "",
    allowPublicDisplay: false
  });
  const [submitting, setSubmitting] = useState(false);

  // Check user authentication
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please log in to submit feedback");
      return;
    }
    
    if (!formData.name.trim() || !formData.feedback.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    
    try {
      await addDoc(collection(db, "feedback"), {
        // Map fields correctly for testimonials component
        userName: formData.name,
        testimonial: formData.feedback,
        profession: formData.profession,
        rating: formData.rating,
        allowPublicDisplay: formData.allowPublicDisplay,
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email
      });
      
      toast.success("Thank you for your feedback! We'll review it shortly.");
      router.push("/");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Login Required</h1>
            <p className="text-gray-600 mb-6">
              You need to be logged in to submit feedback. This helps us ensure authentic reviews.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/register")}
                className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Register
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full text-gray-500 py-2 px-6 rounded-xl font-medium hover:text-gray-700 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 border-r-green-500 border-b-yellow-500 border-l-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Submitting your feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Share Your Experience</h1>
            <p className="text-gray-600 mb-4">
              Help other customers by sharing your experience with HalloQuip
            </p>
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800">
                Submitting as: <span className="font-semibold">{user.email}</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Profession
              </label>
              <input
                type="text"
                value={formData.profession}
                onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Medical Professional, Hospital Administrator, Clinic Owner"
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating *
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className={`p-1 transition-colors ${
                      star <= formData.rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    <StarIcon className="w-8 h-8" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.rating > 0 ? `${formData.rating}/5` : "Select rating"}
                </span>
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback *
              </label>
              <textarea
                required
                rows={6}
                value={formData.feedback}
                onChange={(e) => setFormData(prev => ({ ...prev, feedback: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Share your experience with HalloQuip. What did you like? What could we improve?"
              />
            </div>

            {/* Public Display Permission */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="allowPublicDisplay"
                checked={formData.allowPublicDisplay}
                onChange={(e) => setFormData(prev => ({ ...prev, allowPublicDisplay: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="allowPublicDisplay" className="text-sm text-gray-700">
                Allow this feedback to be displayed publicly on our website
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Feedback"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Your feedback helps us improve our services and helps other customers make informed decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
