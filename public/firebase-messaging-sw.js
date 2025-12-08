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
  const targetUrl = link || '/';

  try {
    // First, try to find existing app windows
    const clientsList = await clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    // Look for an existing app window that's not about:blank or chrome://
    const existingAppWindow = clientsList.find(client =>
      client.url && !client.url.startsWith('about:') && !client.url.startsWith('chrome://')
    );

    if (existingAppWindow) {
      // Focus the existing window and navigate to the target URL
      console.log('[firebase-messaging-sw.js] Focusing existing app window:', existingAppWindow.url);
      await existingAppWindow.focus();

      // If the target is different from current URL, navigate
      if (existingAppWindow.url !== targetUrl) {
        // Use postMessage to navigate within the app (safer for PWA)
        existingAppWindow.postMessage({
          type: 'NAVIGATE_TO',
          url: targetUrl
        });
      }
      return existingAppWindow;
    } else {
      // No existing app window found, open a new one
      console.log('[firebase-messaging-sw.js] Opening new window:', targetUrl);
      return clients.openWindow(targetUrl);
    }
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error handling notification click:', error);
    // Fallback to opening new window
    return clients.openWindow(targetUrl);
  }
}
