"use client";

import React from "react";
import { Card, Tag, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
  status: string;
}

const mockAccounts: Account[] = [
  {
    id: "1",
    code: "1000",
    name: "Cash & Equivalents",
    type: "ASSET",
    balance: 892400,
    status: "ACTIVE",
  },
  {
    id: "2",
    code: "1100",
    name: "Accounts Receivable",
    type: "ASSET",
    balance: 345000,
    status: "ACTIVE",
  },
  {
    id: "3",
    code: "2000",
    name: "Accounts Payable",
    type: "LIABILITY",
    balance: -187000,
    status: "ACTIVE",
  },
  {
    id: "4",
    code: "3000",
    name: "Owner's Equity",
    type: "EQUITY",
    balance: 2500000,
    status: "ACTIVE",
  },
  {
    id: "5",
    code: "4000",
    name: "Revenue",
    type: "REVENUE",
    balance: 1240000,
    status: "ACTIVE",
  },
  {
    id: "6",
    code: "5000",
    name: "Cost of Goods Sold",
    type: "EXPENSE",
    balance: -420000,
    status: "ACTIVE",
  },
  {
    id: "7",
    code: "5100",
    name: "Salaries & Wages",
    type: "EXPENSE",
    balance: -485200,
    status: "ACTIVE",
  },
  {
    id: "8",
    code: "5200",
    name: "Rent & Utilities",
    type: "EXPENSE",
    balance: -78000,
    status: "ACTIVE",
  },
];

const typeColors: Record<string, string> = {
  ASSET: "cyan",
  LIABILITY: "orange",
  EQUITY: "purple",
  REVENUE: "green",
  EXPENSE: "red",
};

const columns: ColumnsType<Account> = [
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
    title: "Account Name",
    dataIndex: "name",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Type",
    dataIndex: "type",
    filters: [
      { text: "Asset", value: "ASSET" },
      { text: "Liability", value: "LIABILITY" },
      { text: "Equity", value: "EQUITY" },
      { text: "Revenue", value: "REVENUE" },
      { text: "Expense", value: "EXPENSE" },
    ],
    onFilter: (value, record) => record.type === value,
    render: (v: string) => <Tag color={typeColors[v] || "default"}>{v}</Tag>,
  },
  {
    title: "Balance",
    dataIndex: "balance",
    sorter: (a, b) => a.balance - b.balance,
    align: "right" as const,
    render: (v: number) => (
      <span
        className="font-display"
        style={{
          color: v >= 0 ? "var(--color-success)" : "var(--color-error)",
        }}
      >
        {v < 0 ? "-" : ""}${Math.abs(v).toLocaleString()}
      </span>
    ),
  },
];

export default function ChartOfAccountsPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Chart of Accounts"
        subtitle="General ledger account structure"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Chart of Accounts" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Account
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<Account>
          columns={columns}
          dataSource={mockAccounts}
          rowKey="id"
        />
      </Card>
    </div>
  );
}
