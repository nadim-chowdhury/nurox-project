"use client";

import React from "react";
import { Row, Col, Card } from "antd";
import {
  InboxOutlined,
  ShopOutlined,
  SwapOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { formatCurrency } from "@/lib/utils";

const modules = [
  {
    title: "Products",
    description: "Manage product catalog and SKUs",
    icon: <InboxOutlined style={{ fontSize: 28, color: "#c3f5ff" }} />,
    href: "/inventory/products",
    count: "345",
  },
  {
    title: "Warehouses",
    description: "Storage locations and capacities",
    icon: <ShopOutlined style={{ fontSize: 28, color: "#80d8ff" }} />,
    href: "/inventory/warehouses",
    count: "4",
  },
  {
    title: "Stock Movements",
    description: "Transfers, receipts, and dispatches",
    icon: <SwapOutlined style={{ fontSize: 28, color: "#6dd58c" }} />,
    href: "/inventory/movements",
    count: "28",
  },
];

export default function InventoryPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Inventory"
        subtitle="Products, warehouses, and stock management"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Inventory" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Total Products" value="345" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="In Stock" value="312" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Low Stock" value="18" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Inventory Value" value={formatCurrency(1850000)} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {modules.map((m) => (
          <Col xs={24} sm={8} key={m.title}>
            <Link href={m.href}>
              <Card
                hoverable
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--ghost-border)",
                  borderRadius: 4,
                  height: "100%",
                  cursor: "pointer",
                }}
                styles={{ body: { padding: 24 } }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  {m.icon}
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--color-primary)",
                      fontWeight: 700,
                      fontSize: 18,
                    }}
                  >
                    {m.count}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-on-surface)",
                    fontWeight: 600,
                    fontSize: 16,
                    marginTop: 16,
                    marginBottom: 6,
                  }}
                >
                  {m.title}
                </h3>
                <p
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 13,
                    margin: 0,
                  }}
                >
                  {m.description}
                </p>
                <div
                  style={{
                    marginTop: 16,
                    color: "var(--color-primary)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  View {m.title} <RightOutlined style={{ fontSize: 10 }} />
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
