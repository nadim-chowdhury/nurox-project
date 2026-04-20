"use client";

import React from "react";
import { Card, Tag, Button, Space } from "antd";
import { PlusOutlined, BarcodeOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  reorderLevel: number;
  unitPrice: number;
  status: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    sku: "WDG-001",
    name: "Steel Widget A",
    category: "Widgets",
    quantity: 450,
    reorderLevel: 100,
    unitPrice: 24.99,
    status: "IN_STOCK",
  },
  {
    id: "2",
    sku: "WDG-002",
    name: "Steel Widget B",
    category: "Widgets",
    quantity: 82,
    reorderLevel: 100,
    unitPrice: 34.5,
    status: "LOW_STOCK",
  },
  {
    id: "3",
    sku: "GDG-001",
    name: "Gadget Pro X",
    category: "Gadgets",
    quantity: 210,
    reorderLevel: 50,
    unitPrice: 149.99,
    status: "IN_STOCK",
  },
  {
    id: "4",
    sku: "CMP-001",
    name: "Component Alpha",
    category: "Components",
    quantity: 0,
    reorderLevel: 200,
    unitPrice: 8.75,
    status: "OUT_OF_STOCK",
  },
  {
    id: "5",
    sku: "CMP-002",
    name: "Component Beta",
    category: "Components",
    quantity: 1200,
    reorderLevel: 300,
    unitPrice: 5.2,
    status: "IN_STOCK",
  },
  {
    id: "6",
    sku: "GDG-002",
    name: "Gadget Lite",
    category: "Gadgets",
    quantity: 45,
    reorderLevel: 50,
    unitPrice: 89.99,
    status: "LOW_STOCK",
  },
];

const statusMap: Record<string, string> = {
  IN_STOCK: "success",
  LOW_STOCK: "warning",
  OUT_OF_STOCK: "error",
};

const columns: ColumnsType<Product> = [
  {
    title: "SKU",
    dataIndex: "sku",
    width: 120,
    render: (v: string) => (
      <span className="font-display" style={{ color: "var(--color-primary)" }}>
        {v}
      </span>
    ),
  },
  {
    title: "Product",
    dataIndex: "name",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Category",
    dataIndex: "category",
    filters: [
      { text: "Widgets", value: "Widgets" },
      { text: "Gadgets", value: "Gadgets" },
      { text: "Components", value: "Components" },
    ],
    onFilter: (value, record) => record.category === value,
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface-variant)" }}>{v}</span>
    ),
  },
  {
    title: "Qty",
    dataIndex: "quantity",
    sorter: (a, b) => a.quantity - b.quantity,
    align: "right" as const,
    render: (v: number, r) => (
      <span
        className="font-display"
        style={{
          color:
            v <= r.reorderLevel
              ? "var(--color-warning)"
              : "var(--color-on-surface)",
        }}
      >
        {v.toLocaleString()}
      </span>
    ),
  },
  {
    title: "Unit Price",
    dataIndex: "unitPrice",
    sorter: (a, b) => a.unitPrice - b.unitPrice,
    align: "right" as const,
    render: (v: number) => (
      <span
        className="font-display"
        style={{ color: "var(--color-on-surface)" }}
      >
        ${v.toFixed(2)}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (s: string) => (
      <Tag color={statusMap[s] || "default"}>{s.replace(/_/g, " ")}</Tag>
    ),
  },
];

export default function ProductsPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Products"
        subtitle="Product catalog and stock levels"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Inventory", href: "/inventory" },
          { label: "Products" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Product
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<Product>
          columns={columns}
          dataSource={mockProducts}
          rowKey="id"
        />
      </Card>
    </div>
  );
}
