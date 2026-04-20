"use client";

import React from "react";
import { Row, Col, Button, Tag } from "antd";
import {
  PlusOutlined,
  TeamOutlined,
  ApartmentOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";

export default function HRPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Human Resources"
        subtitle="Manage your workforce, departments, and performance"
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "HR" }]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Employee
          </Button>
        }
      />

      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Total Employees
              </span>
            }
            value={284}
            prefix={
              <TeamOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
            trend="up"
            trendValue="+4.4%"
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Departments
              </span>
            }
            value={12}
            prefix={
              <ApartmentOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Avg. Performance
              </span>
            }
            value={87}
            suffix="%"
            prefix={
              <TrophyOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
            trend="up"
            trendValue="+2.1%"
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
        <TeamOutlined
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
          Employee Management
        </div>
        <div style={{ fontSize: 13 }}>
          Employee list, departments, and performance reviews will be built
          here.
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <Tag>Employees</Tag>
          <Tag>Departments</Tag>
          <Tag>Designations</Tag>
          <Tag>Performance</Tag>
        </div>
      </div>
    </div>
  );
}
