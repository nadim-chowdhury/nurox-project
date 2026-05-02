"use client";

import React, { useState, useEffect } from "react";
import { WifiOutlined } from "@ant-design/icons";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="nurox-offline-banner"
      style={{
        background: "var(--color-error)",
        color: "#000",
        textAlign: "center",
        padding: "4px 0",
        fontSize: "12px",
        fontWeight: "bold",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      <WifiOutlined />
      <span>You are currently offline. Some features may be unavailable.</span>
    </div>
  );
}
