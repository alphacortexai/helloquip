"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  requestPermissionAndToken,
  listenForForegroundMessages,
} from "@/lib/NotificationManager";
import NotificationCard from "@/components/NotificationCard";

export default function NotificationSetup() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Try to set up notifications, but don't crash if it fails
          await requestPermissionAndToken(user);

          listenForForegroundMessages((payload) => {
            const { title, body } = payload?.notification || {};

            console.log("💬 Foreground FCM received:", title, body);

            if (title && body) {
              setNotification({ title, body });

              setTimeout(() => setNotification(null), 5000);
            }
          });
        } catch (error) {
          console.warn("Failed to set up notifications:", error);
          // Don't crash the app if notifications fail
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      {notification && (
        <NotificationCard
          title={notification.title}
          body={notification.body}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}
