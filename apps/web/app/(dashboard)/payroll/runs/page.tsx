"use client";

import React from "react";
import { Card, Tag, Button } from "antd";
import { PlusOutlined, DollarOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface PayrollRun {
  id: string;
  period: string;
  employees: number;
  grossTotal: number;
  netTotal: number;
  status: string;
  processedAt: string;
}

const mockRuns: PayrollRun[] = [
  {
    id: "1",
    period: "Jun 2025",
    employees: 284,
    grossTotal: 620000,
    netTotal: 485200,
    status: "COMPLETED",
    processedAt: "2025-06-28",
  },
  {
    id: "2",
    period: "May 2025",
    employees: 280,
    grossTotal: 612000,
    netTotal: 478100,
    status: "COMPLETED",
    processedAt: "2025-05-28",
  },
  {
    id: "3",
    period: "Apr 2025",
    employees: 278,
    grossTotal: 608000,
    netTotal: 475000,
    status: "COMPLETED",
    processedAt: "2025-04-28",
  },
  {
    id: "4",
    period: "Jul 2025",
    employees: 284,
    grossTotal: 625000,
    netTotal: 0,
    status: "DRAFT",
    processedAt: "",
  },
];

const statusMap: Record<string, string> = {
  COMPLETED: "success",
  DRAFT: "warning",
  PROCESSING: "processing",
};

const columns: ColumnsType<PayrollRun> = [
  {
    title: "Period",
    dataIndex: "period",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Employees",
    dataIndex: "employees",
    render: (v: number) => (
      <span className="font-display" style={{ color: "var(--color-primary)" }}>
        {v}
      </span>
    ),
  },
  {
    title: "Gross Total",
    dataIndex: "grossTotal",
    sorter: (a, b) => a.grossTotal - b.grossTotal,
    render: (v: number) => (
      <span
        className="font-display"
        style={{ color: "var(--color-on-surface)" }}
      >
        ${v.toLocaleString()}
      </span>
    ),
  },
  {
    title: "Net Total",
    dataIndex: "netTotal",
    render: (v: number) => (
      <span
        className="font-display"
        style={{
          color:
            v > 0 ? "var(--color-success)" : "var(--color-on-surface-variant)",
        }}
      >
        {v > 0 ? `$${v.toLocaleString()}` : "—"}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (s: string) => <Tag color={statusMap[s] || "default"}>{s}</Tag>,
  },
  {
    title: "Processed",
    dataIndex: "processedAt",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {v
          ? new Date(v).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "—"}
      </span>
    ),
  },
];

export default function PayrollRunsPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Payroll Runs"
        subtitle="Process and manage monthly payroll cycles"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Payroll", href: "/payroll" },
          { label: "Runs" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Run
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<PayrollRun>
          columns={columns}
          dataSource={mockRuns}
          rowKey="id"
        />
      </Card>
    </div>
  );
}
