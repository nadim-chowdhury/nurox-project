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

interface Order {
  id: string;
  orderNo: string;
  customer: string;
  items: number;
  total: number;
  orderDate: string;
  deliveryDate: string;
  status: string;
}

const mockOrders: Order[] = [
  {
    id: "1",
    orderNo: "SO-2026-0102",
    customer: "Acme Corp",
    items: 4,
    total: 13750,
    orderDate: "2026-04-15",
    deliveryDate: "2026-04-30",
    status: "completed",
  },
  {
    id: "2",
    orderNo: "SO-2026-0103",
    customer: "TechStart Inc",
    items: 2,
    total: 85000,
    orderDate: "2026-04-16",
    deliveryDate: "2026-05-10",
    status: "in_progress",
  },
  {
    id: "3",
    orderNo: "SO-2026-0104",
    customer: "FinEdge",
    items: 3,
    total: 42000,
    orderDate: "2026-04-18",
    deliveryDate: "2026-05-15",
    status: "pending",
  },
  {
    id: "4",
    orderNo: "SO-2026-0105",
    customer: "GreenLogix",
    items: 1,
    total: 12500,
    orderDate: "2026-04-19",
    deliveryDate: "2026-04-25",
    status: "completed",
  },
  {
    id: "5",
    orderNo: "SO-2026-0106",
    customer: "NovaHealth",
    items: 6,
    total: 58000,
    orderDate: "2026-04-20",
    deliveryDate: "2026-05-20",
    status: "in_progress",
  },
  {
    id: "6",
    orderNo: "SO-2026-0107",
    customer: "BuildRight Co",
    items: 2,
    total: 28000,
    orderDate: "2026-04-21",
    deliveryDate: "2026-05-05",
    status: "cancelled",
  },
];

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const filtered = mockOrders.filter(
    (o) =>
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNo.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Order> = [
    {
      title: "Order #",
      dataIndex: "orderNo",
      key: "order",
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
      width: 160,
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
      width: 70,
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
      title: "Order Date",
      dataIndex: "orderDate",
      key: "order_date",
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
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
        title="Sales Orders"
        subtitle={`${filtered.length} orders`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Sales", href: "/sales" },
          { label: "Orders" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Create Order
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search orders..."
        showExport
      />
      <DataTable<Order> columns={columns} dataSource={filtered} rowKey="id" />
    </div>
  );
}
