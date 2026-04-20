"use client";

import React from "react";
import { Row, Col, Card, Table } from "antd";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { formatCurrency } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface ReportLine {
  id: string;
  category: string;
  budget: number;
  actual: number;
  variance: number;
}

const mockReport: ReportLine[] = [
  {
    id: "1",
    category: "Revenue",
    budget: 500000,
    actual: 475000,
    variance: -25000,
  },
  {
    id: "2",
    category: "Cost of Goods Sold",
    budget: 200000,
    actual: 185000,
    variance: 15000,
  },
  {
    id: "3",
    category: "Salaries & Wages",
    budget: 150000,
    actual: 152000,
    variance: -2000,
  },
  {
    id: "4",
    category: "Rent & Utilities",
    budget: 30000,
    actual: 28500,
    variance: 1500,
  },
  {
    id: "5",
    category: "Marketing",
    budget: 25000,
    actual: 32000,
    variance: -7000,
  },
  {
    id: "6",
    category: "Software & Tools",
    budget: 15000,
    actual: 14200,
    variance: 800,
  },
  {
    id: "7",
    category: "Travel & Entertainment",
    budget: 10000,
    actual: 8900,
    variance: 1100,
  },
  {
    id: "8",
    category: "Depreciation",
    budget: 8000,
    actual: 8000,
    variance: 0,
  },
];

const columns: ColumnsType<ReportLine> = [
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
    render: (v: string) => (
      <span
        style={{
          color: "var(--color-on-surface)",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {v}
      </span>
    ),
  },
  {
    title: "Budget",
    dataIndex: "budget",
    key: "budget",
    width: 150,
    align: "right" as const,
    render: (v: number) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {formatCurrency(v)}
      </span>
    ),
  },
  {
    title: "Actual",
    dataIndex: "actual",
    key: "actual",
    width: 150,
    align: "right" as const,
    render: (v: number) => (
      <span
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          fontWeight: 600,
        }}
      >
        {formatCurrency(v)}
      </span>
    ),
  },
  {
    title: "Variance",
    dataIndex: "variance",
    key: "variance",
    width: 150,
    align: "right" as const,
    sorter: (a, b) => a.variance - b.variance,
    render: (v: number) => (
      <span
        style={{
          fontFamily: "var(--font-display)",
          color:
            v > 0
              ? "#6dd58c"
              : v < 0
                ? "#ffb4ab"
                : "var(--color-on-surface-variant)",
          fontWeight: 600,
        }}
      >
        {v > 0 ? "+" : ""}
        {formatCurrency(v)}
      </span>
    ),
  },
];

export default function FinanceReportsPage() {
  const totalBudget = mockReport.reduce((a, b) => a + b.budget, 0);
  const totalActual = mockReport.reduce((a, b) => a + b.actual, 0);

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Financial Reports"
        subtitle="Budget vs Actual — Q2 2026"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Reports" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <KpiCard title="Total Budget" value={formatCurrency(totalBudget)} />
        </Col>
        <Col xs={12} sm={8}>
          <KpiCard title="Total Actual" value={formatCurrency(totalActual)} />
        </Col>
        <Col xs={12} sm={8}>
          <KpiCard
            title="Net Variance"
            value={formatCurrency(totalBudget - totalActual)}
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
          dataSource={mockReport}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
