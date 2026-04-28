"use client";

import React from "react";
import { Card, Tag, Button, Avatar, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  totalDeals: number;
  totalValue: number;
  status: string;
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Robert Taylor",
    email: "robert@acme.com",
    company: "Acme Corp",
    totalDeals: 3,
    totalValue: 345000,
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Emily Johnson",
    email: "emily@techflow.com",
    company: "TechFlow Inc",
    totalDeals: 2,
    totalValue: 262000,
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "Hassan Ali",
    email: "hassan@globaltrade.com",
    company: "GlobalTrade Ltd",
    totalDeals: 1,
    totalValue: 95000,
    status: "ACTIVE",
  },
  {
    id: "4",
    name: "Lisa Park",
    email: "lisa@datasync.co",
    company: "DataSync Co",
    totalDeals: 1,
    totalValue: 45000,
    status: "LEAD",
  },
  {
    id: "5",
    name: "Alex Chen",
    email: "alex@cloudnine.io",
    company: "CloudNine Solutions",
    totalDeals: 1,
    totalValue: 320000,
    status: "PROSPECT",
  },
];

const statusMap: Record<string, string> = {
  ACTIVE: "success",
  PROSPECT: "processing",
  LEAD: "warning",
};

const columns: ColumnsType<Customer> = [
  {
    title: "Customer",
    key: "name",
    render: (_, r) => (
      <Space>
        <Avatar
          size={32}
          style={{
            background: "linear-gradient(135deg, #c3f5ff, #00e5ff)",
            color: "#003c4a",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          {r.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Avatar>
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
            style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}
          >
            {r.email}
          </div>
        </div>
      </Space>
    ),
  },
  {
    title: "Company",
    dataIndex: "company",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface-variant)" }}>{v}</span>
    ),
  },
  {
    title: "Deals",
    dataIndex: "totalDeals",
    align: "right" as const,
    render: (v: number) => (
      <span
        className="font-display"
        style={{ color: "var(--color-on-surface)" }}
      >
        {v}
      </span>
    ),
  },
  {
    title: "Total Value",
    dataIndex: "totalValue",
    sorter: (a, b) => a.totalValue - b.totalValue,
    align: "right" as const,
    render: (v: number) => (
      <span className="font-display" style={{ color: "var(--color-primary)" }}>
        ${v.toLocaleString()}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (s: string) => <Tag color={statusMap[s] || "default"}>{s}</Tag>,
  },
];

export default function CustomersPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Customers"
        subtitle="Manage customers and track engagement"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Sales", href: "/sales" },
          { label: "Customers" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Customer
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<Customer>
          columns={columns}
          dataSource={mockCustomers}
          rowKey="id"
        />
      </Card>
    </div>
  );
}
