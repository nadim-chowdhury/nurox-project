"use client";

import React, { useState } from "react";
import { Row, Col, Card, Table, Tabs, Button, Space } from "antd";
import { DownloadOutlined, FilePdfOutlined, FileExcelOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { formatCurrency } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface ReportLine {
  id: string;
  category: string;
  amount: number;
}

const mockPL: ReportLine[] = [
  { id: "1", category: "Operating Revenue", amount: 475000 },
  { id: "2", category: "Cost of Goods Sold", amount: -185000 },
  { id: "3", category: "Gross Profit", amount: 290000 },
  { id: "4", category: "Operating Expenses", amount: -152000 },
  { id: "5", category: "Net Income", amount: 138000 },
];

const columns: ColumnsType<ReportLine> = [
  {
    title: "Category",
    dataIndex: "category",
    key: "category",
    render: (v: string) => (
      <span style={{ fontWeight: v.includes("Total") || v.includes("Net") || v.includes("Profit") ? 600 : 400 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    align: "right",
    render: (v: number) => (
      <span style={{ color: v >= 0 ? "inherit" : "var(--color-error)" }}>
        {formatCurrency(v)}
      </span>
    ),
  },
];

export default function FinanceReportsPage() {
  const [activeTab, setActiveTab] = useState("1");

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Financial Reports"
        subtitle="Consolidated Financial Statements"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Reports" },
        ]}
        extra={
          <Space>
            <Button icon={<FilePdfOutlined />}>PDF</Button>
            <Button icon={<FileExcelOutlined />}>Excel</Button>
          </Space>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "1",
            label: "Profit & Loss",
            children: (
              <Card>
                <Table columns={columns} dataSource={mockPL} pagination={false} rowKey="id" />
              </Card>
            ),
          },
          {
            key: "2",
            label: "Balance Sheet",
            children: <Card><Text type="secondary">Balance Sheet content loading...</Text></Card>,
          },
          {
            key: "3",
            label: "Trial Balance",
            children: <Card><Text type="secondary">Trial Balance content loading...</Text></Card>,
          },
        ]}
      />
    </div>
  );
}

import { Typography } from "antd";
const { Text } = Typography;
