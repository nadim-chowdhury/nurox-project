"use client";

import React from "react";
import { Card, Badge, Typography, Spin, Empty, Button } from "antd";
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  BellOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useGetAlertsQuery } from "@/store/api/analyticsApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Text } = Typography;

export function AlertsPanel() {
  const { data, isLoading } = useGetAlertsQuery(undefined, {
    pollingInterval: 60000, // Poll every 60 seconds
  });

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
          <BellOutlined style={{ color: "#ffb347", marginRight: 8 }} />
          Priority Alerts
        </span>
      }
      extra={<Badge count={data?.length || 0} offset={[10, 0]} overflowCount={99} />}
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--ghost-border)",
        borderRadius: 4,
      }}
      styles={{ body: { padding: 0 } }}
    >
      {isLoading ? (
        <div style={{ padding: 40, textAlign: 'center' }}><Spin /></div>
      ) : data && data.length > 0 ? (
        <div>
          {data.map((alert: any) => (
            <div
              key={alert.id}
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--ghost-border)",
                display: "flex",
                gap: 12,
              }}
            >
              <div style={{ marginTop: 2 }}>
                {alert.type === 'error' ? (
                  <ExclamationCircleOutlined style={{ color: '#ffb4ab' }} />
                ) : (
                  <WarningOutlined style={{ color: '#ffb347' }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--color-on-surface)", fontSize: 13, fontWeight: 500 }}>
                  {alert.title}
                </div>
                <div style={{ color: "var(--color-on-surface-variant)", fontSize: 12, margin: '2px 0 4px' }}>
                  {alert.message}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-on-surface-variant)", opacity: 0.7 }}>
                  {dayjs(alert.createdAt).fromNow()}
                </div>
              </div>
            </div>
          ))}
          <div style={{ padding: '12px', textAlign: 'center' }}>
            <Button type="link" size="small">
              View All Alerts <RightOutlined />
            </Button>
          </div>
        </div>
      ) : (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          description="No urgent alerts" 
          style={{ padding: 20 }}
        />
      )}
    </Card>
  );
}
