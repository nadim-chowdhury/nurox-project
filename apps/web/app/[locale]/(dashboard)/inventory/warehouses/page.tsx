"use client";

import React from "react";
import { Card, Tag, Button } from "antd";
import { PlusOutlined, HomeOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  capacity: number;
  utilized: number;
  status: string;
}

const mockWarehouses: Warehouse[] = [
  {
    id: "1",
    code: "WH-01",
    name: "Main Warehouse",
    location: "Dhaka, Bangladesh",
    capacity: 5000,
    utilized: 3200,
    status: "ACTIVE",
  },
  {
    id: "2",
    code: "WH-02",
    name: "East Distribution",
    location: "Chittagong, Bangladesh",
    capacity: 3000,
    utilized: 2100,
    status: "ACTIVE",
  },
  {
    id: "3",
    code: "WH-03",
    name: "North Storage",
    location: "Rajshahi, Bangladesh",
    capacity: 2000,
    utilized: 800,
    status: "ACTIVE",
  },
  {
    id: "4",
    code: "WH-04",
    name: "Overflow Unit",
    location: "Dhaka, Bangladesh",
    capacity: 1000,
    utilized: 950,
    status: "NEAR_FULL",
  },
];

const statusMap: Record<string, string> = {
  ACTIVE: "success",
  NEAR_FULL: "warning",
  INACTIVE: "default",
};

const columns: ColumnsType<Warehouse> = [
  {
    title: "Code",
    dataIndex: "code",
    width: 100,
    render: (v: string) => (
      <span className="font-display" style={{ color: "var(--color-primary)" }}>
        {v}
      </span>
    ),
  },
  {
    title: "Warehouse",
    dataIndex: "name",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Location",
    dataIndex: "location",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface-variant)" }}>{v}</span>
    ),
  },
  {
    title: "Capacity",
    dataIndex: "capacity",
    align: "right" as const,
    render: (v: number) => (
      <span style={{ color: "var(--color-on-surface-variant)" }}>
        {v.toLocaleString()} units
      </span>
    ),
  },
  {
    title: "Utilized",
    dataIndex: "utilized",
    align: "right" as const,
    render: (v: number, r) => {
      const pct = Math.round((v / r.capacity) * 100);
      return (
        <span
          className="font-display"
          style={{
            color:
              pct > 90
                ? "var(--color-error)"
                : pct > 70
                  ? "var(--color-warning)"
                  : "var(--color-success)",
          }}
        >
          {pct}%
        </span>
      );
    },
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (s: string) => (
      <Tag color={statusMap[s] || "default"}>{s.replace("_", " ")}</Tag>
    ),
  },
];

export default function WarehousesPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Warehouses"
        subtitle="Manage warehouse locations and capacity"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Inventory", href: "/inventory" },
          { label: "Warehouses" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Warehouse
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<Warehouse>
          columns={columns}
          dataSource={mockWarehouses}
          rowKey="id"
        />
      </Card>
    </div>
  );
}
