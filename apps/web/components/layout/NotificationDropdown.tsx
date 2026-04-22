"use client";

import React from "react";
import { Badge, Dropdown, List, Avatar, Button, Empty, Spin } from "antd";
import { BellOutlined, CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "@/store/api/notificationApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function NotificationDropdown() {
  const { data, isLoading } = useGetNotificationsQuery({ limit: 5 });
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = data?.data || [];
  const unreadCount = data?.meta?.unreadCount || 0;

  const content = (
    <div
      style={{
        width: 320,
        backgroundColor: "#ffffff",
        borderRadius: 8,
        boxShadow: "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 600 }}>Notifications</span>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            onClick={() => markAllAsRead()}
            style={{ padding: 0, height: "auto" }}
          >
            Mark all read
          </Button>
        )}
      </div>

      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        {isLoading ? (
          <div style={{ padding: 40, textAlign: "center" }}><Spin /></div>
        ) : notifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  backgroundColor: item.isRead ? "transparent" : "#f0faff",
                  transition: "background-color 0.2s",
                }}
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    icon={<DeleteOutlined />}
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                  />,
                ]}
                onClick={() => !item.isRead && markAsRead(item.id)}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        backgroundColor: item.type === "SYSTEM" ? "#1890ff" : "#52c41a",
                      }}
                    >
                      {item.type[0]}
                    </Avatar>
                  }
                  title={
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: item.isRead ? 400 : 600 }}>{item.title}</span>
                    </div>
                  }
                  description={
                    <div>
                      <div style={{ fontSize: 13, color: "#666", marginBottom: 4 }}>{item.message}</div>
                      <div style={{ fontSize: 11, color: "#999" }}>{dayjs(item.createdAt).fromNow()}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ padding: "40px 0" }}>
            <Empty description="No notifications" />
          </div>
        )}
      </div>

      <div
        style={{
          padding: "8px 16px",
          borderTop: "1px solid #f0f0f0",
          textAlign: "center",
        }}
      >
        <Button type="link" size="small" href="/notifications" style={{ width: "100%" }}>
          View all
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown dropdownRender={() => content} trigger={["click"]} placement="bottomRight">
      <div style={{ cursor: "pointer", padding: "0 12px", display: "flex", alignItems: "center" }}>
        <Badge count={unreadCount} size="small" offset={[2, 0]}>
          <BellOutlined style={{ fontSize: 20, color: "rgba(255, 255, 255, 0.85)" }} />
        </Badge>
      </div>
    </Dropdown>
  );
}
