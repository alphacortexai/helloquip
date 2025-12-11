"use client";

import { useEffect, useState } from "react";

/**
 * Lightweight PWA install prompt.
 * - Listens for beforeinstallprompt
 * - Shows a small button when install is available
 * - Avoids showing if already installed or user dismissed in this session
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)")?.matches ||
      window.navigator.standalone === true;

    const dismissed = sessionStorage.getItem("pwa-install-dismissed") === "1";
    if (isStandalone || dismissed) return;

    const handler = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "dismissed") {
      sessionStorage.setItem("pwa-install-dismissed", "1");
    }
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleClose = () => {
    sessionStorage.setItem("pwa-install-dismissed", "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        right: 16,
        zIndex: 9999,
        background: "white",
        border: "1px solid #e5e7eb",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        borderRadius: 12,
        padding: "12px 14px",
        width: 280,
        maxWidth: "calc(100vw - 24px)",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: "#111827" }}>Install HelloQuip</div>
          <div style={{ fontSize: 12, color: "#4b5563", marginTop: 2 }}>
            Add the app to your device for faster access.
          </div>
        </div>
        <button
          onClick={handleClose}
          aria-label="Dismiss install prompt"
          style={{
            border: "none",
            background: "transparent",
            fontSize: 18,
            lineHeight: 1,
            color: "#9ca3af",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>
      <button
        onClick={handleInstall}
        style={{
          marginTop: 10,
          width: "100%",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: 8,
          padding: "10px 12px",
          fontWeight: 600,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        Install app
      </button>
    </div>
  );
}
