"use client";

import React from "react";
import { Row, Col, Button, Tag } from "antd";
import {
  PlusOutlined,
  BankOutlined,
  RiseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";

export default function FinancePage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Finance"
        subtitle="Chart of accounts, journals, invoices, and banking"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Journal Entry
          </Button>
        }
      />

      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Revenue (MTD)
              </span>
            }
            value={1240000}
            prefix={
              <RiseOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
            formatter={(val) => `$${Number(val).toLocaleString()}`}
            trend="up"
            trendValue="+15.3%"
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Outstanding Invoices
              </span>
            }
            value={23}
            prefix={
              <FileTextOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
            trend="down"
            trendValue="-8.2%"
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Cash Balance
              </span>
            }
            value={892400}
            prefix={
              <BankOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
            formatter={(val) => `$${Number(val).toLocaleString()}`}
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
        <BankOutlined
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
          Financial Management
        </div>
        <div style={{ fontSize: 13 }}>
          Chart of accounts, journal entries, invoices, bills, and banking will
          be managed here.
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <Tag>Chart of Accounts</Tag>
          <Tag>Journals</Tag>
          <Tag>Invoices</Tag>
          <Tag>Bills</Tag>
          <Tag>Banking</Tag>
        </div>
      </div>
    </div>
  );
}
