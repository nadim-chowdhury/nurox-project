"use client";

import React from "react";
import { Row, Col, Tag } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  FunnelPlotOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";

export default function SalesPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Sales & CRM"
        subtitle="Pipeline, deals, customers, and sales analytics"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Sales" },
        ]}
      />

      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Pipeline Value
              </span>
            }
            value={2850000}
            prefix={
              <FunnelPlotOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
            formatter={(val) => `$${Number(val).toLocaleString()}`}
            trend="up"
            trendValue="+22%"
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Active Deals
              </span>
            }
            value={47}
            prefix={
              <ShoppingCartOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Customers
              </span>
            }
            value={312}
            prefix={
              <UserOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
            trend="up"
            trendValue="+8"
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
        <ShoppingCartOutlined
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
          Sales & CRM
        </div>
        <div style={{ fontSize: 13 }}>
          Sales pipeline, deal tracking, customer management, and analytics will
          be here.
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <Tag>Pipeline</Tag>
          <Tag>Deals</Tag>
          <Tag>Customers</Tag>
          <Tag>Analytics</Tag>
        </div>
      </div>
    </div>
  );
}
