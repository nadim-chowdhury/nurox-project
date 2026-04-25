"use client";

import React from "react";
import { Card, List, Tag, Typography, Empty, Button } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

const { Text } = Typography;

export function TasksWidget() {
  const router = useRouter();

  // Mock tasks data
  const tasks = [
    {
      id: "1",
      title: "Review Q1 Financials",
      project: "Annual Audit 2026",
      dueDate: dayjs().add(2, "d").toISOString(),
      priority: "high",
    },
    {
      id: "2",
      title: "Update Employee Handbook",
      project: "HR Compliance",
      dueDate: dayjs().add(5, "d").toISOString(),
      priority: "medium",
    },
    {
      id: "3",
      title: "Vendor Negotiation - AWS",
      project: "Infrastructure Optimization",
      dueDate: dayjs().subtract(1, "d").toISOString(),
      priority: "high",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "error";
      case "medium": return "warning";
      case "low": return "info";
      default: return "default";
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircleOutlined style={{ color: 'var(--color-primary)' }} />
          <span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>My Tasks</span>
        </div>
      }
      extra={
        <Button 
          type="link" 
          size="small" 
          onClick={() => router.push('/projects/tasks')}
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
      {tasks.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={tasks}
          renderItem={(item) => (
            <List.Item
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              actions={[
                <Tag color={getPriorityColor(item.priority)} key="priority">
                  {item.priority.toUpperCase()}
                </Tag>
              ]}
            >
              <List.Item.Meta
                title={
                  <Text strong style={{ color: 'var(--color-on-surface)', fontSize: 13 }}>
                    {item.title}
                  </Text>
                }
                description={
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.project}
                    </Text>
                    <Text 
                      style={{ 
                        fontSize: 11, 
                        color: dayjs(item.dueDate).isBefore(dayjs()) ? 'var(--color-error)' : 'var(--color-on-surface-variant)' 
                      }}
                    >
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      Due {dayjs(item.dueDate).format("MMM DD")}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No pending tasks" />
      )}
    </Card>
  );
}
