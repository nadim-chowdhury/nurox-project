"use client";

import React from "react";
import { Row, Col, Card } from "antd";
import {
  DollarOutlined,
  FileTextOutlined,
  AccountBookOutlined,
  RightOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { formatCurrency } from "@/lib/utils";

const modules = [
  {
    title: "Payroll Runs",
    description: "Monthly payroll processing and approval",
    icon: <DollarOutlined style={{ fontSize: 28, color: "#c3f5ff" }} />,
    href: "/payroll/runs",
    count: "Apr 2026",
  },
  {
    title: "Salary Structures",
    description: "Base salary, allowances, and deductions",
    icon: <AccountBookOutlined style={{ fontSize: 28, color: "#80d8ff" }} />,
    href: "/payroll/salary-structures",
    count: "6",
  },
  {
    title: "Payslips",
    description: "Employee pay statements",
    icon: <FileTextOutlined style={{ fontSize: 28, color: "#6dd58c" }} />,
    href: "/payroll/payslips",
    count: "284",
  },
];

export default function PayrollPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Payroll"
        subtitle="Salary processing, structures, and payslips"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Payroll" },
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Monthly Payroll" value={formatCurrency(485200)} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Employees Paid" value="271" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Total Deductions" value={formatCurrency(72800)} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Next Run" value="May 1" />
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
