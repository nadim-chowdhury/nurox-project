"use client";

import React from "react";
import { Row, Col, Card, Statistic, Table } from "antd";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { Avatar } from "@/components/common/Avatar";
import type { ColumnsType } from "antd/es/table";

interface AttendanceSummary {
  id: string;
  employee: string;
  present: number;
  late: number;
  absent: number;
  leaves: number;
  avgHours: number;
  percentage: number;
}

const mockSummary: AttendanceSummary[] = [
  {
    id: "1",
    employee: "Sarah Ahmed",
    present: 20,
    late: 1,
    absent: 0,
    leaves: 1,
    avgHours: 8.5,
    percentage: 95,
  },
  {
    id: "2",
    employee: "James Wilson",
    present: 19,
    late: 2,
    absent: 1,
    leaves: 0,
    avgHours: 8.2,
    percentage: 86,
  },
  {
    id: "3",
    employee: "Fatima Khan",
    present: 21,
    late: 0,
    absent: 0,
    leaves: 1,
    avgHours: 8.8,
    percentage: 95,
  },
  {
    id: "4",
    employee: "Michael Chen",
    present: 18,
    late: 3,
    absent: 1,
    leaves: 0,
    avgHours: 7.9,
    percentage: 82,
  },
  {
    id: "5",
    employee: "David Miller",
    present: 22,
    late: 0,
    absent: 0,
    leaves: 0,
    avgHours: 9.1,
    percentage: 100,
  },
  {
    id: "6",
    employee: "Aisha Rahman",
    present: 20,
    late: 1,
    absent: 0,
    leaves: 1,
    avgHours: 8.4,
    percentage: 91,
  },
];

const columns: ColumnsType<AttendanceSummary> = [
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
    title: "Present",
    dataIndex: "present",
    key: "present",
    width: 90,
    sorter: (a, b) => a.present - b.present,
    render: (v: number) => (
      <span
        style={{
          color: "#6dd58c",
          fontWeight: 600,
          fontFamily: "var(--font-display)",
        }}
      >
        {v}
      </span>
    ),
  },
  {
    title: "Late",
    dataIndex: "late",
    key: "late",
    width: 80,
    render: (v: number) => (
      <span
        style={{
          color: v > 0 ? "#ffb347" : "var(--color-on-surface-variant)",
          fontWeight: 600,
          fontFamily: "var(--font-display)",
        }}
      >
        {v}
      </span>
    ),
  },
  {
    title: "Absent",
    dataIndex: "absent",
    key: "absent",
    width: 80,
    render: (v: number) => (
      <span
        style={{
          color: v > 0 ? "#ffb4ab" : "var(--color-on-surface-variant)",
          fontWeight: 600,
          fontFamily: "var(--font-display)",
        }}
      >
        {v}
      </span>
    ),
  },
  {
    title: "Leaves",
    dataIndex: "leaves",
    key: "leaves",
    width: 80,
    render: (v: number) => (
      <span
        style={{
          color: "#80d8ff",
          fontWeight: 600,
          fontFamily: "var(--font-display)",
        }}
      >
        {v}
      </span>
    ),
  },
  {
    title: "Avg Hours",
    dataIndex: "avgHours",
    key: "avgHours",
    width: 100,
    sorter: (a, b) => a.avgHours - b.avgHours,
    render: (v: number) => (
      <span
        style={{
          color: "var(--color-on-surface)",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
        }}
      >
        {v}h
      </span>
    ),
  },
  {
    title: "Rate",
    dataIndex: "percentage",
    key: "percentage",
    width: 80,
    sorter: (a, b) => a.percentage - b.percentage,
    render: (v: number) => (
      <span
        style={{
          color: v >= 90 ? "#6dd58c" : v >= 80 ? "#ffb347" : "#ffb4ab",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
        }}
      >
        {v}%
      </span>
    ),
  },
];

export default function AttendanceReportsPage() {
  const avgRate = Math.round(
    mockSummary.reduce((a, b) => a + b.percentage, 0) / mockSummary.length,
  );

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Attendance Reports"
        subtitle="Monthly attendance summary"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Attendance", href: "/attendance" },
          { label: "Reports" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Avg Attendance Rate" value={`${avgRate}%`} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Total Working Days" value="22" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Avg Daily Hours" value="8.5h" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Employees Tracked" value={`${mockSummary.length}`} />
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
          dataSource={mockSummary}
          rowKey="id"
          pagination={false}
          size="middle"
          style={{ background: "transparent" }}
        />
      </Card>
    </div>
  );
}
