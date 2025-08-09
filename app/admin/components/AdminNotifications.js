"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const router = useRouter();

  useEffect(() => {
    const q = query(
      collection(db, "adminNotifications"),
      orderBy("timestamp", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotifications(items);
    });
    return () => unsub();
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read);
    for (const n of unread) {
      try {
        await updateDoc(doc(db, "adminNotifications", n.id), { read: true });
      } catch {}
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">Admin Notifications</h2>
          {unreadCount > 0 && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-[#e5f3fa] text-[#2e4493]">{unreadCount} new</span>
          )}
        </div>
        <button onClick={markAllRead} className="text-sm text-blue-600 hover:underline">Mark all read</button>
      </div>
      {notifications.length === 0 ? (
        <p className="text-sm text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {notifications.map((n) => (
            <li key={n.id} className="py-3 flex items-center justify-between">
              <button
                className="text-left"
                onClick={async () => {
                  try { await updateDoc(doc(db, "adminNotifications", n.id), { read: true }); } catch {}
                  const target = n.orderId ? `/admin?tab=manageShipments&orderId=${n.orderId}` : (n.target || '/admin?tab=manageShipments');
                  router.push(target);
                }}
              >
                <p className="text-sm font-medium text-gray-900">{n.title || 'New Notification'}</p>
                <p className="text-sm text-gray-600">{n.text}</p>
                {n.timestamp?.toDate && (
                  <p className="text-xs text-gray-400 mt-1">{n.timestamp.toDate().toLocaleString()}</p>
                )}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    try { await updateDoc(doc(db, "adminNotifications", n.id), { read: true }); } catch {}
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark read
                </button>
                {!n.read && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-red-700">new</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


