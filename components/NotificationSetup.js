"use client";

import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { requestPermissionAndToken, listenForForegroundMessages } from "@/lib/NotificationManager";

export default function NotificationSetup() {
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await requestPermissionAndToken(user);

        listenForForegroundMessages((payload) => {
          const { title, body } = payload.notification || {};
          alert(`${title}: ${body}`);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
