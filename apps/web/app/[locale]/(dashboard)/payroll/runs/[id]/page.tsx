"use client";

import React from "react";
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  Row,
  Col,
  Steps,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  PrinterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface PayslipLine {
  id: string;
  employee: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  tax: number;
  netPay: number;
  status: string;
}

const mockRun = {
  id: "PR-2026-04",
  period: "April 2026",
  status: "processing",
  createdBy: "Fatima Khan",
  createdAt: "2026-04-20",
  totalEmployees: 8,
  totalGross: 720000,
  totalDeductions: 108000,
  totalNet: 612000,
  step: 1,
};

const mockPayslips: PayslipLine[] = [
  {
    id: "1",
    employee: "Sarah Ahmed",
    baseSalary: 125000 / 12,
    allowances: 1500,
    deductions: 800,
    tax: 2200,
    netPay: 8917,
    status: "calculated",
  },
  {
    id: "2",
    employee: "James Wilson",
    baseSalary: 95000 / 12,
    allowances: 1200,
    deductions: 600,
    tax: 1700,
    netPay: 6817,
    status: "calculated",
  },
  {
    id: "3",
    employee: "Fatima Khan",
    baseSalary: 110000 / 12,
    allowances: 1400,
    deductions: 700,
    tax: 2000,
    netPay: 7867,
    status: "calculated",
  },
  {
    id: "4",
    employee: "Michael Chen",
    baseSalary: 85000 / 12,
    allowances: 1000,
    deductions: 500,
    tax: 1400,
    netPay: 6183,
    status: "calculated",
  },
  {
    id: "5",
    employee: "Priya Sharma",
    baseSalary: 75000 / 12,
    allowances: 900,
    deductions: 400,
    tax: 1200,
    netPay: 5550,
    status: "calculated",
  },
  {
    id: "6",
    employee: "David Miller",
    baseSalary: 100000 / 12,
    allowances: 1300,
    deductions: 650,
    tax: 1800,
    netPay: 7183,
    status: "calculated",
  },
];

const columns: ColumnsType<PayslipLine> = [
  {
    title: "Employee",
    key: "employee",
    width: 200,
    render: (_, r) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={r.employee} size={32} />
        <span
          style={{
            color: "var(--color-on-surface)",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {r.employee}
        </span>
      </div>
    ),
  },
  {
    title: "Base Salary",
    dataIndex: "baseSalary",
    key: "base",
    width: 120,
    render: (v: number) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {formatCurrency(v)}
      </span>
    ),
  },
  {
    title: "Allowances",
    dataIndex: "allowances",
    key: "allowances",
    width: 110,
    render: (v: number) => (
      <span style={{ color: "#6dd58c", fontSize: 13 }}>
        +{formatCurrency(v)}
      </span>
    ),
  },
  {
    title: "Deductions",
    dataIndex: "deductions",
    key: "deductions",
    width: 110,
    render: (v: number) => (
      <span style={{ color: "#ffb4ab", fontSize: 13 }}>
        -{formatCurrency(v)}
      </span>
    ),
  },
  {
    title: "Tax",
    dataIndex: "tax",
    key: "tax",
    width: 100,
    render: (v: number) => (
      <span style={{ color: "#ffb347", fontSize: 13 }}>
        -{formatCurrency(v)}
      </span>
    ),
  },
  {
    title: "Net Pay",
    dataIndex: "netPay",
    key: "netPay",
    width: 120,
    sorter: (a, b) => a.netPay - b.netPay,
    render: (v: number) => (
      <span
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-primary)",
          fontWeight: 700,
          fontSize: 14,
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
];

export default function PayrollRunDetailPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={`Payroll Run — ${mockRun.period}`}
        subtitle={`Run ID: ${mockRun.id}`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Payroll", href: "/payroll" },
          { label: "Runs", href: "/payroll/runs" },
          { label: mockRun.period },
        ]}
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/payroll/runs")}
            >
              Back
            </Button>
            <Button icon={<DownloadOutlined />}>Export</Button>
            <Button icon={<PrinterOutlined />}>Print</Button>
            <Button type="primary" icon={<CheckOutlined />}>
              Approve & Finalize
            </Button>
          </Space>
        }
      />

      {/* Progress Steps */}
      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          marginBottom: 24,
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Steps
          current={mockRun.step}
          size="small"
          items={[
            { title: "Draft", description: "Created" },
            { title: "Processing", description: "Calculating" },
            { title: "Review", description: "Manager review" },
            { title: "Approved", description: "Finalized" },
            { title: "Paid", description: "Disbursed" },
          ]}
        />
      </Card>

      {/* KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Employees" value={`${mockRun.totalEmployees}`} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Total Gross"
            value={formatCurrency(mockRun.totalGross)}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Total Deductions"
            value={formatCurrency(mockRun.totalDeductions)}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Total Net Pay"
            value={formatCurrency(mockRun.totalNet)}
          />
        </Col>
      </Row>

      {/* Run Info */}
      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          marginBottom: 24,
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Descriptions
          column={{ xs: 1, sm: 3 }}
          labelStyle={{
            color: "var(--color-on-surface-variant)",
            fontSize: 13,
          }}
          contentStyle={{ color: "var(--color-on-surface)", fontSize: 13 }}
        >
          <Descriptions.Item label="Period">{mockRun.period}</Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusTag status={mockRun.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Created By">
            {mockRun.createdBy}
          </Descriptions.Item>
          <Descriptions.Item label="Created On">
            {formatDate(mockRun.createdAt)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Payslip Lines */}
      <Card
        title={
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-on-surface)",
              fontWeight: 600,
            }}
          >
            Employee Payslips
          </span>
        }
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={mockPayslips}
          rowKey="id"
          pagination={false}
          size="middle"
          style={{ background: "transparent" }}
        />
      </Card>
    </div>
  );
}
