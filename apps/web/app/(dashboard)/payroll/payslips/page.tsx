"use client";

import React from "react";
import { Card, Tag, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface Payslip {
  id: string;
  employee: string;
  period: string;
  grossPay: number;
  netPay: number;
  status: string;
}

const mockPayslips: Payslip[] = [
  {
    id: "1",
    employee: "Sarah Ahmed",
    period: "Jun 2025",
    grossPay: 10500,
    netPay: 8700,
    status: "ISSUED",
  },
  {
    id: "2",
    employee: "James Wilson",
    period: "Jun 2025",
    grossPay: 7000,
    netPay: 5800,
    status: "ISSUED",
  },
  {
    id: "3",
    employee: "Fatima Khan",
    period: "Jun 2025",
    grossPay: 12000,
    netPay: 9900,
    status: "ISSUED",
  },
  {
    id: "4",
    employee: "Michael Chen",
    period: "Jun 2025",
    grossPay: 7000,
    netPay: 5800,
    status: "DRAFT",
  },
  {
    id: "5",
    employee: "Priya Sharma",
    period: "Jun 2025",
    grossPay: 3800,
    netPay: 3200,
    status: "DRAFT",
  },
];

const statusMap: Record<string, string> = {
  ISSUED: "success",
  DRAFT: "warning",
};

const columns: ColumnsType<Payslip> = [
  {
    title: "Employee",
    dataIndex: "employee",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
        {v}
      </span>
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
    title: "Gross Pay",
    dataIndex: "grossPay",
    align: "right" as const,
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
    title: "Net Pay",
    dataIndex: "netPay",
    sorter: (a, b) => a.netPay - b.netPay,
    align: "right" as const,
    render: (v: number) => (
      <span className="font-display" style={{ color: "var(--color-success)" }}>
        ${v.toLocaleString()}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (s: string) => <Tag color={statusMap[s] || "default"}>{s}</Tag>,
  },
];

export default function PayslipsPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Payslips"
        subtitle="View and manage employee payslips"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Payroll", href: "/payroll" },
          { label: "Payslips" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Generate Payslips
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<Payslip>
          columns={columns}
          dataSource={mockPayslips}
          rowKey="id"
        />
      </Card>
    </div>
  );
}
