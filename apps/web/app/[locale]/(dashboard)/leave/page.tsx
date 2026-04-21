"use client";

import React from "react";
import { Row, Col, Card, Table, Calendar, Badge } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface LeaveRequest {
  id: string;
  employee: string;
  type: string;
  from: string;
  to: string;
  days: number;
  status: string;
  reason: string;
}

const mockLeaves: LeaveRequest[] = [
  {
    id: "1",
    employee: "Sarah Ahmed",
    type: "Annual",
    from: "2026-04-25",
    to: "2026-04-28",
    days: 3,
    status: "approved",
    reason: "Family vacation",
  },
  {
    id: "2",
    employee: "Priya Sharma",
    type: "Sick",
    from: "2026-04-21",
    to: "2026-04-22",
    days: 2,
    status: "approved",
    reason: "Flu",
  },
  {
    id: "3",
    employee: "James Wilson",
    type: "Annual",
    from: "2026-05-01",
    to: "2026-05-05",
    days: 5,
    status: "pending",
    reason: "Personal trip",
  },
  {
    id: "4",
    employee: "Aisha Rahman",
    type: "Casual",
    from: "2026-04-28",
    to: "2026-04-28",
    days: 1,
    status: "pending",
    reason: "Personal errand",
  },
  {
    id: "5",
    employee: "Robert Taylor",
    type: "Sick",
    from: "2026-04-18",
    to: "2026-04-18",
    days: 1,
    status: "rejected",
    reason: "Doctor appointment",
  },
  {
    id: "6",
    employee: "Michael Chen",
    type: "Annual",
    from: "2026-05-10",
    to: "2026-05-15",
    days: 6,
    status: "pending",
    reason: "Wedding",
  },
];

const LEAVE_TYPE_COLORS: Record<string, string> = {
  Annual: "#80d8ff",
  Sick: "#ffb4ab",
  Casual: "#ffb347",
  Maternity: "#c3f5ff",
  Paternity: "#6dd58c",
};

const columns: ColumnsType<LeaveRequest> = [
  {
    title: "Employee",
    key: "employee",
    width: 200,
    render: (_, r) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={r.employee} size={32} />
        <span
          style={{
            color: "var(--color-on-surface)",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {r.employee}
        </span>
      </div>
    ),
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    width: 100,
    render: (t: string) => (
      <Badge
        color={LEAVE_TYPE_COLORS[t] || "#9aa5be"}
        text={
          <span
            style={{ color: LEAVE_TYPE_COLORS[t] || "#9aa5be", fontSize: 13 }}
          >
            {t}
          </span>
        }
      />
    ),
  },
  {
    title: "From",
    dataIndex: "from",
    key: "from",
    width: 130,
    render: (d: string) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {formatDate(d)}
      </span>
    ),
  },
  {
    title: "To",
    dataIndex: "to",
    key: "to",
    width: 130,
    render: (d: string) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {formatDate(d)}
      </span>
    ),
  },
  {
    title: "Days",
    dataIndex: "days",
    key: "days",
    width: 70,
    render: (d: number) => (
      <span
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-primary)",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {d}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 110,
    render: (s: string) => <StatusTag status={s} />,
  },
  {
    title: "Reason",
    dataIndex: "reason",
    key: "reason",
    width: 200,
    render: (r: string) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {r}
      </span>
    ),
  },
];

export default function LeavePage() {
  const pending = mockLeaves.filter((l) => l.status === "pending").length;
  const approved = mockLeaves.filter((l) => l.status === "approved").length;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Leave Management"
        subtitle="Overview of team leave requests"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Leave" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Pending Requests"
            value={`${pending}`}
            prefix={<ClockCircleOutlined style={{ color: "#ffb347" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Approved"
            value={`${approved}`}
            prefix={<CheckCircleOutlined style={{ color: "#6dd58c" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="On Leave Today"
            value="1"
            prefix={<CalendarOutlined style={{ color: "#80d8ff" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Rejected"
            value="1"
            prefix={<StopOutlined style={{ color: "#ffb4ab" }} />}
          />
        </Col>
      </Row>

      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={mockLeaves}
          rowKey="id"
          pagination={false}
          size="middle"
          style={{ background: "transparent" }}
        />
      </Card>
    </div>
  );
}
