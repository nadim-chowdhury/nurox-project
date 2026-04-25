"use client";

import React, { useState, useEffect } from "react";
import { Alert } from "antd";
import { NotificationOutlined } from "@ant-design/icons";

export function AnnouncementBanner() {
  const [visible, setVisible] = useState(false);
  const [announcement, setAnnouncement] = useState<any>(null);

  useEffect(() => {
    // Mock fetching announcement
    const mockAnnouncement = {
      id: "1",
      title: "System Maintenance",
      message: "The system will be undergoing scheduled maintenance this Sunday from 2 AM to 4 AM UTC.",
      type: "info" as const,
    };

    // Check if user has dismissed this announcement
    const dismissed = localStorage.getItem(`announcement_dismissed_${mockAnnouncement.id}`);
    if (!dismissed) {
      setAnnouncement(mockAnnouncement);
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    if (announcement) {
      localStorage.setItem(`announcement_dismissed_${announcement.id}`, "true");
    }
    setVisible(false);
  };

  if (!visible || !announcement) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <Alert
        message={
          <span style={{ fontWeight: 600 }}>
            {announcement.title}
          </span>
        }
        description={announcement.message}
        type={announcement.type}
        showIcon
        icon={<NotificationOutlined />}
        closable
        onClose={handleClose}
        style={{
          background: 'rgba(195, 245, 255, 0.05)',
          border: '1px solid rgba(195, 245, 255, 0.2)',
          borderRadius: 8,
        }}
      />
    </div>
  );
}
