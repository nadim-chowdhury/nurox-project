"use client";

import React from "react";
import { Card, List, Typography, Space, Spin, Empty } from "antd";
import { HistoryOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useGetAuditLogsQuery } from "@/store/api/analyticsApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

export function ActivityFeed() {
  const { data, isLoading } = useGetAuditLogsQuery({ page: 1, limit: 10 });

  const getTypeColor = (action: string) => {
    if (action.includes('CREATE')) return '#6dd58c';
    if (action.includes('UPDATE')) return '#80d8ff';
    if (action.includes('DELETE')) return '#ffb4ab';
    return '#c3f5ff';
  };

  return (
    <Card
      title={
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-on-surface)",
            fontWeight: 600,
          }}
        >
          <HistoryOutlined style={{ color: "#e3eeff", marginRight: 8 }} />
          Recent Activity
        </span>
      }
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--ghost-border)",
        borderRadius: 4,
      }}
      styles={{ body: { padding: 0 } }}
    >
      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
      ) : data?.data?.length > 0 ? (
        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          {data.data.map((item: any, i: number) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 20px",
                borderBottom:
                  i < data.data.length - 1
                    ? "1px solid var(--ghost-border)"
                    : "none",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: getTypeColor(item.action),
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--color-on-surface)", fontSize: 13 }}>
                  {item.description}
                </div>
                <div style={{ color: "var(--color-on-surface-variant)", fontSize: 11 }}>
                   by {item.userId || 'System'} in {item.module}
                </div>
              </div>
              <span
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 11,
                  minWidth: 80,
                  textAlign: "right",
                }}
              >
                <ClockCircleOutlined style={{ marginRight: 4, fontSize: 10 }} />
                {dayjs(item.createdAt).fromNow()}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No activity logged" />
      )}
    </Card>
  );
}
