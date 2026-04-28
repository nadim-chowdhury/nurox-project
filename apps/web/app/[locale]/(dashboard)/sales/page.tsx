"use client";

import React from "react";
import { Row, Col, Card } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  PhoneOutlined,
  FileTextOutlined,
  DollarOutlined,
  BarChartOutlined,
  FunnelPlotOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { formatCurrency } from "@/lib/utils";

const modules = [
  {
    title: "Deals",
    description: "Active deal pipeline and tracking",
    icon: <ShoppingCartOutlined style={{ fontSize: 28, color: "#c3f5ff" }} />,
    href: "/sales/deals",
    count: "15",
  },
  {
    title: "Leads",
    description: "Lead capture and qualification",
    icon: <FunnelPlotOutlined style={{ fontSize: 28, color: "#80d8ff" }} />,
    href: "/sales/leads",
    count: "32",
  },
  {
    title: "Opportunities",
    description: "Revenue pipeline by stage",
    icon: <DollarOutlined style={{ fontSize: 28, color: "#6dd58c" }} />,
    href: "/sales/opportunities",
    count: formatCurrency(1260000),
  },
  {
    title: "Customers",
    description: "Customer accounts and profiles",
    icon: <UserOutlined style={{ fontSize: 28, color: "#ffb347" }} />,
    href: "/sales/customers",
    count: "52",
  },
  {
    title: "Contacts",
    description: "CRM contact directory",
    icon: <PhoneOutlined style={{ fontSize: 28, color: "#e3eeff" }} />,
    href: "/sales/contacts",
    count: "128",
  },
  {
    title: "Quotations",
    description: "Sales quotes and proposals",
    icon: <FileTextOutlined style={{ fontSize: 28, color: "#ffb4ab" }} />,
    href: "/sales/quotations",
    count: "8",
  },
  {
    title: "Orders",
    description: "Sales order fulfillment",
    icon: <ShoppingCartOutlined style={{ fontSize: 28, color: "#c3f5ff" }} />,
    href: "/sales/orders",
    count: "12",
  },
  {
    title: "Analytics",
    description: "Revenue performance insights",
    icon: <BarChartOutlined style={{ fontSize: 28, color: "#6dd58c" }} />,
    href: "/sales/analytics",
    count: "YTD",
  },
];

export default function SalesPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Sales & CRM"
        subtitle="Pipeline, customers, and revenue management"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Sales & CRM" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Pipeline Value" value={formatCurrency(1260000)} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Won (MTD)" value={formatCurrency(185000)} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Win Rate" value="68%" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Active Customers" value="52" />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {modules.map((m) => (
          <Col xs={24} sm={12} lg={6} key={m.title}>
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
                styles={{ body: { padding: 20 } }}
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
                      fontSize: 14,
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
                    fontSize: 15,
                    marginTop: 12,
                    marginBottom: 4,
                  }}
                >
                  {m.title}
                </h3>
                <p
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 12,
                    margin: 0,
                  }}
                >
                  {m.description}
                </p>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
