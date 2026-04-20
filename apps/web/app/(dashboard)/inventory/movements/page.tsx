"use client";

import React, { useState } from "react";
import { Button } from "antd";
import { PlusOutlined, EyeOutlined, SwapOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface Movement {
  id: string;
  reference: string;
  product: string;
  from: string;
  to: string;
  qty: number;
  type: string;
  date: string;
  status: string;
}

const mockMovements: Movement[] = [
  {
    id: "1",
    reference: "MV-001",
    product: 'MacBook Pro 16"',
    from: "Main Warehouse",
    to: "IT Department",
    qty: 5,
    type: "transfer",
    date: "2026-04-21",
    status: "completed",
  },
  {
    id: "2",
    reference: "MV-002",
    product: "Office Chairs",
    from: "Supplier",
    to: "Main Warehouse",
    qty: 20,
    type: "receipt",
    date: "2026-04-20",
    status: "completed",
  },
  {
    id: "3",
    reference: "MV-003",
    product: "Server Rack",
    from: "Main Warehouse",
    to: "Data Center",
    qty: 2,
    type: "transfer",
    date: "2026-04-20",
    status: "in_progress",
  },
  {
    id: "4",
    reference: "MV-004",
    product: "Standing Desks",
    from: "Supplier",
    to: "Branch Office",
    qty: 10,
    type: "receipt",
    date: "2026-04-19",
    status: "pending",
  },
  {
    id: "5",
    reference: "MV-005",
    product: 'Monitors 27"',
    from: "Main Warehouse",
    to: "Customer",
    qty: 8,
    type: "dispatch",
    date: "2026-04-18",
    status: "completed",
  },
];

export default function MovementsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockMovements.filter(
    (m) =>
      m.product.toLowerCase().includes(search.toLowerCase()) ||
      m.reference.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Movement> = [
    {
      title: "Ref",
      dataIndex: "reference",
      key: "ref",
      width: 100,
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
      title: "Product",
      dataIndex: "product",
      key: "product",
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
      title: "From",
      dataIndex: "from",
      key: "from",
      width: 150,
      render: (v: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "To",
      dataIndex: "to",
      key: "to",
      width: 150,
      render: (v: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      key: "qty",
      width: 70,
      render: (v: number) => (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {v}
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (t: string) => <StatusTag status={t} />,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
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
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Stock Movements"
        subtitle={`${filtered.length} movements`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Inventory", href: "/inventory" },
          { label: "Movements" },
        ]}
        extra={
          <Button type="primary" icon={<SwapOutlined />}>
            New Movement
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search movements..."
        showExport
      />
      <DataTable<Movement>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
      />
    </div>
  );
}
