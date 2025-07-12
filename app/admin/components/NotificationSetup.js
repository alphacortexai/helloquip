// components/NotificationSetup.js
"use client";

import { useEffect } from "react";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  projectId: "your-project-id",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export default function NotificationSetup({ userId }) {
  useEffect(() => {
    Notification.requestPermission().then(async (permission) => {
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: "YOUR_VAPID_KEY", // Replace with your actual VAPID key
        });

        console.log("✅ FCM Token:", token);

        // TODO: Send token to your Firestore or backend API
      }
    });

    onMessage(messaging, (payload) => {
      const { title, body } = payload.notification;
      alert(`${title}: ${body}`);
    });
  }, []);

  return null;
}
