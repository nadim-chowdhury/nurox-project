"use client";

import React from "react";
import { Card, Tag, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface SalaryStructure {
  id: string;
  name: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  employees: number;
  status: string;
}

const mockStructures: SalaryStructure[] = [
  {
    id: "1",
    name: "Senior Engineer",
    baseSalary: 8000,
    allowances: 2500,
    deductions: 1800,
    netSalary: 8700,
    employees: 32,
    status: "ACTIVE",
  },
  {
    id: "2",
    name: "Mid-Level Engineer",
    baseSalary: 5500,
    allowances: 1500,
    deductions: 1200,
    netSalary: 5800,
    employees: 50,
    status: "ACTIVE",
  },
  {
    id: "3",
    name: "Manager",
    baseSalary: 9000,
    allowances: 3000,
    deductions: 2100,
    netSalary: 9900,
    employees: 18,
    status: "ACTIVE",
  },
  {
    id: "4",
    name: "Junior Staff",
    baseSalary: 3000,
    allowances: 800,
    deductions: 600,
    netSalary: 3200,
    employees: 95,
    status: "ACTIVE",
  },
  {
    id: "5",
    name: "Executive",
    baseSalary: 15000,
    allowances: 5000,
    deductions: 3800,
    netSalary: 16200,
    employees: 6,
    status: "ACTIVE",
  },
];

const columns: ColumnsType<SalaryStructure> = [
  {
    title: "Structure",
    dataIndex: "name",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Base Salary",
    dataIndex: "baseSalary",
    align: "right" as const,
    render: (v: number) => (
      <span
        className="font-display"
        style={{ color: "var(--color-on-surface)" }}
      >
        ${v.toLocaleString()}
      </span>
    ),
  },
  {
    title: "Allowances",
    dataIndex: "allowances",
    align: "right" as const,
    render: (v: number) => (
      <span style={{ color: "var(--color-success)" }}>
        +${v.toLocaleString()}
      </span>
    ),
  },
  {
    title: "Deductions",
    dataIndex: "deductions",
    align: "right" as const,
    render: (v: number) => (
      <span style={{ color: "var(--color-error)" }}>
        -${v.toLocaleString()}
      </span>
    ),
  },
  {
    title: "Net Salary",
    dataIndex: "netSalary",
    sorter: (a, b) => a.netSalary - b.netSalary,
    align: "right" as const,
    render: (v: number) => (
      <span className="font-display" style={{ color: "var(--color-primary)" }}>
        ${v.toLocaleString()}
      </span>
    ),
  },
  {
    title: "Employees",
    dataIndex: "employees",
    align: "right" as const,
    render: (v: number) => (
      <span style={{ color: "var(--color-on-surface-variant)" }}>{v}</span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (s: string) => <Tag color="success">{s}</Tag>,
  },
];

export default function SalaryStructuresPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Salary Structures"
        subtitle="Define compensation packages and pay grades"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Payroll", href: "/payroll" },
          { label: "Salary Structures" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Structure
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<SalaryStructure>
          columns={columns}
          dataSource={mockStructures}
          rowKey="id"
        />
      </Card>
    </div>
  );
}
