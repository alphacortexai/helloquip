"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function UserNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchUserNotifications(user.uid);
      } else {
        setNotifications([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserNotifications = (userId) => {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("sentAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationsData);
      setLoading(false);

      // Auto-mark in-app notifications as read when user views them
      const unreadInAppNotifications = notificationsData.filter(
        n => !n.read && n.type === "in_app"
      );
      
      if (unreadInAppNotifications.length > 0) {
        console.log("🔔 Auto-marking", unreadInAppNotifications.length, "in-app notifications as read");
        // Mark them as read automatically
        unreadInAppNotifications.forEach(async (notification) => {
          try {
            // Update the notification in the notifications collection
            await updateDoc(doc(db, "notifications", notification.id), {
              read: true,
              readAt: new Date(),
            });
            console.log("✅ Marked notification as read:", notification.id);

            // Also update the corresponding message in the messages collection if it exists
            if (notification.messageId) {
              try {
                await updateDoc(doc(db, "messages", notification.messageId), {
                  read: true,
                });
                console.log("✅ Synced read status to messages collection:", notification.messageId);
              } catch (messageError) {
                console.warn("⚠️ Could not sync to messages collection:", messageError.message);
              }
            }
          } catch (error) {
            console.error("❌ Error auto-marking notification as read:", error);
          }
        });
      }
    });

    return unsubscribe;
  };

  const markAsRead = async (notificationId) => {
    try {
      // Update the notification in the notifications collection
      await updateDoc(doc(db, "notifications", notificationId), {
        read: true,
        readAt: new Date(),
      });

      // Also update the corresponding message in the messages collection if it exists
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && notification.messageId) {
        try {
          await updateDoc(doc(db, "messages", notification.messageId), {
            read: true,
          });
          console.log("✅ Synced read status to messages collection:", notification.messageId);
        } catch (messageError) {
          console.warn("⚠️ Could not sync to messages collection:", messageError.message);
        }
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "order_status": return "text-blue-600 bg-blue-50";
      case "fcm": return "text-purple-600 bg-purple-50";
      case "in_app": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return (
      <div className="text-center py-8 text-gray-500">
        Please log in to view your notifications
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          📬 My Notifications
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
              {unreadCount} unread
            </span>
          )}
        </h3>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No notifications yet
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                notification.read 
                  ? 'bg-gray-50 hover:bg-gray-100' 
                  : 'bg-white border-blue-200 hover:bg-blue-50'
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    {!notification.read && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        New
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                      {notification.type}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-2">{notification.body}</p>
                  
                  <div className="text-sm text-gray-500">
                    <div>Sent: {formatDate(notification.sentAt)}</div>
                    {notification.read && (
                      <div>Read: {formatDate(notification.readAt)}</div>
                    )}
                    {notification.target && (
                      <div>Target: {notification.target}</div>
                    )}
                  </div>
                </div>
                
                {!notification.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notification.id);
                    }}
                    className="ml-4 px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
