"use client";

import React from "react";
import { Card, Tag, Button, Space, Progress } from "antd";
import { PlusOutlined, TrophyOutlined, UserOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface Review {
  id: string;
  employee: string;
  department: string;
  period: string;
  score: number;
  status: string;
}

const mockReviews: Review[] = [
  {
    id: "1",
    employee: "Sarah Ahmed",
    department: "Engineering",
    period: "Q2 2025",
    score: 92,
    status: "COMPLETED",
  },
  {
    id: "2",
    employee: "James Wilson",
    department: "Engineering",
    period: "Q2 2025",
    score: 85,
    status: "COMPLETED",
  },
  {
    id: "3",
    employee: "Fatima Khan",
    department: "HR",
    period: "Q2 2025",
    score: 94,
    status: "COMPLETED",
  },
  {
    id: "4",
    employee: "Michael Chen",
    department: "Finance",
    period: "Q2 2025",
    score: 78,
    status: "IN_PROGRESS",
  },
  {
    id: "5",
    employee: "Priya Sharma",
    department: "Sales",
    period: "Q2 2025",
    score: 88,
    status: "PENDING",
  },
];

const statusMap: Record<string, string> = {
  COMPLETED: "success",
  IN_PROGRESS: "processing",
  PENDING: "warning",
};

const columns: ColumnsType<Review> = [
  {
    title: "Employee",
    key: "employee",
    render: (_, r) => (
      <Space>
        <UserOutlined style={{ color: "var(--color-primary)" }} />
        <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
          {r.employee}
        </span>
      </Space>
    ),
  },
  {
    title: "Department",
    dataIndex: "department",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface-variant)" }}>{v}</span>
    ),
  },
  {
    title: "Period",
    dataIndex: "period",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface-variant)" }}>{v}</span>
    ),
  },
  {
    title: "Score",
    dataIndex: "score",
    sorter: (a, b) => a.score - b.score,
    width: 200,
    render: (v: number) => (
      <Progress
        percent={v}
        size="small"
        strokeColor={{ "0%": "#c3f5ff", "100%": "#00e5ff" }}
        trailColor="rgba(61, 74, 99, 0.2)"
      />
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (s: string) => (
      <Tag color={statusMap[s] || "default"}>{s.replace("_", " ")}</Tag>
    ),
  },
];

export default function PerformancePage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Performance Reviews"
        subtitle="Track employee performance and review cycles"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Performance" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Review Cycle
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<Review>
          columns={columns}
          dataSource={mockReviews}
          rowKey="id"
        />
      </Card>
    </div>
  );
}
