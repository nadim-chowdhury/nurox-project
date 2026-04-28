"use client";

import React from "react";
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  Row,
  Col,
  Progress,
} from "antd";
import {
  ArrowLeftOutlined,
  UserAddOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface Task {
  id: string;
  title: string;
  assignee: string;
  priority: string;
  status: string;
  dueDate: string;
}

const mockProject = {
  id: "1",
  name: "Nurox ERP v2.0",
  client: "Internal",
  status: "in_progress",
  startDate: "2026-01-15",
  endDate: "2026-07-31",
  progress: 42,
  team: 6,
  totalTasks: 64,
  completedTasks: 27,
};

const mockTasks: Task[] = [
  {
    id: "1",
    title: "Implement employee CRUD",
    assignee: "Sarah Ahmed",
    priority: "high",
    status: "completed",
    dueDate: "2026-04-15",
  },
  {
    id: "2",
    title: "Build payroll engine",
    assignee: "James Wilson",
    priority: "critical",
    status: "in_progress",
    dueDate: "2026-04-25",
  },
  {
    id: "3",
    title: "Design invoice templates",
    assignee: "Aisha Rahman",
    priority: "medium",
    status: "in_progress",
    dueDate: "2026-04-28",
  },
  {
    id: "4",
    title: "Integrate payment gateway",
    assignee: "Michael Chen",
    priority: "high",
    status: "not_started",
    dueDate: "2026-05-05",
  },
  {
    id: "5",
    title: "Write API documentation",
    assignee: "Fatima Khan",
    priority: "low",
    status: "not_started",
    dueDate: "2026-05-10",
  },
  {
    id: "6",
    title: "Performance testing",
    assignee: "David Miller",
    priority: "medium",
    status: "not_started",
    dueDate: "2026-05-15",
  },
];

const taskColumns: ColumnsType<Task> = [
  {
    title: "Task",
    dataIndex: "title",
    key: "title",
    render: (v: string) => (
      <span
        style={{
          color: "var(--color-on-surface)",
          fontWeight: 500,
          fontSize: 13,
        }}
      >
        {v}
      </span>
    ),
  },
  {
    title: "Assignee",
    key: "assignee",
    width: 180,
    render: (_, r) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Avatar name={r.assignee} size={28} />
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {r.assignee}
        </span>
      </div>
    ),
  },
  {
    title: "Priority",
    dataIndex: "priority",
    key: "priority",
    width: 100,
    render: (p: string) => <StatusTag status={p} />,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (s: string) => <StatusTag status={s} />,
  },
  {
    title: "Due Date",
    dataIndex: "dueDate",
    key: "due",
    width: 120,
    render: (d: string) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {formatDate(d)}
      </span>
    ),
  },
];

export default function ProjectDetailPage() {
  const _params = useParams();
  const router = useRouter();
  const p = mockProject;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={p.name}
        subtitle={`Client: ${p.client}`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Projects", href: "/projects" },
          { label: p.name },
        ]}
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/projects")}
            >
              Back
            </Button>
            <Button icon={<UserAddOutlined />}>Add Member</Button>
            <Button type="primary" icon={<PlusOutlined />}>
              Add Task
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Progress" value={`${p.progress}%`} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Tasks"
            value={`${p.completedTasks}/${p.totalTasks}`}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Team Members" value={`${p.team}`} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Status"
            value={p.status.replace("_", " ").toUpperCase()}
          />
        </Col>
      </Row>

      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          marginBottom: 24,
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Row gutter={24} align="middle">
          <Col flex="auto">
            <Descriptions
              column={{ xs: 1, sm: 3 }}
              labelStyle={{
                color: "var(--color-on-surface-variant)",
                fontSize: 13,
              }}
              contentStyle={{ color: "var(--color-on-surface)", fontSize: 13 }}
            >
              <Descriptions.Item label="Start Date">
                {formatDate(p.startDate)}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {formatDate(p.endDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <StatusTag status={p.status} />
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: "center" }}>
              <Progress
                type="circle"
                percent={p.progress}
                size={80}
                strokeColor="#c3f5ff"
                trailColor="rgba(195,245,255,0.1)"
                format={(pct) => (
                  <span
                    style={{
                      color: "var(--color-on-surface)",
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                    }}
                  >
                    {pct}%
                  </span>
                )}
              />
            </div>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-on-surface)",
              fontWeight: 600,
            }}
          >
            Tasks
          </span>
        }
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={taskColumns}
          dataSource={mockTasks}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
