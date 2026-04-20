"use client";

import React from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Space,
  Tag,
  Progress,
} from "antd";
import {
  TeamOutlined,
  DollarOutlined,
  RiseOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const kpiData = [
  {
    title: "Total Employees",
    value: 284,
    prefix: <TeamOutlined />,
    suffix: <Tag color="success">+12</Tag>,
    trend: "up" as const,
    trendValue: "+4.4%",
  },
  {
    title: "Monthly Payroll",
    value: 485200,
    prefix: <DollarOutlined />,
    precision: 0,
    format: true,
    trend: "up" as const,
    trendValue: "+2.1%",
  },
  {
    title: "Revenue (MTD)",
    value: 1240000,
    prefix: <RiseOutlined />,
    precision: 0,
    format: true,
    trend: "up" as const,
    trendValue: "+15.3%",
  },
  {
    title: "Pending Invoices",
    value: 23,
    prefix: <FileTextOutlined />,
    trend: "down" as const,
    trendValue: "-8.2%",
  },
];

const recentActivity = [
  {
    action: "Leave approved",
    user: "Sarah Ahmed",
    time: "2 min ago",
    type: "success" as const,
  },
  {
    action: "Invoice #INV-2024",
    user: "Finance Team",
    time: "15 min ago",
    type: "processing" as const,
  },
  {
    action: "New employee onboarded",
    user: "HR Department",
    time: "1 hour ago",
    type: "success" as const,
  },
  {
    action: "Payroll run initiated",
    user: "Payroll Manager",
    time: "3 hours ago",
    type: "warning" as const,
  },
  {
    action: "Stock alert: Low inventory",
    user: "Warehouse #2",
    time: "5 hours ago",
    type: "error" as const,
  },
];

export default function DashboardPage() {
  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <Title
          level={3}
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-on-surface)",
            marginBottom: 4,
          }}
        >
          Dashboard
        </Title>
        <Text
          style={{ color: "var(--color-on-surface-variant)", fontSize: 14 }}
        >
          Welcome back — here&apos;s your organization at a glance.
        </Text>
      </div>

      {/* KPI Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        {kpiData.map((kpi) => (
          <Col xs={24} sm={12} lg={6} key={kpi.title}>
            <Card className="kpi-card" style={{ padding: 4 }}>
              <Statistic
                title={
                  <span style={{ color: "var(--color-on-surface-variant)" }}>
                    {kpi.title}
                  </span>
                }
                value={kpi.value}
                precision={kpi.precision}
                prefix={
                  <span
                    style={{ color: "var(--color-primary)", marginRight: 8 }}
                  >
                    {kpi.prefix}
                  </span>
                }
                formatter={(val) =>
                  kpi.format ? `$${Number(val).toLocaleString()}` : String(val)
                }
              />
              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {kpi.trend === "up" ? (
                  <ArrowUpOutlined
                    style={{ color: "var(--color-success)", fontSize: 12 }}
                  />
                ) : (
                  <ArrowDownOutlined
                    style={{ color: "var(--color-error)", fontSize: 12 }}
                  />
                )}
                <Text
                  style={{
                    color:
                      kpi.trend === "up"
                        ? "var(--color-success)"
                        : "var(--color-error)",
                    fontSize: 12,
                  }}
                >
                  {kpi.trendValue}
                </Text>
                <Text
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 12,
                  }}
                >
                  vs last month
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Bottom Row */}
      <Row gutter={[20, 20]}>
        {/* Quick Stats */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <span
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              >
                Department Overview
              </span>
            }
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--ghost-border)",
            }}
          >
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
              {[
                { name: "Engineering", headcount: 82, utilization: 94 },
                { name: "Sales & Marketing", headcount: 45, utilization: 87 },
                { name: "Human Resources", headcount: 18, utilization: 91 },
                { name: "Finance", headcount: 24, utilization: 88 },
                { name: "Operations", headcount: 56, utilization: 92 },
              ].map((dept) => (
                <div
                  key={dept.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "var(--color-on-surface)",
                        fontWeight: 500,
                        display: "block",
                      }}
                    >
                      {dept.name}
                    </Text>
                    <Text
                      style={{
                        color: "var(--color-on-surface-variant)",
                        fontSize: 12,
                      }}
                    >
                      {dept.headcount} employees
                    </Text>
                  </div>
                  <div style={{ width: 200 }}>
                    <Progress
                      percent={dept.utilization}
                      size="small"
                      strokeColor={{
                        "0%": "#c3f5ff",
                        "100%": "#00e5ff",
                      }}
                      trailColor="rgba(61, 74, 99, 0.2)"
                    />
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              >
                Recent Activity
              </span>
            }
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--ghost-border)",
            }}
          >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    paddingBottom: i < recentActivity.length - 1 ? 16 : 0,
                    borderBottom:
                      i < recentActivity.length - 1
                        ? "1px solid rgba(61, 74, 99, 0.1)"
                        : "none",
                  }}
                >
                  <Tag
                    color={item.type}
                    style={{ margin: 0, minWidth: 8, minHeight: 8 }}
                  >
                    •
                  </Tag>
                  <div style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: "var(--color-on-surface)",
                        fontSize: 13,
                        display: "block",
                      }}
                    >
                      {item.action}
                    </Text>
                    <Text
                      style={{
                        color: "var(--color-on-surface-variant)",
                        fontSize: 12,
                      }}
                    >
                      {item.user}
                    </Text>
                  </div>
                  <Text
                    style={{
                      color: "var(--color-on-surface-variant)",
                      fontSize: 11,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <ClockCircleOutlined style={{ marginRight: 4 }} />
                    {item.time}
                  </Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
