"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  onSnapshot,
} from "firebase/firestore";

export default function NotificationTracker() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [selectedUser, setSelectedUser] = useState("all");
  const [selectedType, setSelectedType] = useState("all"); // all, fcm, in_app
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, [filter, selectedUser, selectedType]);

  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Use onSnapshot for real-time updates
      let q = query(collection(db, "notifications"), orderBy("sentAt", "desc"), limit(100));

      if (filter === "unread") {
        q = query(collection(db, "notifications"), where("read", "==", false), orderBy("sentAt", "desc"), limit(100));
      } else if (filter === "read") {
        q = query(collection(db, "notifications"), where("read", "==", true), orderBy("sentAt", "desc"), limit(100));
      }

      // Use onSnapshot for real-time updates instead of getDocs
      const unsubscribe = onSnapshot(q, (snapshot) => {
        let notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter by user if selected
        if (selectedUser !== "all") {
          notificationsData = notificationsData.filter(n => n.userId === selectedUser);
        }

        // Filter by type if selected
        if (selectedType !== "all") {
          notificationsData = notificationsData.filter(n => n.type === selectedType);
        }

        setNotifications(notificationsData);
        setLoading(false);
      });

      // Return unsubscribe function
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId);
    return user?.email || userId;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getStatusColor = (read) => {
    return read ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "order_status": return "text-blue-600 bg-blue-50";
      case "admin_manual": return "text-purple-600 bg-purple-50";
      case "fcm": return "text-green-600 bg-green-50";
      case "in_app": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case "admin_manual": return "Admin Manual";
      case "order_status_update": return "Order Status";
      case "system": return "System";
      default: return source || "Unknown";
    }
  };

  // Separate notifications by type
  const fcmNotifications = notifications.filter(n => n.type === "fcm");
  const inAppNotifications = notifications.filter(n => n.type === "in_app");

  // Further categorize FCM notifications by source
  const orderStatusFCM = fcmNotifications.filter(n => n.source === "order_status_update");
  const adminManualFCM = fcmNotifications.filter(n => n.source === "admin_manual");
  const systemFCM = fcmNotifications.filter(n => n.source === "system");

  const stats = {
    total: notifications.length,
    read: notifications.filter(n => n.read).length,
    unread: notifications.filter(n => !n.read).length,
    fcm: fcmNotifications.length,
    inApp: inAppNotifications.length,
    orderStatusFCM: orderStatusFCM.length,
    adminManualFCM: adminManualFCM.length,
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">📊 Notification Tracker</h2>
        
        {/* Stats - Mobile Responsive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 md:gap-4 mb-6">
          <div className="bg-blue-50 p-3 md:p-4 rounded-lg">
            <div className="text-lg md:text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs md:text-sm text-blue-600">Total</div>
          </div>
          <div className="bg-green-50 p-3 md:p-4 rounded-lg">
            <div className="text-lg md:text-2xl font-bold text-green-600">{stats.read}</div>
            <div className="text-xs md:text-sm text-green-600">Read</div>
          </div>
          <div className="bg-red-50 p-3 md:p-4 rounded-lg">
            <div className="text-lg md:text-2xl font-bold text-red-600">{stats.unread}</div>
            <div className="text-xs md:text-sm text-red-600">Unread</div>
          </div>
          <div className="bg-green-100 p-3 md:p-4 rounded-lg">
            <div className="text-lg md:text-2xl font-bold text-green-700">{stats.fcm}</div>
            <div className="text-xs md:text-sm text-green-700">FCM Total</div>
          </div>
          <div className="bg-orange-100 p-3 md:p-4 rounded-lg">
            <div className="text-lg md:text-2xl font-bold text-orange-700">{stats.inApp}</div>
            <div className="text-xs md:text-sm text-orange-700">In-App</div>
          </div>
          <div className="bg-blue-100 p-3 md:p-4 rounded-lg">
            <div className="text-lg md:text-2xl font-bold text-blue-700">{stats.orderStatusFCM}</div>
            <div className="text-xs md:text-sm text-blue-700">Order FCM</div>
          </div>
          <div className="bg-purple-100 p-3 md:p-4 rounded-lg">
            <div className="text-lg md:text-2xl font-bold text-purple-700">{stats.adminManualFCM}</div>
            <div className="text-xs md:text-sm text-purple-700">Admin FCM</div>
          </div>
        </div>

        {/* Filters - Mobile Stacked Layout */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread Only</option>
            <option value="read">Read Only</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Types</option>
            <option value="fcm">FCM Only</option>
            <option value="in_app">In-App Only</option>
          </select>

          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.email || user.id}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border rounded-lg p-3 md:p-4 ${notification.read ? 'bg-gray-50' : 'bg-white border-blue-200'}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{notification.title}</h3>
                      <div className="flex flex-wrap gap-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.read)}`}>
                          {notification.read ? "Read" : "Unread"}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type === "fcm" ? "FCM" : "In-App"}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-2 text-sm line-clamp-2">{notification.body}</p>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div><strong>User:</strong> {getUserEmail(notification.userId)}</div>
                      <div><strong>Sent:</strong> {formatDate(notification.sentAt)}</div>
                      {notification.read && (
                        <div><strong>Read:</strong> {formatDate(notification.readAt)}</div>
                      )}
                      {notification.target && (
                        <div><strong>Target:</strong> <span className="truncate block">{notification.target}</span></div>
                      )}
                      {notification.source && (
                        <div><strong>Source:</strong> {getSourceLabel(notification.source)}</div>
                      )}
                      {notification.fcmMessageId && (
                        <div><strong>FCM ID:</strong> <span className="font-mono text-xs">{notification.fcmMessageId.substring(0, 20)}...</span></div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 md:ml-4 md:flex-shrink-0">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(notification.read)} text-center`}>
                      {notification.read ? "Read" : "Unread"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
