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
  const data = event.notification.data || {};
  const fcmMessageId = data?.fcmMessageId;
  const userId = data?.userId;
  // Prefer explicit target/relative paths, fall back to link
  const link = data?.relativeLink || data?.target || data?.link;

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
    // Normalize to relative path when same-origin (or allowed host)
    let relativePath = targetUrl;
    try {
      const url = new URL(targetUrl);
      const isSameOrigin = url.origin === self.location.origin;
      const isAllowedHost =
        url.hostname === "localhost" ||
        url.hostname === "127.0.0.1" ||
        url.hostname.endsWith("helloquip.vercel.app");

      if (isSameOrigin || isAllowedHost) {
        relativePath = url.pathname + url.search + url.hash;
        console.log('[firebase-messaging-sw.js] Converted to relative path:', relativePath);
      }
    } catch (e) {
      console.log('[firebase-messaging-sw.js] Treating as relative path:', targetUrl);
    }

    // Check existing windows first
    const clientsList = await clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    console.log('[firebase-messaging-sw.js] Found existing clients:', clientsList.map(c => ({ url: c.url, visibility: c.visibilityState })));

    const existingAppWindow = clientsList.find(client => {
      const url = client.url;
      return url && (url.includes(self.location.origin) || url.includes('vercel.app')) &&
             !url.startsWith('about:') && !url.startsWith('chrome://') &&
             !url.startsWith('edge://') && !url.startsWith('firefox://');
    });

    if (existingAppWindow) {
      console.log('[firebase-messaging-sw.js] Found existing app window, focusing:', existingAppWindow.url);
      await existingAppWindow.focus();

      if (relativePath !== '/') {
        console.log('[firebase-messaging-sw.js] Sending navigation message for:', relativePath);
        setTimeout(() => {
          try {
            existingAppWindow.postMessage({
              type: 'NAVIGATE_TO',
              url: relativePath
            });
            console.log('[firebase-messaging-sw.js] Navigation message sent');
          } catch (e) {
            console.error('[firebase-messaging-sw.js] Failed to send navigation message:', e);
          }
        }, 500);
      }

      return existingAppWindow;
    }

    // No existing window: open directly to the intended URL
    const finalUrl = (relativePath === '/' || relativePath.startsWith('/'))
      ? self.location.origin + relativePath
      : targetUrl;

    console.log('[firebase-messaging-sw.js] Opening URL:', finalUrl);
    return clients.openWindow(finalUrl);
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Error handling notification click:', error);
    // Last resort fallback - open the home page
    return clients.openWindow(targetUrl || '/');
  }
}
