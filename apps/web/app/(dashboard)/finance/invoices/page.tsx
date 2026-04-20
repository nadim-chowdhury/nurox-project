"use client";

import React from "react";
import { Card, Tag, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: number;
  dueDate: string;
  status: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "INV-2025-001",
    customer: "Acme Corp",
    amount: 45000,
    dueDate: "2025-07-15",
    status: "PAID",
  },
  {
    id: "2",
    number: "INV-2025-002",
    customer: "TechFlow Inc",
    amount: 82000,
    dueDate: "2025-07-20",
    status: "SENT",
  },
  {
    id: "3",
    number: "INV-2025-003",
    customer: "GlobalTrade Ltd",
    amount: 28500,
    dueDate: "2025-06-30",
    status: "OVERDUE",
  },
  {
    id: "4",
    number: "INV-2025-004",
    customer: "DataSync Co",
    amount: 63000,
    dueDate: "2025-08-01",
    status: "DRAFT",
  },
  {
    id: "5",
    number: "INV-2025-005",
    customer: "CloudNine Solutions",
    amount: 125000,
    dueDate: "2025-07-25",
    status: "SENT",
  },
];

const statusMap: Record<string, string> = {
  PAID: "success",
  SENT: "processing",
  OVERDUE: "error",
  DRAFT: "default",
};

const columns: ColumnsType<Invoice> = [
  {
    title: "Invoice #",
    dataIndex: "number",
    render: (v: string) => (
      <span className="font-display" style={{ color: "var(--color-primary)" }}>
        {v}
      </span>
    ),
  },
  {
    title: "Customer",
    dataIndex: "customer",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    sorter: (a, b) => a.amount - b.amount,
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
    title: "Due Date",
    dataIndex: "dueDate",
    sorter: (a, b) =>
      new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {new Date(v).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    filters: [
      { text: "Paid", value: "PAID" },
      { text: "Sent", value: "SENT" },
      { text: "Overdue", value: "OVERDUE" },
      { text: "Draft", value: "DRAFT" },
    ],
    onFilter: (value, record) => record.status === value,
    render: (s: string) => <Tag color={statusMap[s] || "default"}>{s}</Tag>,
  },
];

export default function InvoicesPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Invoices"
        subtitle="Manage customer invoices and track payments"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Invoices" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Invoice
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<Invoice>
          columns={columns}
          dataSource={mockInvoices}
          rowKey="id"
        />
      </Card>
    </div>
  );
}
