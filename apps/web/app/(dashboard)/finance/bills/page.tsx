"use client";

import React, { useState } from "react";
import { Button, Space } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface Bill {
  id: string;
  vendor: string;
  billNo: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: string;
  category: string;
}

const mockBills: Bill[] = [
  {
    id: "1",
    vendor: "AWS",
    billNo: "AWS-2026-04",
    issueDate: "2026-04-01",
    dueDate: "2026-04-30",
    amount: 4520,
    status: "unpaid",
    category: "Cloud Services",
  },
  {
    id: "2",
    vendor: "WeWork",
    billNo: "WW-2026-04",
    issueDate: "2026-04-01",
    dueDate: "2026-04-15",
    amount: 8500,
    status: "paid",
    category: "Office Rent",
  },
  {
    id: "3",
    vendor: "Figma Inc",
    billNo: "FIG-2026-Q2",
    issueDate: "2026-04-01",
    dueDate: "2026-06-30",
    amount: 1200,
    status: "unpaid",
    category: "Software",
  },
  {
    id: "4",
    vendor: "Office Depot",
    billNo: "OD-98234",
    issueDate: "2026-03-28",
    dueDate: "2026-04-10",
    amount: 650,
    status: "overdue",
    category: "Supplies",
  },
  {
    id: "5",
    vendor: "Google Workspace",
    billNo: "GW-2026-04",
    issueDate: "2026-04-01",
    dueDate: "2026-04-30",
    amount: 2100,
    status: "unpaid",
    category: "Software",
  },
  {
    id: "6",
    vendor: "Electric Co",
    billNo: "ELC-2026-03",
    issueDate: "2026-03-30",
    dueDate: "2026-04-20",
    amount: 890,
    status: "paid",
    category: "Utilities",
  },
];

export default function BillsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockBills.filter(
    (b) =>
      b.vendor.toLowerCase().includes(search.toLowerCase()) ||
      b.billNo.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Bill> = [
    {
      title: "Vendor",
      dataIndex: "vendor",
      key: "vendor",
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
      title: "Bill #",
      dataIndex: "billNo",
      key: "billNo",
      width: 150,
      render: (v: string) => (
        <span
          style={{
            color: "var(--color-primary)",
            fontSize: 13,
            fontFamily: "var(--font-display)",
          }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 140,
      render: (v: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Issue Date",
      dataIndex: "issueDate",
      key: "issue",
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
      title: "Due Date",
      dataIndex: "dueDate",
      key: "due",
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
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      sorter: (a, b) => a.amount - b.amount,
      render: (v: number) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-primary)",
            fontWeight: 600,
          }}
        >
          {formatCurrency(v)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: "",
      key: "actions",
      width: 80,
      align: "right" as const,
      render: () => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            style={{ color: "var(--color-on-surface-variant)" }}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            style={{ color: "var(--color-on-surface-variant)" }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Bills"
        subtitle={`${filtered.length} bills`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Bills" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Record Bill
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search vendors or bill numbers..."
        showExport
      />
      <DataTable<Bill> columns={columns} dataSource={filtered} rowKey="id" />
    </div>
  );
}
