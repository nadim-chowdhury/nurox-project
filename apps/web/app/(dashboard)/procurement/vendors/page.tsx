"use client";

import React, { useState } from "react";
import { Button, Space } from "antd";
import { PlusOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCurrency } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  category: string;
  totalOrders: number;
  totalSpend: number;
  rating: number;
  status: string;
}

const mockVendors: Vendor[] = [
  {
    id: "1",
    name: "Dell Technologies",
    contact: "John Smith",
    email: "sales@dell.com",
    category: "IT Hardware",
    totalOrders: 15,
    totalSpend: 285000,
    rating: 4.5,
    status: "active",
  },
  {
    id: "2",
    name: "AWS",
    contact: "Cloud Team",
    email: "enterprise@aws.com",
    category: "Cloud Services",
    totalOrders: 12,
    totalSpend: 54240,
    rating: 4.8,
    status: "active",
  },
  {
    id: "3",
    name: "Staples",
    contact: "Lisa Wong",
    email: "orders@staples.com",
    category: "Office Supplies",
    totalOrders: 24,
    totalSpend: 18500,
    rating: 4.0,
    status: "active",
  },
  {
    id: "4",
    name: "WeWork",
    contact: "Membership",
    email: "billing@wework.com",
    category: "Real Estate",
    totalOrders: 12,
    totalSpend: 102000,
    rating: 3.8,
    status: "active",
  },
  {
    id: "5",
    name: "Cisco Systems",
    contact: "Enterprise Sales",
    email: "sales@cisco.com",
    category: "Networking",
    totalOrders: 5,
    totalSpend: 72000,
    rating: 4.2,
    status: "active",
  },
  {
    id: "6",
    name: "Old Vendor Co",
    contact: "N/A",
    email: "info@old.com",
    category: "General",
    totalOrders: 2,
    totalSpend: 3200,
    rating: 2.5,
    status: "inactive",
  },
];

export default function VendorsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockVendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Vendor> = [
    {
      title: "Vendor",
      dataIndex: "name",
      key: "name",
      width: 200,
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
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
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
      title: "Orders",
      dataIndex: "totalOrders",
      key: "orders",
      width: 80,
      sorter: (a, b) => a.totalOrders - b.totalOrders,
      render: (v: number) => (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {v}
        </span>
      ),
    },
    {
      title: "Total Spend",
      dataIndex: "totalSpend",
      key: "spend",
      width: 140,
      sorter: (a, b) => a.totalSpend - b.totalSpend,
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
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 80,
      sorter: (a, b) => a.rating - b.rating,
      render: (v: number) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: v >= 4 ? "#6dd58c" : v >= 3 ? "#ffb347" : "#ffb4ab",
            fontWeight: 600,
          }}
        >
          {v.toFixed(1)} ★
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
        title="Vendors"
        subtitle={`${filtered.length} vendors`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Procurement", href: "/procurement" },
          { label: "Vendors" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Vendor
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search vendors..."
        showExport
      />
      <DataTable<Vendor> columns={columns} dataSource={filtered} rowKey="id" />
    </div>
  );
}
