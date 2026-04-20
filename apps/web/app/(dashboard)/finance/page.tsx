"use client";

import React from "react";
import { Row, Col, Card, Button } from "antd";
import {
  BankOutlined,
  FileTextOutlined,
  DollarOutlined,
  SwapOutlined,
  BarChartOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { formatCurrency } from "@/lib/utils";

const modules = [
  {
    title: "Chart of Accounts",
    description: "General ledger account structure",
    icon: <BankOutlined style={{ fontSize: 28, color: "#c3f5ff" }} />,
    href: "/finance/chart-of-accounts",
    count: "48",
  },
  {
    title: "Journals",
    description: "Manual journal entries and adjustments",
    icon: <FileTextOutlined style={{ fontSize: 28, color: "#80d8ff" }} />,
    href: "/finance/journals",
    count: "124",
  },
  {
    title: "Invoices",
    description: "Customer invoices and receivables",
    icon: <DollarOutlined style={{ fontSize: 28, color: "#6dd58c" }} />,
    href: "/finance/invoices",
    count: "42",
  },
  {
    title: "Bills",
    description: "Vendor bills and payables",
    icon: <FileTextOutlined style={{ fontSize: 28, color: "#ffb347" }} />,
    href: "/finance/bills",
    count: "18",
  },
  {
    title: "Banking",
    description: "Bank accounts and transactions",
    icon: <SwapOutlined style={{ fontSize: 28, color: "#e3eeff" }} />,
    href: "/finance/banking",
    count: formatCurrency(284500),
  },
  {
    title: "Reports",
    description: "Budget vs actual, P&L, balance sheet",
    icon: <BarChartOutlined style={{ fontSize: 28, color: "#ffb4ab" }} />,
    href: "/finance/reports",
    count: "Q2",
  },
];

export default function FinancePage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Finance"
        subtitle="Financial management and reporting"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Revenue (MTD)" value={formatCurrency(1240000)} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Expenses (MTD)" value={formatCurrency(890000)} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Net Profit" value={formatCurrency(350000)} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Cash Balance" value={formatCurrency(284500)} />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {modules.map((m) => (
          <Col xs={24} sm={12} lg={8} key={m.title}>
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
                    lineHeight: 1.5,
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
