"use client";

import React from "react";
import { Card, Tag, Button, Avatar, Space, Progress } from "antd";
import { PlusOutlined, ProjectOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface Task {
  id: string;
  title: string;
  project: string;
  assignee: string;
  priority: string;
  status: string;
  dueDate: string;
}

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Design system audit",
    project: "Nurox v2",
    assignee: "Sarah Ahmed",
    priority: "HIGH",
    status: "IN_PROGRESS",
    dueDate: "2025-07-10",
  },
  {
    id: "2",
    title: "API rate limiting",
    project: "Nurox v2",
    assignee: "James Wilson",
    priority: "CRITICAL",
    status: "TODO",
    dueDate: "2025-07-05",
  },
  {
    id: "3",
    title: "User onboarding flow",
    project: "Mobile App",
    assignee: "Fatima Khan",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    dueDate: "2025-07-15",
  },
  {
    id: "4",
    title: "Performance testing",
    project: "Nurox v2",
    assignee: "Aisha Rahman",
    priority: "HIGH",
    status: "TODO",
    dueDate: "2025-07-12",
  },
  {
    id: "5",
    title: "Export to PDF",
    project: "Reports Module",
    assignee: "Michael Chen",
    priority: "LOW",
    status: "DONE",
    dueDate: "2025-06-28",
  },
  {
    id: "6",
    title: "SSO integration",
    project: "Auth Platform",
    assignee: "Priya Sharma",
    priority: "CRITICAL",
    status: "IN_REVIEW",
    dueDate: "2025-07-08",
  },
];

const priorityMap: Record<string, string> = {
  CRITICAL: "red",
  HIGH: "orange",
  MEDIUM: "blue",
  LOW: "default",
};
const statusMap: Record<string, string> = {
  TODO: "default",
  IN_PROGRESS: "processing",
  IN_REVIEW: "warning",
  DONE: "success",
};

const columns: ColumnsType<Task> = [
  {
    title: "Task",
    dataIndex: "title",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Project",
    dataIndex: "project",
    filters: [
      { text: "Nurox v2", value: "Nurox v2" },
      { text: "Mobile App", value: "Mobile App" },
      { text: "Reports Module", value: "Reports Module" },
      { text: "Auth Platform", value: "Auth Platform" },
    ],
    onFilter: (value, record) => record.project === value,
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface-variant)" }}>{v}</span>
    ),
  },
  {
    title: "Assignee",
    dataIndex: "assignee",
    render: (v: string) => (
      <Space>
        <Avatar
          size={24}
          style={{
            background: "linear-gradient(135deg, #c3f5ff, #00e5ff)",
            color: "#003c4a",
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          {v
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Avatar>
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {v}
        </span>
      </Space>
    ),
  },
  {
    title: "Priority",
    dataIndex: "priority",
    render: (p: string) => <Tag color={priorityMap[p] || "default"}>{p}</Tag>,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (s: string) => (
      <Tag color={statusMap[s] || "default"}>{s.replace(/_/g, " ")}</Tag>
    ),
  },
  {
    title: "Due Date",
    dataIndex: "dueDate",
    sorter: (a, b) =>
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    render: (v: string) => {
      const isOverdue = new Date(v) < new Date();
      return (
        <span
          style={{
            color: isOverdue
              ? "var(--color-error)"
              : "var(--color-on-surface-variant)",
            fontSize: 13,
          }}
        >
          {new Date(v).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      );
    },
  },
];

export default function TasksPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Tasks"
        subtitle="Track tasks across all projects"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Projects", href: "/projects" },
          { label: "Tasks" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Task
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<Task> columns={columns} dataSource={mockTasks} rowKey="id" />
      </Card>
    </div>
  );
}
