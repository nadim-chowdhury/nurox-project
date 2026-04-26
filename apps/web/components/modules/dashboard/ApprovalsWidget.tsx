"use client";

import React from "react";
import { Card, List, Avatar, Typography, Empty, Button, Space, Tag } from "antd";
import { AuditOutlined, ArrowRightOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const { Text } = Typography;

export function ApprovalsWidget() {
  const router = useRouter();

  // Mock approvals data
  const approvals = [
    {
      id: "1",
      type: "Leave Request",
      requester: "Sarah Jenkins",
      details: "Annual Leave (3 days)",
      date: dayjs().subtract(2, "h").toISOString(),
      category: "hr",
    },
    {
      id: "2",
      type: "Purchase Order",
      requester: "Michael Chen",
      details: "PO-2026-042: Dell XPS 15 (x2)",
      date: dayjs().subtract(5, "h").toISOString(),
      category: "procurement",
    },
    {
      id: "3",
      type: "Expense Claim",
      requester: "David Miller",
      details: "Client Lunch - $145.00",
      date: dayjs().subtract(1, "d").toISOString(),
      category: "finance",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "hr": return "blue";
      case "finance": return "green";
      case "procurement": return "orange";
      default: return "default";
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AuditOutlined style={{ color: 'var(--color-primary)' }} />
          <span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Pending Approvals</span>
        </div>
      }
      extra={
        <Button 
          type="link" 
          size="small" 
          onClick={() => router.push('/approvals')}
          style={{ padding: 0 }}
        >
          View All <ArrowRightOutlined />
        </Button>
      }
      style={{ 
        background: 'var(--color-surface)', 
        border: '1px solid var(--ghost-border)',
        height: '100%'
      }}
      styles={{ body: { padding: '12px 24px' } }}
    >
      {approvals.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={approvals}
          renderItem={(item) => (
            <List.Item
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              actions={[
                <Space key="actions">
                  <Button size="small" type="text" icon={<CheckOutlined style={{ color: 'var(--color-success)' }} />} />
                  <Button size="small" type="text" icon={<CloseOutlined style={{ color: 'var(--color-error)' }} />} />
                </Space>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-on-surface-variant)' }}>
                    {item.requester[0]}
                  </Avatar>
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text strong style={{ color: 'var(--color-on-surface)', fontSize: 13 }}>
                      {item.type}
                    </Text>
                    <Tag color={getCategoryColor(item.category)} style={{ fontSize: 10, lineHeight: '16px' }}>
                      {item.category.toUpperCase()}
                    </Tag>
                  </div>
                }
                description={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.requester} · {item.details}
                    </Text>
                    <Text style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', opacity: 0.7 }}>
                      {dayjs(item.date).fromNow()}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No pending approvals" />
      )}
    </Card>
  );
}
