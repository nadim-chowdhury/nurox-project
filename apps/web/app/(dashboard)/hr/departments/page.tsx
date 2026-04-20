"use client";

import React from "react";
import { Card, Tag, Button, Space } from "antd";
import { PlusOutlined, ApartmentOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface Department {
  id: string;
  name: string;
  head: string;
  headCount: number;
  status: string;
}

const mockDepartments: Department[] = [
  {
    id: "1",
    name: "Engineering",
    head: "Sarah Ahmed",
    headCount: 82,
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Sales & Marketing",
    head: "James Wilson",
    headCount: 45,
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "Human Resources",
    head: "Fatima Khan",
    headCount: 18,
    status: "ACTIVE",
  },
  {
    id: "4",
    name: "Finance",
    head: "Michael Chen",
    headCount: 24,
    status: "ACTIVE",
  },
  {
    id: "5",
    name: "Operations",
    head: "David Miller",
    headCount: 56,
    status: "ACTIVE",
  },
  {
    id: "6",
    name: "Legal",
    head: "Priya Sharma",
    headCount: 8,
    status: "ACTIVE",
  },
  {
    id: "7",
    name: "Quality Assurance",
    head: "Aisha Rahman",
    headCount: 15,
    status: "ACTIVE",
  },
];

const columns: ColumnsType<Department> = [
  {
    title: "Department",
    key: "name",
    render: (_, r) => (
      <Space>
        <ApartmentOutlined style={{ color: "var(--color-primary)" }} />
        <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
          {r.name}
        </span>
      </Space>
    ),
  },
  {
    title: "Head",
    dataIndex: "head",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface-variant)" }}>{v}</span>
    ),
  },
  {
    title: "Employees",
    dataIndex: "headCount",
    sorter: (a, b) => a.headCount - b.headCount,
    render: (v: number) => (
      <span className="font-display" style={{ color: "var(--color-primary)" }}>
        {v}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (s: string) => <Tag color="success">{s}</Tag>,
  },
];

export default function DepartmentsPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Departments"
        subtitle="Organizational structure and department management"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Departments" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Department
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<Department>
          columns={columns}
          dataSource={mockDepartments}
          rowKey="id"
        />
      </Card>
    </div>
  );
}
