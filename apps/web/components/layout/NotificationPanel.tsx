"use client";

import React from "react";
import { Badge, Popover, List, Button, Typography, Empty, Space } from "antd";
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import {
  markAsRead,
  markAllAsRead,
  removeNotification,
  type Notification,
} from "@/store/slices/notificationSlice";
import { formatDate } from "@/lib/utils";

const { Text } = Typography;

const TYPE_ICON: Record<Notification["type"], React.ReactNode> = {
  info: <InfoCircleOutlined style={{ color: "#c3f5ff" }} />,
  success: <CheckCircleOutlined style={{ color: "#6dd58c" }} />,
  warning: <WarningOutlined style={{ color: "#ffb347" }} />,
  error: <CloseCircleOutlined style={{ color: "#ffb4ab" }} />,
};

function NotificationContent() {
  const dispatch = useAppDispatch();
  const { items, unreadCount } = useAppSelector((s) => s.notifications);

  if (items.length === 0) {
    return (
      <div style={{ padding: "24px 16px", textAlign: "center" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Text style={{ color: "var(--color-on-surface-variant)" }}>
              No notifications
            </Text>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ width: 360, maxHeight: 420, overflow: "auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid var(--ghost-border)",
        }}
      >
        <Text strong style={{ color: "var(--color-on-surface)", fontSize: 14 }}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        {unreadCount > 0 && (
          <Button
            type="link"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => dispatch(markAllAsRead())}
            style={{ color: "var(--color-primary)", fontSize: 12 }}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      <List
        dataSource={items}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: "12px 16px",
              cursor: "pointer",
              background: item.read
                ? "transparent"
                : "rgba(195, 245, 255, 0.03)",
              transition: "background 0.15s ease",
            }}
            onClick={() => !item.read && dispatch(markAsRead(item.id))}
            actions={[
              <Button
                key="delete"
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(removeNotification(item.id));
                }}
                style={{ color: "var(--color-on-surface-variant)" }}
              />,
            ]}
          >
            <List.Item.Meta
              avatar={TYPE_ICON[item.type]}
              title={
                <Space size={4}>
                  <Text
                    style={{
                      color: "var(--color-on-surface)",
                      fontSize: 13,
                      fontWeight: item.read ? 400 : 600,
                    }}
                  >
                    {item.title}
                  </Text>
                  {!item.read && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                        display: "inline-block",
                      }}
                    />
                  )}
                </Space>
              }
              description={
                <div>
                  <Text
                    style={{
                      color: "var(--color-on-surface-variant)",
                      fontSize: 12,
                      display: "block",
                    }}
                  >
                    {item.message}
                  </Text>
                  <Text
                    style={{
                      color: "var(--color-on-surface-variant)",
                      fontSize: 11,
                      opacity: 0.7,
                    }}
                  >
                    {formatDate(item.createdAt, {
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
}

export function NotificationPanel() {
  const unreadCount = useAppSelector((s) => s.notifications.unreadCount);

  return (
    <Popover
      content={<NotificationContent />}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      styles={{
        body: {
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          padding: 0,
        },
      }}
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={
            <BellOutlined
              style={{
                fontSize: 18,
                color: "var(--color-on-surface-variant)",
              }}
            />
          }
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        />
      </Badge>
    </Popover>
  );
}
