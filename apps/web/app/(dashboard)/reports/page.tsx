"use client";

import React from "react";
import { Row, Col, Card, Table, Progress } from "antd";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface DepartmentReport {
  id: string;
  department: string;
  headcount: number;
  budget: number;
  spent: number;
  openPositions: number;
  avgAttendance: number;
}

const mockDeptReport: DepartmentReport[] = [
  {
    id: "1",
    department: "Engineering",
    headcount: 18,
    budget: 2400000,
    spent: 1850000,
    openPositions: 3,
    avgAttendance: 94,
  },
  {
    id: "2",
    department: "Sales & Marketing",
    headcount: 12,
    budget: 1200000,
    spent: 980000,
    openPositions: 2,
    avgAttendance: 91,
  },
  {
    id: "3",
    department: "Finance",
    headcount: 8,
    budget: 800000,
    spent: 720000,
    openPositions: 1,
    avgAttendance: 96,
  },
  {
    id: "4",
    department: "Human Resources",
    headcount: 5,
    budget: 500000,
    spent: 480000,
    openPositions: 0,
    avgAttendance: 98,
  },
  {
    id: "5",
    department: "Operations",
    headcount: 10,
    budget: 900000,
    spent: 810000,
    openPositions: 1,
    avgAttendance: 93,
  },
];

const columns: ColumnsType<DepartmentReport> = [
  {
    title: "Department",
    dataIndex: "department",
    key: "dept",
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
    title: "Headcount",
    dataIndex: "headcount",
    key: "head",
    width: 100,
    sorter: (a, b) => a.headcount - b.headcount,
    render: (v: number) => (
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Budget",
    dataIndex: "budget",
    key: "budget",
    width: 140,
    render: (v: number) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {formatCurrency(v)}
      </span>
    ),
  },
  {
    title: "Spent",
    dataIndex: "spent",
    key: "spent",
    width: 140,
    render: (v: number, r) => (
      <div>
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-on-surface)",
            fontWeight: 600,
          }}
        >
          {formatCurrency(v)}
        </span>
        <Progress
          percent={Math.round((v / r.budget) * 100)}
          size="small"
          showInfo={false}
          strokeColor={v / r.budget > 0.9 ? "#ffb4ab" : "#6dd58c"}
          style={{ marginTop: 4 }}
        />
      </div>
    ),
  },
  {
    title: "Open Roles",
    dataIndex: "openPositions",
    key: "open",
    width: 100,
    render: (v: number) => (
      <span
        style={{
          fontFamily: "var(--font-display)",
          color: v > 0 ? "#ffb347" : "#6dd58c",
          fontWeight: 600,
        }}
      >
        {v}
      </span>
    ),
  },
  {
    title: "Attendance",
    dataIndex: "avgAttendance",
    key: "att",
    width: 100,
    sorter: (a, b) => a.avgAttendance - b.avgAttendance,
    render: (v: number) => (
      <span
        style={{
          fontFamily: "var(--font-display)",
          color: v >= 95 ? "#6dd58c" : v >= 90 ? "#ffb347" : "#ffb4ab",
          fontWeight: 600,
        }}
      >
        {v}%
      </span>
    ),
  },
];

export default function ReportsPage() {
  const totalHead = mockDeptReport.reduce((a, b) => a + b.headcount, 0);
  const totalBudget = mockDeptReport.reduce((a, b) => a + b.budget, 0);

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Reports"
        subtitle="Organization-wide reports & analytics"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Reports" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Total Headcount" value={`${totalHead}`} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Total Budget" value={formatCurrency(totalBudget)} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Avg Attendance" value="94%" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Open Positions" value="7" />
        </Col>
      </Row>

      <Card
        title={
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-on-surface)",
              fontWeight: 600,
            }}
          >
            Department Overview
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
          columns={columns}
          dataSource={mockDeptReport}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
