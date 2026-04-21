"use client";

import React, { useState } from "react";
import { Button } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface Quotation {
  id: string;
  quoteNo: string;
  customer: string;
  items: number;
  total: number;
  validUntil: string;
  status: string;
}

const mockQuotes: Quotation[] = [
  {
    id: "1",
    quoteNo: "QT-2026-0018",
    customer: "Acme Corp",
    items: 4,
    total: 13750,
    validUntil: "2026-05-15",
    status: "pending",
  },
  {
    id: "2",
    quoteNo: "QT-2026-0019",
    customer: "TechStart Inc",
    items: 2,
    total: 85000,
    validUntil: "2026-05-01",
    status: "approved",
  },
  {
    id: "3",
    quoteNo: "QT-2026-0020",
    customer: "FinEdge",
    items: 3,
    total: 45000,
    validUntil: "2026-05-20",
    status: "draft",
  },
  {
    id: "4",
    quoteNo: "QT-2026-0021",
    customer: "GreenLogix",
    items: 5,
    total: 65000,
    validUntil: "2026-04-30",
    status: "expired",
  },
  {
    id: "5",
    quoteNo: "QT-2026-0022",
    customer: "BuildRight Co",
    items: 1,
    total: 28000,
    validUntil: "2026-05-10",
    status: "approved",
  },
];

export default function QuotationsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockQuotes.filter(
    (q) =>
      q.customer.toLowerCase().includes(search.toLowerCase()) ||
      q.quoteNo.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Quotation> = [
    {
      title: "Quote #",
      dataIndex: "quoteNo",
      key: "quoteNo",
      width: 150,
      render: (v: string) => (
        <span
          style={{
            color: "var(--color-primary)",
            fontFamily: "var(--font-display)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customer",
      key: "customer",
      width: 180,
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
      title: "Items",
      dataIndex: "items",
      key: "items",
      width: 80,
      render: (v: number) => (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {v}
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      width: 130,
      sorter: (a, b) => a.total - b.total,
      render: (v: number) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-primary)",
            fontWeight: 700,
          }}
        >
          {formatCurrency(v)}
        </span>
      ),
    },
    {
      title: "Valid Until",
      dataIndex: "validUntil",
      key: "valid",
      width: 120,
      render: (d: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {formatDate(d)}
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
      title: "",
      key: "actions",
      width: 50,
      render: () => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          style={{ color: "var(--color-on-surface-variant)" }}
        />
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Quotations"
        subtitle={`${filtered.length} quotes`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Sales", href: "/sales" },
          { label: "Quotations" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Create Quote
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search quotes..."
        showExport
      />
      <DataTable<Quotation>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
      />
    </div>
  );
}
