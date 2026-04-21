"use client";

import React from "react";
import { Row, Col, Card, Table } from "antd";
import { BankOutlined, SwapOutlined, DollarOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface Transaction {
  id: string;
  date: string;
  description: string;
  type: string;
  amount: number;
  balance: number;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2026-04-21",
    description: "Client payment — Acme Corp",
    type: "credit",
    amount: 13750,
    balance: 284500,
  },
  {
    id: "2",
    date: "2026-04-20",
    description: "AWS monthly invoice",
    type: "debit",
    amount: 4520,
    balance: 270750,
  },
  {
    id: "3",
    date: "2026-04-19",
    description: "Payroll — April 2026",
    type: "debit",
    amount: 62000,
    balance: 275270,
  },
  {
    id: "4",
    date: "2026-04-18",
    description: "Client payment — TechStart Ltd",
    type: "credit",
    amount: 8500,
    balance: 337270,
  },
  {
    id: "5",
    date: "2026-04-17",
    description: "Office rent — April",
    type: "debit",
    amount: 8500,
    balance: 328770,
  },
  {
    id: "6",
    date: "2026-04-15",
    description: "Equipment purchase",
    type: "debit",
    amount: 3200,
    balance: 337270,
  },
  {
    id: "7",
    date: "2026-04-14",
    description: "Client payment — GlobalFin",
    type: "credit",
    amount: 25000,
    balance: 340470,
  },
  {
    id: "8",
    date: "2026-04-12",
    description: "Software subscriptions",
    type: "debit",
    amount: 2100,
    balance: 315470,
  },
];

const columns: ColumnsType<Transaction> = [
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    width: 120,
    render: (d: string) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {formatDate(d)}
      </span>
    ),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "desc",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)", fontSize: 13 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    width: 90,
    render: (t: string) => (
      <StatusTag
        status={t === "credit" ? "in_stock" : "out_of_stock"}
        label={t === "credit" ? "Credit" : "Debit"}
      />
    ),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    width: 140,
    align: "right" as const,
    render: (v: number, r) => (
      <span
        style={{
          fontFamily: "var(--font-display)",
          color: r.type === "credit" ? "#6dd58c" : "#ffb4ab",
          fontWeight: 600,
          fontSize: 14,
        }}
      >
        {r.type === "credit" ? "+" : "-"}
        {formatCurrency(v)}
      </span>
    ),
  },
  {
    title: "Balance",
    dataIndex: "balance",
    key: "balance",
    width: 150,
    align: "right" as const,
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
];

export default function BankingPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Banking"
        subtitle="Bank account overview & transactions"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Banking" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <KpiCard
            title="Current Balance"
            value={formatCurrency(284500)}
            prefix={<BankOutlined style={{ color: "#c3f5ff" }} />}
          />
        </Col>
        <Col xs={12} sm={8}>
          <KpiCard
            title="Income (MTD)"
            value={formatCurrency(47250)}
            prefix={<DollarOutlined style={{ color: "#6dd58c" }} />}
          />
        </Col>
        <Col xs={12} sm={8}>
          <KpiCard
            title="Expenses (MTD)"
            value={formatCurrency(80320)}
            prefix={<SwapOutlined style={{ color: "#ffb4ab" }} />}
          />
        </Col>
      </Row>

      <Card
        title={
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-on-surface)",
              fontWeight: 600,
            }}
          >
            Recent Transactions
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
          dataSource={mockTransactions}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
