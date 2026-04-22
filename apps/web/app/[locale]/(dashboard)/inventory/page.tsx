"use client";

import React from "react";
import { Row, Col, Card, Progress, List, Tag, Button } from "antd";
import {
  InboxOutlined,
  ShopOutlined,
  SwapOutlined,
  WarningOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { formatCurrency } from "@/lib/utils";
import { 
  useGetStockAlertsQuery, 
  useGetInventoryAgingQuery 
} from "@/store/api/inventoryApi";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function InventoryPage() {
  const { data: alerts, isLoading: loadingAlerts } = useGetStockAlertsQuery();
  const { data: aging, isLoading: loadingAging } = useGetInventoryAgingQuery();

  const agingData = aging ? [
    { name: "0-30 Days", value: aging.reduce((sum, item) => sum + Number(item['0_30_days']), 0) },
    { name: "31-60 Days", value: aging.reduce((sum, item) => sum + Number(item['31_60_days']), 0) },
    { name: "61-90 Days", value: aging.reduce((sum, item) => sum + Number(item['61_90_days']), 0) },
    { name: "Over 90 Days", value: aging.reduce((sum, item) => sum + Number(item['over_90_days']), 0) },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Inventory"
        subtitle="Global stock visibility and warehouse operations"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Inventory" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Total SKU" value="1,240" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Low Stock Alerts"
            value={alerts?.length?.toString() || "0"}
          />

        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Active Warehouses" value="4" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Total Value" value={formatCurrency(2450000)} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Inventory Aging Analysis" loading={loadingAging}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={agingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {agingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title="Reorder Point Alerts" 
            extra={<Link href="/inventory/products">Manage SKU</Link>}
            styles={{ body: { padding: 0 } }}
          >
            <List
              loading={loadingAlerts}
              dataSource={alerts?.slice(0, 5)}
              renderItem={(item: any) => (
                <List.Item style={{ padding: "12px 24px" }}>
                  <List.Item.Meta
                    avatar={<WarningOutlined style={{ color: "red" }} />}
                    title={item.name}
                    description={`SKU: ${item.sku} | Current: ${item.currentStock} | Reorder: ${item.reorderPoint}`}
                  />
                  <Button type="link" size="small">Restock</Button>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Link href="/inventory/products">
            <Card hoverable className="text-center">
              <InboxOutlined style={{ fontSize: 32, color: "var(--color-primary)" }} />
              <h3 style={{ marginTop: 8 }}>Product Catalog</h3>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={8}>
          <Link href="/inventory/warehouses">
            <Card hoverable className="text-center">
              <ShopOutlined style={{ fontSize: 32, color: "var(--color-primary)" }} />
              <h3 style={{ marginTop: 8 }}>Warehouse Map</h3>
            </Card>
          </Link>
        </Col>
        <Col xs={24} sm={8}>
          <Link href="/inventory/movements">
            <Card hoverable className="text-center">
              <HistoryOutlined style={{ fontSize: 32, color: "var(--color-primary)" }} />
              <h3 style={{ marginTop: 8 }}>Stock Audits</h3>
            </Card>
          </Link>
        </Col>
      </Row>
    </div>
  );
}
