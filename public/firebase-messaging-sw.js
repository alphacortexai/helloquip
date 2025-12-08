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

  event.waitUntil(
    handleNotificationClick(link)
  );
});

// Improved notification click handler for PWA
async function handleNotificationClick(link) {
  let targetUrl = link || '/';
  console.log('[firebase-messaging-sw.js] Processing notification click for:', targetUrl);

  try {
    // Convert full URL to relative path for navigation
    let relativePath = targetUrl;
    try {
      const url = new URL(targetUrl);
      // If it's a full URL from our domain, extract the pathname
      if (url.origin === self.location.origin) {
        relativePath = url.pathname + url.search + url.hash;
        console.log('[firebase-messaging-sw.js] Converted to relative path:', relativePath);
      }
    } catch (e) {
      // If URL parsing fails, assume it's already a relative path
      console.log('[firebase-messaging-sw.js] Treating as relative path:', targetUrl);
    }

    // For PWAs, always try to open/focus the main app window
    const appUrl = self.location.origin + '/';
    console.log('[firebase-messaging-sw.js] Opening/focusing app at:', appUrl);

    // Use clients.openWindow which will focus existing window or open new one
    const client = await clients.openWindow(appUrl);

    // If we have a specific page to navigate to, send message after window is ready
    if (client && relativePath !== '/') {
      console.log('[firebase-messaging-sw.js] Sending navigation message for:', relativePath);
      // Small delay to let the app load, then navigate
      setTimeout(() => {
        try {
          client.postMessage({
            type: 'NAVIGATE_TO',
            url: relativePath
          });
        } catch (e) {
          console.error('[firebase-messaging-sw.js] Failed to send navigation message:', e);
        }
      }, 1500); // Reduced delay for faster navigation
    }

    return client;
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error handling notification click:', error);
    // Last resort fallback - open the home page
    return clients.openWindow('/');
  }
}
