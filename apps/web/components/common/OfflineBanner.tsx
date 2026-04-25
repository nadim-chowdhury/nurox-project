"use client";

import React, { useState, useEffect } from "react";
import { Alert, Button } from "antd";
import { CloudSyncOutlined, ReloadOutlined } from "@ant-design/icons";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (typeof window !== "undefined" && !window.navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  if (!isOffline) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "100%",
        maxWidth: 600,
        padding: "0 16px",
      }}
    >
      <Alert
        message="You are currently offline"
        description={
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <span>
              Some features may be limited. We'll automatically reconnect when your connection returns.
            </span>
            <Button 
              size="small" 
              icon={<ReloadOutlined />} 
              onClick={handleRetry}
              style={{ background: "rgba(255,255,255,0.1)", borderColor: "rgba(255,255,255,0.2)" }}
            >
              Retry
            </Button>
          </div>
        }
        type="warning"
        showIcon
        icon={<CloudSyncOutlined spin />}
        closable
      />
    </div>
  );
}
