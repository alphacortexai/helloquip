

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
    onMessage(messaging, async (payload) => {
      console.log("🔔 Foreground message received:", payload);

      const { title, body } = payload?.notification || {};
      const data = payload?.data || {};

      try {
        const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
          || (await navigator.serviceWorker.ready);
        if (registration && title) {
          await registration.showNotification(title, {
            body: body || "",
            icon: "/logo.png",
            data,
          });
        } else if (Notification.permission === "granted" && title) {
          new Notification(title, { body: body || "" });
        }
      } catch (e) {
        if (Notification.permission === "granted" && title) {
          new Notification(title, { body: body || "" });
        }
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
  
  if (!("serviceWorker" in navigator)) {
    console.warn("Service workers are not supported in this browser.");
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission not granted.");
      return null;
    }

    let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!registration) {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log("Service worker registered:", registration);
    }
    await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("✅ FCM Token:", token);
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





