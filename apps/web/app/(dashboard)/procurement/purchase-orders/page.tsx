"use client";

import React, { useState } from "react";
import { Button, Space } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendor: string;
  date: string;
  deliveryDate: string;
  total: number;
  status: string;
  items: number;
}

const mockPOs: PurchaseOrder[] = [
  {
    id: "1",
    poNumber: "PO-2026-0034",
    vendor: "Dell Technologies",
    date: "2026-04-15",
    deliveryDate: "2026-05-01",
    total: 42000,
    status: "approved",
    items: 12,
  },
  {
    id: "2",
    poNumber: "PO-2026-0035",
    vendor: "Staples",
    date: "2026-04-16",
    deliveryDate: "2026-04-25",
    total: 3200,
    status: "pending",
    items: 8,
  },
  {
    id: "3",
    poNumber: "PO-2026-0036",
    vendor: "Amazon Business",
    date: "2026-04-17",
    deliveryDate: "2026-04-22",
    total: 1850,
    status: "completed",
    items: 5,
  },
  {
    id: "4",
    poNumber: "PO-2026-0037",
    vendor: "Cisco Systems",
    date: "2026-04-18",
    deliveryDate: "2026-05-10",
    total: 28500,
    status: "draft",
    items: 3,
  },
  {
    id: "5",
    poNumber: "PO-2026-0038",
    vendor: "HP Enterprise",
    date: "2026-04-19",
    deliveryDate: "2026-05-05",
    total: 15600,
    status: "approved",
    items: 6,
  },
];

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const filtered = mockPOs.filter(
    (p) =>
      p.vendor.toLowerCase().includes(search.toLowerCase()) ||
      p.poNumber.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: "PO #",
      dataIndex: "poNumber",
      key: "po",
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
      title: "Delivery",
      dataIndex: "deliveryDate",
      key: "delivery",
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
      render: (_, r) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => router.push(`/procurement/purchase-orders/${r.id}`)}
          style={{ color: "var(--color-on-surface-variant)" }}
        />
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Purchase Orders"
        subtitle={`${filtered.length} orders`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Procurement", href: "/procurement" },
          { label: "Purchase Orders" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Create PO
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search POs or vendors..."
        showExport
      />
      <DataTable<PurchaseOrder>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
      />
    </div>
  );
}
