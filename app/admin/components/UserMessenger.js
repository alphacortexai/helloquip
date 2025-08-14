"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export default function UserMessenger() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [term, setTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // Compose inputs
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [notifTarget, setNotifTarget] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "users"));
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setUsers(rows);
      } catch (e) {
        console.error("Failed to load users", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const t = term.trim().toLowerCase();
    if (!t) return users;
    return users.filter((u) => {
      const hay = [
        u.email,
        u.name,
        u.phone,
        u.address?.fullName,
        u.address?.phoneNumber,
      ]
        .filter(Boolean)
        .map((s) => String(s).toLowerCase())
        .join(" ");
      return hay.includes(t);
    });
  }, [users, term]);

  const sendInAppNotification = async () => {
    if (!selectedUser || !notifBody.trim() || submitting) return;
    setSubmitting(true);
    try {
      const docData = {
        from: "system",
        to: selectedUser.id,
        text: notifBody.trim(),
        type: "notification",
        chatId: `system_${selectedUser.id}`,
        timestamp: serverTimestamp(),
        read: false,
      };
      const t = notifTitle.trim();
      if (t) docData.title = t;
      const tgt = notifTarget.trim();
      if (tgt) docData.target = tgt;

      const messageRef = await addDoc(collection(db, "messages"), docData);

      // Track this notification in the notifications collection
      const notificationData = {
        userId: selectedUser.id,
        title: t || "Admin Notification",
        body: notifBody.trim(),
        target: tgt || "",
        type: "in_app",
        status: "sent",
        read: false,
        sentAt: serverTimestamp(),
        readAt: null,
        source: "admin_manual",
        adminSender: "admin", // Track that this was sent by admin
        messageId: messageRef.id // Use the actual document ID
      };
      await addDoc(collection(db, "notifications"), notificationData);

      setNotifTitle("");
      setNotifBody("");
      setNotifTarget("");
      alert("In-app notification sent.");
    } catch (e) {
      console.error("Failed to send notification", e);
      alert("Failed to send in-app notification");
    } finally {
      setSubmitting(false);
    }
  };

  const sendFcmNotification = async () => {
    if (!selectedUser || !notifBody.trim() || submitting) return;
    if (!selectedUser.fcmToken) {
      alert("User has no FCM token on file.");
      return;
    }
    setSubmitting(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const link = notifTarget ? new URL(notifTarget, origin).toString() : undefined;
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fcmToken: selectedUser.fcmToken,
          title: notifTitle || "",
          body: notifBody.trim(),
          target: notifTarget || undefined,
          link,
          data: { source: 'adminManual' },
          userId: selectedUser.id, // Add userId for tracking
          notificationType: "fcm"
        }),
      });
      const info = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("FCM send failed", info);
        alert("FCM notification failed");
      } else {
        setNotifTitle("");
        setNotifBody("");
        setNotifTarget("");
        alert("FCM notification sent.");
      }
    } catch (e) {
      console.error("FCM request error", e);
      alert("FCM notification failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Left: Users list & search */}
      <div className="md:col-span-1 bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Find User</h3>
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search by name, email, phone"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="mt-3 max-h-[520px] overflow-auto divide-y divide-gray-100">
          {loading ? (
            <div className="p-3 text-sm text-gray-500">Loading users…</div>
          ) : filtered.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No users found.</div>
          ) : (
            filtered.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full text-left p-3 hover:bg-gray-50 ${selectedUser?.id === u.id ? "bg-blue-50" : ""}`}
              >
                <p className="text-sm font-medium text-gray-900">{u.name || u.email || u.id}</p>
                <p className="text-xs text-gray-600">{u.email}</p>
                {u.address?.phoneNumber && (
                  <p className="text-xs text-gray-500">{u.address.phoneNumber}</p>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right: User detail & actions */}
      <div className="md:col-span-2 bg-white border border-gray-200 rounded-lg">
        {!selectedUser ? (
          <div className="p-6 text-sm text-gray-600">Select a user to view details and send a message/notification.</div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-base font-semibold text-gray-900">{selectedUser.name || selectedUser.email || selectedUser.id}</h3>
              <p className="text-xs text-gray-600">{selectedUser.email}</p>
              {selectedUser.address && (
                <div className="text-xs text-gray-600 mt-1">
                  <p>{selectedUser.address.fullName}</p>
                  <p>{selectedUser.address.city}{selectedUser.address.area ? ", " + selectedUser.address.area : ""}</p>
                  <p>{selectedUser.address.phoneNumber}</p>
                </div>
              )}
              <div className="mt-2 text-xs">
                <span className={`px-2 py-0.5 rounded ${selectedUser.fcmToken ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {selectedUser.fcmToken ? "FCM enabled" : "No FCM token"}
                </span>
              </div>
            </div>

            {/* Notifications */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-800">Send notification (in-app or FCM)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Title (optional)</label>
                  <input
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter a title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                  <input
                    value={notifBody}
                    onChange={(e) => setNotifBody(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter notification message"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Target link (optional)</label>
                  <input
                    value={notifTarget}
                    onChange={(e) => setNotifTarget(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. /order/ABC123"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={sendInAppNotification}
                  disabled={submitting || !notifBody.trim()}
                  className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-900 disabled:opacity-50"
                >
                  {submitting ? "Sending…" : "Send In-App"}
                </button>
                <button
                  onClick={sendFcmNotification}
                  disabled={submitting || !notifBody.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 disabled:opacity-50"
                  title={selectedUser?.fcmToken ? "" : "User has no FCM token"}
                >
                  {submitting ? "Sending…" : "Send FCM"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


