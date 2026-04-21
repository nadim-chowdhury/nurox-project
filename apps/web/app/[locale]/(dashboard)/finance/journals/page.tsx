"use client";

import React from "react";
import { Card, Tag, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface Journal {
  id: string;
  number: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  status: string;
}

const mockJournals: Journal[] = [
  {
    id: "1",
    number: "JE-2025-001",
    date: "2025-06-01",
    description: "Monthly rent payment",
    debit: 12000,
    credit: 12000,
    status: "POSTED",
  },
  {
    id: "2",
    number: "JE-2025-002",
    date: "2025-06-05",
    description: "Client payment received",
    debit: 45000,
    credit: 45000,
    status: "POSTED",
  },
  {
    id: "3",
    number: "JE-2025-003",
    date: "2025-06-15",
    description: "Salary disbursement",
    debit: 485200,
    credit: 485200,
    status: "POSTED",
  },
  {
    id: "4",
    number: "JE-2025-004",
    date: "2025-06-20",
    description: "Office supplies purchase",
    debit: 3200,
    credit: 3200,
    status: "DRAFT",
  },
  {
    id: "5",
    number: "JE-2025-005",
    date: "2025-06-28",
    description: "Quarterly tax provision",
    debit: 78000,
    credit: 78000,
    status: "PENDING",
  },
];

const statusMap: Record<string, string> = {
  POSTED: "success",
  DRAFT: "default",
  PENDING: "warning",
};

const columns: ColumnsType<Journal> = [
  {
    title: "Entry #",
    dataIndex: "number",
    render: (v: string) => (
      <span className="font-display" style={{ color: "var(--color-primary)" }}>
        {v}
      </span>
    ),
  },
  {
    title: "Date",
    dataIndex: "date",
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
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
    title: "Description",
    dataIndex: "description",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)" }}>{v}</span>
    ),
  },
  {
    title: "Debit",
    dataIndex: "debit",
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
    title: "Credit",
    dataIndex: "credit",
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
    title: "Status",
    dataIndex: "status",
    render: (s: string) => <Tag color={statusMap[s] || "default"}>{s}</Tag>,
  },
];

export default function JournalsPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Journal Entries"
        subtitle="General ledger journal entries and postings"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Journals" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Entry
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<Journal>
          columns={columns}
          dataSource={mockJournals}
          rowKey="id"
        />
      </Card>
    </div>
  );
}
