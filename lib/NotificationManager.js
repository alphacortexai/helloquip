// lib/NotificationManager.js
import { messaging, db, getToken, onMessage } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const VAPID_KEY = "BHuD2rxDyMLRqFI9wYZNC3rFrm5I_cxILuD3oJWheDBN_BE_V2HdYXBIYR2iyLqxiIG1bTeFZeRrWAz9W-Hv29Y"; // Your Web Push certificate key

export async function requestPermissionAndToken(user) {
  try {
    // Request notification permission from user
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return null;
    }

    // Register service worker before using messaging API
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

    // Get FCM token with service worker registration and vapidKey
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM Token:", token);

      // Save the token in Firestore under the user's document
      await setDoc(doc(db, "users", user.uid), { fcmToken: token }, { merge: true });

      return token;
    } else {
      console.warn("No registration token available.");
      return null;
    }
  } catch (err) {
    console.error("Error getting FCM token:", err);
    return null;
  }
}

export function listenForForegroundMessages(callback) {
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    if (callback) callback(payload);
  });
}
