"use client";

import React from "react";
import { Row, Col, Button, Tag } from "antd";
import {
  PlusOutlined,
  InboxOutlined,
  AlertOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";

export default function InventoryPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Inventory"
        subtitle="Products, warehouses, stock movements, and counts"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Inventory" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Product
          </Button>
        }
      />

      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Total SKUs
              </span>
            }
            value={1432}
            prefix={
              <InboxOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Low Stock Alerts
              </span>
            }
            value={7}
            prefix={
              <AlertOutlined
                style={{ color: "var(--color-warning)", marginRight: 8 }}
              />
            }
            trend="up"
            trendValue="+3"
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Movements Today
              </span>
            }
            value={34}
            prefix={
              <SwapOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
          />
        </Col>
      </Row>

      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          padding: 48,
          textAlign: "center",
          color: "var(--color-on-surface-variant)",
        }}
      >
        <InboxOutlined
          style={{
            fontSize: 48,
            marginBottom: 16,
            color: "var(--color-primary)",
            opacity: 0.3,
          }}
        />
        <div
          style={{
            fontSize: 16,
            fontFamily: "var(--font-display)",
            marginBottom: 8,
          }}
        >
          Inventory Management
        </div>
        <div style={{ fontSize: 13 }}>
          Product catalog, warehouse management, stock movements, and stock
          counts will be here.
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <Tag>Products</Tag>
          <Tag>Warehouses</Tag>
          <Tag>Movements</Tag>
          <Tag>Stock Count</Tag>
        </div>
      </div>
    </div>
  );
}
