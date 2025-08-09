// public/firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

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

  const notificationTitle = payload.notification?.title || "HelloQuip";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/logo.png",
    data: payload.data || {},
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  const target = event.notification?.data?.target || '/';
  event.notification.close();
  event.waitUntil((async () => {
    const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    // Try to focus and navigate an existing client
    for (const client of clientList) {
      if ('focus' in client) {
        await client.focus();
      }
      if (target && 'navigate' in client) {
        try {
          await client.navigate(target);
          return;
        } catch (e) {
          // fall through to openWindow
        }
      }
    }
    // No clients or navigation failed: open a new window
    if (self.clients.openWindow) {
      await self.clients.openWindow(target);
    }
  })());
});
