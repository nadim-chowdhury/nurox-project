"use client";

import React from "react";
import { Row, Col, Card, Table, Tag, Progress } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface AttendanceRecord {
  id: string;
  employee: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: string;
}

const mockRecords: AttendanceRecord[] = [
  {
    id: "1",
    employee: "Sarah Ahmed",
    date: "2026-04-21",
    checkIn: "09:02 AM",
    checkOut: "06:10 PM",
    hours: 9.1,
    status: "present",
  },
  {
    id: "2",
    employee: "James Wilson",
    date: "2026-04-21",
    checkIn: "09:15 AM",
    checkOut: "06:00 PM",
    hours: 8.75,
    status: "present",
  },
  {
    id: "3",
    employee: "Fatima Khan",
    date: "2026-04-21",
    checkIn: "10:30 AM",
    checkOut: "05:45 PM",
    hours: 7.25,
    status: "late",
  },
  {
    id: "4",
    employee: "Michael Chen",
    date: "2026-04-21",
    checkIn: "—",
    checkOut: "—",
    hours: 0,
    status: "absent",
  },
  {
    id: "5",
    employee: "Priya Sharma",
    date: "2026-04-21",
    checkIn: "—",
    checkOut: "—",
    hours: 0,
    status: "on_leave",
  },
  {
    id: "6",
    employee: "David Miller",
    date: "2026-04-21",
    checkIn: "08:55 AM",
    checkOut: "05:50 PM",
    hours: 8.9,
    status: "present",
  },
  {
    id: "7",
    employee: "Aisha Rahman",
    date: "2026-04-21",
    checkIn: "09:00 AM",
    checkOut: "—",
    hours: 4.5,
    status: "in_progress",
  },
  {
    id: "8",
    employee: "Robert Taylor",
    date: "2026-04-21",
    checkIn: "09:05 AM",
    checkOut: "06:30 PM",
    hours: 9.4,
    status: "present",
  },
];

const columns: ColumnsType<AttendanceRecord> = [
  {
    title: "Employee",
    key: "employee",
    width: 220,
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
    title: "Date",
    dataIndex: "date",
    key: "date",
    width: 130,
    render: (d: string) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {formatDate(d)}
      </span>
    ),
  },
  {
    title: "Check In",
    dataIndex: "checkIn",
    key: "checkIn",
    width: 110,
    render: (v: string) => (
      <span
        style={{
          color: v === "—" ? "var(--color-on-surface-variant)" : "#6dd58c",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {v}
      </span>
    ),
  },
  {
    title: "Check Out",
    dataIndex: "checkOut",
    key: "checkOut",
    width: 110,
    render: (v: string) => (
      <span
        style={{
          color: v === "—" ? "var(--color-on-surface-variant)" : "#c3f5ff",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {v}
      </span>
    ),
  },
  {
    title: "Hours",
    dataIndex: "hours",
    key: "hours",
    width: 100,
    sorter: (a, b) => a.hours - b.hours,
    render: (h: number) => (
      <span
        style={{
          fontFamily: "var(--font-display)",
          color:
            h >= 8
              ? "#6dd58c"
              : h > 0
                ? "#ffb347"
                : "var(--color-on-surface-variant)",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {h > 0 ? `${h}h` : "—"}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (s: string) => <StatusTag status={s} />,
  },
];

export default function AttendancePage() {
  const present = mockRecords.filter((r) => r.status === "present").length;
  const late = mockRecords.filter((r) => r.status === "late").length;
  const absent = mockRecords.filter((r) => r.status === "absent").length;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Attendance"
        subtitle="Today's attendance overview"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Attendance" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Present"
            value={`${present}`}
            prefix={<CheckCircleOutlined style={{ color: "#6dd58c" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Late"
            value={`${late}`}
            prefix={<ClockCircleOutlined style={{ color: "#ffb347" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Absent"
            value={`${absent}`}
            prefix={<WarningOutlined style={{ color: "#ffb4ab" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="On Leave"
            value="1"
            prefix={<CalendarOutlined style={{ color: "#80d8ff" }} />}
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
          dataSource={mockRecords}
          rowKey="id"
          pagination={false}
          size="middle"
          style={{ background: "transparent" }}
        />
      </Card>
    </div>
  );
}
