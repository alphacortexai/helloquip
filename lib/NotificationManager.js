

// lib/NotificationManager.js
import { messaging, db } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc } from "firebase/firestore";

const VAPID_KEY = "BHuD2rxDyMLRqFI9wYZNC3rFrm5I_cxILuD3oJWheDBN_BE_V2HdYXBIYR2iyLqxiIG1bTeFZeRrWAz9W-Hv29Y";




export function listenForForegroundMessages(callback) {
  if (!messaging) return;

  onMessage(messaging, (payload) => {
    console.log("🔔 Foreground message received:", payload);

    const { title, body } = payload?.notification || {};

    // Show browser notification manually
    if (Notification.permission === "granted" && title && body) {
      new Notification(title, {
        body,
      });
    }

    if (callback) callback(payload);
  });
}




// export async function requestPermissionAndToken(user) {
//   if (!messaging) {
//     console.warn("Messaging is not supported.");
//     return null;
//   }
//   if (!user?.uid) {
//     console.warn("User not logged in.");
//     return null;
//   }
//   try {
//     const permission = await Notification.requestPermission();
//     if (permission !== "granted") {
//       console.warn("Notification permission not granted.");
//       return null;
//     }

//     const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

//     const token = await getToken(messaging, {
//       vapidKey: VAPID_KEY,
//       serviceWorkerRegistration: registration,
//     });

//     if (token) {
//       console.log("FCM Token:", token);
//       await setDoc(doc(db, "users", user.uid), { fcmToken: token }, { merge: true });
//       return token;
//     } else {
//       console.warn("No registration token available.");
//       return null;
//     }
//   } catch (err) {
//     console.error("Error getting FCM token:", err);
//     return null;
//   }
// }



export async function requestPermissionAndToken(user) {
  if (!messaging) {
    console.warn("Messaging is not supported.");
    return null;
  }
  if (!user?.uid) {
    console.warn("User not logged in.");
    return null;
  }
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

    // Register the service worker and check result
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    if (!registration) {
      console.error("Service worker registration failed.");
      return null;
    }

    // Now get the FCM token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.log("FCM Token:", token);
      await setDoc(doc(db, "users", user.uid), { fcmToken: token }, { merge: true });
      return token;
    } else {
      console.warn("No registration token available.");
      return null;
    }
  } catch (err) {
    console.error("oh No! Error getting FCM token:", err);
    return null;
  }
}


