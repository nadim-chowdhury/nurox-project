"use client";

import React, { useState } from "react";
import { Button, Space } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface Requisition {
  id: string;
  title: string;
  requestedBy: string;
  department: string;
  priority: string;
  date: string;
  status: string;
}

const mockReqs: Requisition[] = [
  {
    id: "PR-001",
    title: "New Laptops for Engineering",
    requestedBy: "Sarah Ahmed",
    department: "Engineering",
    priority: "high",
    date: "2026-04-19",
    status: "approved",
  },
  {
    id: "PR-002",
    title: "Office Furniture Replacement",
    requestedBy: "David Miller",
    department: "Operations",
    priority: "medium",
    date: "2026-04-18",
    status: "pending",
  },
  {
    id: "PR-003",
    title: "Marketing Collateral Printing",
    requestedBy: "Priya Sharma",
    department: "Sales & Marketing",
    priority: "low",
    date: "2026-04-17",
    status: "pending",
  },
  {
    id: "PR-004",
    title: "Server Rack Upgrade",
    requestedBy: "James Wilson",
    department: "Engineering",
    priority: "critical",
    date: "2026-04-15",
    status: "approved",
  },
  {
    id: "PR-005",
    title: "Safety Equipment",
    requestedBy: "Fatima Khan",
    department: "HR",
    priority: "medium",
    date: "2026-04-14",
    status: "rejected",
  },
];

export default function RequisitionsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockReqs.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Requisition> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (v: string) => (
        <span
          style={{
            color: "var(--color-primary)",
            fontFamily: "var(--font-display)",
            fontSize: 13,
          }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
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
      title: "Requested By",
      key: "requestedBy",
      width: 180,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={r.requestedBy} size={28} />
          <span
            style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
          >
            {r.requestedBy}
          </span>
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (p: string) => <StatusTag status={p} />,
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
        title="Purchase Requisitions"
        subtitle={`${filtered.length} requisitions`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Procurement", href: "/procurement" },
          { label: "Requisitions" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Requisition
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search requisitions..."
      />
      <DataTable<Requisition>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
      />
    </div>
  );
}
