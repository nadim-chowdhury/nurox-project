"use client";

import React from "react";
import { Row, Col, Card, Table } from "antd";
import {
  RiseOutlined,
  FallOutlined,
  DollarOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { formatCurrency } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface TopProduct {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
  growth: number;
}

const mockTopProducts: TopProduct[] = [
  {
    id: "1",
    name: "ERP Implementation",
    unitsSold: 8,
    revenue: 960000,
    growth: 15,
  },
  {
    id: "2",
    name: "Cloud Migration",
    unitsSold: 12,
    revenue: 720000,
    growth: 22,
  },
  {
    id: "3",
    name: "Custom Development",
    unitsSold: 18,
    revenue: 540000,
    growth: -5,
  },
  {
    id: "4",
    name: "Support Package",
    unitsSold: 45,
    revenue: 270000,
    growth: 8,
  },
  {
    id: "5",
    name: "Security Audit",
    unitsSold: 6,
    revenue: 168000,
    growth: 35,
  },
];

const columns: ColumnsType<TopProduct> = [
  {
    title: "Product/Service",
    dataIndex: "name",
    key: "name",
    render: (v: string) => (
      <span
        style={{
          color: "var(--color-on-surface)",
          fontWeight: 500,
          fontSize: 13,
        }}
      >
        {v}
      </span>
    ),
  },
  {
    title: "Units",
    dataIndex: "unitsSold",
    key: "units",
    width: 80,
    render: (v: number) => (
      <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Revenue",
    dataIndex: "revenue",
    key: "revenue",
    width: 150,
    sorter: (a, b) => a.revenue - b.revenue,
    render: (v: number) => (
      <span
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-primary)",
          fontWeight: 700,
        }}
      >
        {formatCurrency(v)}
      </span>
    ),
  },
  {
    title: "Growth",
    dataIndex: "growth",
    key: "growth",
    width: 100,
    sorter: (a, b) => a.growth - b.growth,
    render: (v: number) => (
      <span
        style={{
          fontFamily: "var(--font-display)",
          color: v >= 0 ? "#6dd58c" : "#ffb4ab",
          fontWeight: 600,
        }}
      >
        {v >= 0 ? <RiseOutlined /> : <FallOutlined />} {Math.abs(v)}%
      </span>
    ),
  },
];

export default function SalesAnalyticsPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Sales Analytics"
        subtitle="Revenue performance & insights"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Sales", href: "/sales" },
          { label: "Analytics" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Total Revenue (YTD)"
            value={formatCurrency(2658000)}
            prefix={<DollarOutlined style={{ color: "#6dd58c" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Deals Closed"
            value="38"
            prefix={<RiseOutlined style={{ color: "#c3f5ff" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Win Rate"
            value="68%"
            prefix={<RiseOutlined style={{ color: "#6dd58c" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Active Customers"
            value="52"
            prefix={<TeamOutlined style={{ color: "#80d8ff" }} />}
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
            Top Products & Services
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
          dataSource={mockTopProducts}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
}
