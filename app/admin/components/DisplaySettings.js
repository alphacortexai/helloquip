"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function DisplaySettings() {
  const [featuredCardResolution, setFeaturedCardResolution] = useState("200x200");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const resolutionOptions = [
    { value: "90x90", label: "90x90 (Smallest - Best for mobile)" },
    { value: "200x200", label: "200x200 (Medium - Better quality)" },
    { value: "680x680", label: "680x680 (Large - High quality)" },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, "settings", "display"));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setFeaturedCardResolution(data.featuredCardResolution || "200x200");
      }
    } catch (error) {
      console.error("Error loading display settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, "settings", "display"),
        {
          featuredCardResolution,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      alert("Display settings saved successfully!");
    } catch (error) {
      console.error("Error saving display settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Display Settings</h3>
          <p className="text-sm text-gray-600">Configure how products are displayed across the site</p>
        </div>
      </div>

      {/* Featured Product Cards Resolution */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Featured Product Cards Resolution</h4>
          <p className="text-xs text-gray-600 mb-4">
            Choose the image resolution for featured product cards. Higher resolutions provide better quality but may load slower.
          </p>
          
          <div className="space-y-3">
            {resolutionOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="featuredCardResolution"
                  value={option.value}
                  checked={featuredCardResolution === option.value}
                  onChange={(e) => setFeaturedCardResolution(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900">{option.value}</span>
                  <p className="text-xs text-gray-500">{option.label}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-900 mb-3">Preview</h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-2 shadow-sm">
                <div className="w-full h-16 bg-gray-200 rounded mb-2 flex items-center justify-center">
                  <span className="text-xs text-gray-500">{featuredCardResolution}</span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            This shows how featured product cards will appear with {featuredCardResolution} resolution
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
