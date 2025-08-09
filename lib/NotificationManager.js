

// lib/NotificationManager.js
import { messaging, db } from "@/lib/firebase";
import { getToken, onMessage, isSupported } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";

const VAPID_KEY = "BHuD2rxDyMLRqFI9wYZNC3rFrm5I_cxILuD3oJWheDBN_BE_V2HdYXBIYR2iyLqxiIG1bTeFZeRrWAz9W-Hv29Y";

export async function listenForForegroundMessages(callback) {
  if (typeof window === "undefined") return;
  if (typeof Notification === "undefined") return;
  if (!(await isSupported())) return;

  try {
    onMessage(messaging, (payload) => {
      console.log("🔔 Foreground message received:", payload);

      const { title, body } = payload?.notification || {};
      if (Notification.permission === "granted" && title && body) {
        new Notification(title, { body });
      }

      if (callback) callback(payload);
    });
  } catch (error) {
    console.warn("Failed to set up foreground message listener:", error);
  }
}

export async function requestPermissionAndToken(user) {
  if (typeof window === "undefined") return null;
  if (!user?.uid) return null;
  if (!(await isSupported())) return null;
  
  // Check if service workers are supported
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser.");
    return null;
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return null;
    }

    // Check if service worker is already registered
    let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    
    if (!registration) {
      // Register the service worker
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log("Service worker registered:", registration);
    }

    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM Token obtained successfully");
      await setDoc(doc(db, "users", user.uid), { fcmToken: token }, { merge: true });
      return token;
    } else {
      console.warn("No registration token available.");
      return null;
    }
  } catch (err) {
    console.error("Error getting FCM token:", err);
    // Don't throw the error, just return null to prevent app crashes
    return null;
  }
}





