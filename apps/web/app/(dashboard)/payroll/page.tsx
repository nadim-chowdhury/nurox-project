"use client";

import React from "react";
import { Row, Col, Button, Tag } from "antd";
import {
  PlusOutlined,
  DollarOutlined,
  FileTextOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";

export default function PayrollPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Payroll"
        subtitle="Process salaries, manage structures, and generate payslips"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Payroll" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Payroll Run
          </Button>
        }
      />

      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Monthly Payroll
              </span>
            }
            value={485200}
            prefix={
              <DollarOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
            formatter={(val) => `$${Number(val).toLocaleString()}`}
            trend="up"
            trendValue="+2.1%"
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Pending Payslips
              </span>
            }
            value={18}
            prefix={
              <FileTextOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Next Run
              </span>
            }
            value="Jun 28"
            prefix={
              <CalendarOutlined
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
        <DollarOutlined
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
          Payroll Processing
        </div>
        <div style={{ fontSize: 13 }}>
          Payroll runs, salary structures, and payslips will be managed here.
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <Tag>Payroll Runs</Tag>
          <Tag>Salary Structures</Tag>
          <Tag>Payslips</Tag>
        </div>
      </div>
    </div>
  );
}
