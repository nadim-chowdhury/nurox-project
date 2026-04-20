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

interface Asset {
  id: string;
  name: string;
  assetTag: string;
  category: string;
  assignedTo: string;
  purchaseDate: string;
  value: number;
  status: string;
  location: string;
}

const mockAssets: Asset[] = [
  {
    id: "1",
    name: 'MacBook Pro 16" M4',
    assetTag: "AST-001",
    category: "Laptop",
    assignedTo: "Sarah Ahmed",
    purchaseDate: "2025-06-15",
    value: 3200,
    status: "active",
    location: "HQ - Floor 2",
  },
  {
    id: "2",
    name: "Dell U2723QE Monitor",
    assetTag: "AST-002",
    category: "Monitor",
    assignedTo: "James Wilson",
    purchaseDate: "2025-07-20",
    value: 620,
    status: "active",
    location: "HQ - Floor 2",
  },
  {
    id: "3",
    name: "Herman Miller Aeron",
    assetTag: "AST-003",
    category: "Furniture",
    assignedTo: "Fatima Khan",
    purchaseDate: "2024-11-10",
    value: 1400,
    status: "active",
    location: "HQ - Floor 1",
  },
  {
    id: "4",
    name: "Cisco Meraki Switch",
    assetTag: "AST-004",
    category: "Networking",
    assignedTo: "IT Dept",
    purchaseDate: "2024-03-01",
    value: 4800,
    status: "active",
    location: "Server Room",
  },
  {
    id: "5",
    name: "ThinkPad X1 Carbon",
    assetTag: "AST-005",
    category: "Laptop",
    assignedTo: "Unassigned",
    purchaseDate: "2025-09-10",
    value: 1800,
    status: "available",
    location: "IT Storage",
  },
  {
    id: "6",
    name: "Canon Printer MF746",
    assetTag: "AST-006",
    category: "Printer",
    assignedTo: "Operations",
    purchaseDate: "2023-08-20",
    value: 950,
    status: "maintenance",
    location: "HQ - Floor 1",
  },
  {
    id: "7",
    name: 'iPad Pro 12.9"',
    assetTag: "AST-007",
    category: "Tablet",
    assignedTo: "Robert Taylor",
    purchaseDate: "2025-01-15",
    value: 1300,
    status: "active",
    location: "Remote",
  },
  {
    id: "8",
    name: "HP EliteDesk 800",
    assetTag: "AST-008",
    category: "Desktop",
    assignedTo: "Unassigned",
    purchaseDate: "2022-05-10",
    value: 900,
    status: "retired",
    location: "IT Storage",
  },
];

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockAssets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.assetTag.toLowerCase().includes(search.toLowerCase()),
  );

  const totalValue = filtered.reduce((a, b) => a + b.value, 0);

  const columns: ColumnsType<Asset> = [
    {
      title: "Asset",
      key: "name",
      width: 220,
      render: (_, r) => (
        <div>
          <div
            style={{
              color: "var(--color-on-surface)",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {r.name}
          </div>
          <div
            style={{
              color: "var(--color-primary)",
              fontSize: 12,
              fontFamily: "var(--font-display)",
            }}
          >
            {r.assetTag}
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 110,
      filters: [...new Set(mockAssets.map((a) => a.category))].map((c) => ({
        text: c,
        value: c,
      })),
      onFilter: (v, r) => r.category === v,
      render: (v: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assigned",
      width: 140,
      render: (v: string) => (
        <span
          style={{
            color:
              v === "Unassigned"
                ? "var(--color-on-surface-variant)"
                : "var(--color-on-surface)",
            fontSize: 13,
            fontStyle: v === "Unassigned" ? "italic" : "normal",
          }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
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
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: 110,
      sorter: (a, b) => a.value - b.value,
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
      title: "Purchased",
      dataIndex: "purchaseDate",
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
        title="Assets"
        subtitle={`${filtered.length} assets · Total value: ${formatCurrency(totalValue)}`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Assets" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Register Asset
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search assets..."
        showExport
      />
      <DataTable<Asset> columns={columns} dataSource={filtered} rowKey="id" />
    </div>
  );
}
