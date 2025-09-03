// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBeQ9zNaX7jzbXH5sh540BaCjSDDBtclLc",
  authDomain: "helloquip-80e20.firebaseapp.com",
  projectId: "helloquip-80e20",
  storageBucket: "helloquip-80e20.firebasestorage.app",
  messagingSenderId: "965108624313",
  appId: "1:965108624313:web:3eddc0e81340def539e468",
  measurementId: "G-JPHHJT50QC"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);

  const notificationTitle = payload.notification?.title || "HalloQuip";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/logo.png",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received:', event);
  
  event.notification.close();

  // Extract data from the notification
  const data = event.notification.data;
  const fcmMessageId = data?.fcmMessageId;
  const userId = data?.userId;
  const link = data?.link;

  if (fcmMessageId && userId) {
    // Mark the FCM notification as read
    fetch('/api/mark-fcm-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fcmMessageId,
        userId
      })
    }).catch(error => {
      console.error('Error marking FCM notification as read:', error);
    });
  }

  // Open the target URL if available
  if (link) {
    event.waitUntil(
      clients.openWindow(link)
    );
  } else {
    // Default behavior - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
