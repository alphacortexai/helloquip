"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const MAX_QUICK_ACTIONS = 8;

export default function QuickActionsSettings({ allMenuItems }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const snap = await getDoc(doc(db, "settings", "quickActions"));
      if (snap.exists() && Array.isArray(snap.data().itemIds)) {
        setSelectedIds(snap.data().itemIds);
      }
    } catch (error) {
      console.error("Error loading quick actions:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await setDoc(
        doc(db, "settings", "quickActions"),
        { itemIds: selectedIds.slice(0, MAX_QUICK_ACTIONS), updatedAt: new Date() },
        { merge: true }
      );
      alert("Quick actions saved!");
    } catch (error) {
      console.error("Error saving quick actions:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = (id) => {
    if (!id) return; // exclude Store Overview
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_QUICK_ACTIONS) return prev;
      return [...prev, id];
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Quick Actions</h3>
      <p className="text-sm text-gray-600 mb-4">
        Choose up to {MAX_QUICK_ACTIONS} items to show as quick action buttons on the dashboard (before Store Overview).
      </p>
      <div className="space-y-2 mb-6">
        {allMenuItems.map((item) => (
          <label
            key={item.id}
            className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={() => toggle(item.id)}
              disabled={!selectedIds.includes(item.id) && selectedIds.length >= MAX_QUICK_ACTIONS}
              className="rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-800">{item.label}</span>
            {item.groupLabel && (
              <span className="text-xs text-gray-500">({item.groupLabel})</span>
            )}
          </label>
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Selected: {selectedIds.length} / {MAX_QUICK_ACTIONS}
      </p>
      <button
        onClick={saveSettings}
        disabled={saving}
        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Quick Actions"}
      </button>
    </div>
  );
}
