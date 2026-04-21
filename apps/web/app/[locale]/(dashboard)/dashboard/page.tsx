"use client";

import React from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Space,
  Tag,
  Progress,
  Button,
  Table,
  List,
} from "antd";
import {
  TeamOutlined,
  DollarOutlined,
  RiseOutlined,
  FileTextOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  RightOutlined,
  FunnelPlotOutlined,
  ApartmentOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useAppSelector } from "@/hooks/useRedux";
import { Avatar } from "@/components/common/Avatar";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";

const { Title, Text } = Typography;

const kpiData = [
  {
    title: "Total Employees",
    value: "284",
    prefix: <TeamOutlined />,
    trend: "+4.4%",
    up: true,
    color: "#c3f5ff",
  },
  {
    title: "Monthly Payroll",
    value: "$485,200",
    prefix: <DollarOutlined />,
    trend: "+2.1%",
    up: true,
    color: "#6dd58c",
  },
  {
    title: "Revenue (MTD)",
    value: "$1.24M",
    prefix: <RiseOutlined />,
    trend: "+15.3%",
    up: true,
    color: "#80d8ff",
  },
  {
    title: "Pending Invoices",
    value: "23",
    prefix: <FileTextOutlined />,
    trend: "-8.2%",
    up: false,
    color: "#ffb347",
  },
];

const quickActions = [
  {
    label: "New Employee",
    icon: <TeamOutlined />,
    href: "/hr/employees/new",
    color: "#c3f5ff",
  },
  {
    label: "Create Invoice",
    icon: <FileTextOutlined />,
    href: "/finance/invoices",
    color: "#6dd58c",
  },
  {
    label: "Apply Leave",
    icon: <CalendarOutlined />,
    href: "/leave/apply",
    color: "#80d8ff",
  },
  {
    label: "Add Task",
    icon: <ProjectOutlined />,
    href: "/projects/tasks",
    color: "#ffb347",
  },
];

const upcomingLeaves = [
  {
    name: "Sarah Ahmed",
    type: "Annual",
    from: "Apr 25",
    to: "Apr 28",
    days: 3,
  },
  { name: "James Wilson", type: "Annual", from: "May 1", to: "May 5", days: 5 },
  {
    name: "Michael Chen",
    type: "Annual",
    from: "May 10",
    to: "May 15",
    days: 6,
  },
];

const recentHires = [
  { name: "Emma Roberts", department: "Engineering", date: "Apr 15, 2026" },
  { name: "Liam Chen", department: "Sales & Marketing", date: "Apr 10, 2026" },
  { name: "Nadia Hassan", department: "Finance", date: "Apr 3, 2026" },
];

const pendingApprovals = [
  {
    type: "Leave Request",
    from: "James Wilson",
    date: "Apr 19",
    status: "pending",
  },
  {
    type: "Purchase Requisition",
    from: "David Miller",
    date: "Apr 18",
    status: "pending",
  },
  {
    type: "Expense Claim",
    from: "Priya Sharma",
    date: "Apr 17",
    status: "pending",
  },
  {
    type: "Leave Request",
    from: "Aisha Rahman",
    date: "Apr 19",
    status: "pending",
  },
];

const recentActivity = [
  {
    action: "Leave approved for Sarah Ahmed",
    user: "HR Manager",
    time: "2 min ago",
    type: "success" as const,
  },
  {
    action: "Invoice #INV-2026-0042 sent to Acme Corp",
    user: "Finance Team",
    time: "15 min ago",
    type: "processing" as const,
  },
  {
    action: "New employee Emma Roberts onboarded",
    user: "HR Department",
    time: "1 hour ago",
    type: "success" as const,
  },
  {
    action: "Payroll run April 2026 initiated",
    user: "Payroll Manager",
    time: "3 hours ago",
    type: "warning" as const,
  },
  {
    action: "Low stock alert: Server Rack components",
    user: "Warehouse #2",
    time: "5 hours ago",
    type: "error" as const,
  },
  {
    action: "Deal closed: Cloud Migration — TechStart",
    user: "Priya Sharma",
    time: "6 hours ago",
    type: "success" as const,
  },
];

const departments = [
  { name: "Engineering", headcount: 82, utilization: 94 },
  { name: "Sales & Marketing", headcount: 45, utilization: 87 },
  { name: "Human Resources", headcount: 18, utilization: 91 },
  { name: "Finance", headcount: 24, utilization: 88 },
  { name: "Operations", headcount: 56, utilization: 92 },
];

const pipelineData = [
  { stage: "Qualified", count: 8, value: 320000, color: "#9aa5be" },
  { stage: "Proposal", count: 5, value: 475000, color: "#ffb347" },
  { stage: "Negotiation", count: 3, value: 280000, color: "#80d8ff" },
  { stage: "Won (MTD)", count: 4, value: 185000, color: "#6dd58c" },
];

/* ------------------------------------------------------------------ */
/* COMPONENT                                                           */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user);
  const greeting =
    new Date().getHours() < 12
      ? "Good morning"
      : new Date().getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Title
          level={3}
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-on-surface)",
            marginBottom: 4,
          }}
        >
          {greeting}, {user?.firstName || "there"} 👋
        </Title>
        <Text
          style={{ color: "var(--color-on-surface-variant)", fontSize: 14 }}
        >
          Here&apos;s your organization at a glance — {formatDate(new Date())}
        </Text>
      </div>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {kpiData.map((kpi) => (
          <Col xs={12} sm={12} lg={6} key={kpi.title}>
            <Card
              className="kpi-card"
              style={{ padding: 4, position: "relative", overflow: "hidden" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 16,
                  opacity: 0.08,
                  fontSize: 48,
                }}
              >
                {kpi.prefix}
              </div>
              <div
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 13,
                  marginBottom: 8,
                }}
              >
                {kpi.title}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--color-on-surface)",
                  marginBottom: 8,
                }}
              >
                {kpi.value}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {kpi.up ? (
                  <ArrowUpOutlined style={{ color: "#6dd58c", fontSize: 11 }} />
                ) : (
                  <ArrowDownOutlined
                    style={{ color: "#ffb4ab", fontSize: 11 }}
                  />
                )}
                <span
                  style={{
                    color: kpi.up ? "#6dd58c" : "#ffb4ab",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {kpi.trend}
                </span>
                <span
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 12,
                  }}
                >
                  vs last month
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {quickActions.map((action) => (
          <Col xs={12} sm={6} key={action.label}>
            <Link href={action.href}>
              <Card
                hoverable
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--ghost-border)",
                  borderRadius: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                styles={{ body: { padding: "16px 12px" } }}
              >
                <div
                  style={{ fontSize: 22, color: action.color, marginBottom: 6 }}
                >
                  {action.icon}
                </div>
                <div
                  style={{
                    color: "var(--color-on-surface)",
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  {action.label}
                </div>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Sales Pipeline */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-on-surface)",
                  fontWeight: 600,
                }}
              >
                <FunnelPlotOutlined
                  style={{ color: "#c3f5ff", marginRight: 8 }}
                />
                Sales Pipeline
              </span>
            }
            extra={
              <Link href="/sales/deals">
                <Button type="link" size="small">
                  View All <RightOutlined />
                </Button>
              </Link>
            }
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--ghost-border)",
              borderRadius: 4,
              height: "100%",
            }}
            styles={{ body: { padding: 20 } }}
          >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              {pipelineData.map((stage) => (
                <div key={stage.stage}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-on-surface)",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {stage.stage}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        color: stage.color,
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {stage.count} deals · {formatCurrency(stage.value)}
                    </span>
                  </div>
                  <Progress
                    percent={Math.round((stage.value / 500000) * 100)}
                    showInfo={false}
                    size="small"
                    strokeColor={stage.color}
                    trailColor="rgba(61, 74, 99, 0.15)"
                  />
                </div>
              ))}
              <div
                style={{
                  borderTop: "1px solid var(--ghost-border)",
                  paddingTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 13,
                  }}
                >
                  Total Pipeline
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-primary)",
                    fontWeight: 700,
                    fontSize: 15,
                  }}
                >
                  {formatCurrency(1260000)}
                </span>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Pending Approvals */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-on-surface)",
                  fontWeight: 600,
                }}
              >
                <WarningOutlined style={{ color: "#ffb347", marginRight: 8 }} />
                Pending Approvals
              </span>
            }
            extra={<Tag color="warning">{pendingApprovals.length}</Tag>}
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--ghost-border)",
              borderRadius: 4,
              height: "100%",
            }}
            styles={{ body: { padding: 0 } }}
          >
            <List
              dataSource={pendingApprovals}
              renderItem={(item) => (
                <List.Item
                  style={{
                    padding: "12px 20px",
                    borderBottom: "1px solid var(--ghost-border)",
                  }}
                  actions={[
                    <Button
                      key="approve"
                      type="primary"
                      size="small"
                      style={{ background: "#1a6b3a", borderColor: "#1a6b3a" }}
                    >
                      Approve
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar name={item.from} size={32} />}
                    title={
                      <span
                        style={{
                          color: "var(--color-on-surface)",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        {item.type}
                      </span>
                    }
                    description={
                      <span
                        style={{
                          color: "var(--color-on-surface-variant)",
                          fontSize: 12,
                        }}
                      >
                        {item.from} · {item.date}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Department Overview */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-on-surface)",
                  fontWeight: 600,
                }}
              >
                <ApartmentOutlined
                  style={{ color: "#80d8ff", marginRight: 8 }}
                />
                Department Overview
              </span>
            }
            extra={
              <Link href="/reports">
                <Button type="link" size="small">
                  Reports <RightOutlined />
                </Button>
              </Link>
            }
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--ghost-border)",
              borderRadius: 4,
              height: "100%",
            }}
            styles={{ body: { padding: 20 } }}
          >
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              {departments.map((dept) => (
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
                        fontSize: 13,
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
                  <div
                    style={{
                      width: 180,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Progress
                      percent={dept.utilization}
                      size="small"
                      showInfo={false}
                      strokeColor={{ "0%": "#c3f5ff", "100%": "#00e5ff" }}
                      trailColor="rgba(61, 74, 99, 0.2)"
                      style={{ flex: 1 }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "var(--color-on-surface)",
                        fontSize: 12,
                        fontWeight: 600,
                        minWidth: 32,
                      }}
                    >
                      {dept.utilization}%
                    </span>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Upcoming Leaves + Recent Hires */}
        <Col xs={24} lg={12}>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Card
                title={
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--color-on-surface)",
                      fontWeight: 600,
                    }}
                  >
                    <CalendarOutlined
                      style={{ color: "#80d8ff", marginRight: 8 }}
                    />
                    Upcoming Leaves
                  </span>
                }
                extra={
                  <Link href="/leave">
                    <Button type="link" size="small">
                      View <RightOutlined />
                    </Button>
                  </Link>
                }
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--ghost-border)",
                  borderRadius: 4,
                }}
                styles={{ body: { padding: "8px 20px" } }}
              >
                {upcomingLeaves.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom:
                        i < upcomingLeaves.length - 1
                          ? "1px solid var(--ghost-border)"
                          : "none",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar name={l.name} size={28} />
                      <div>
                        <div
                          style={{
                            color: "var(--color-on-surface)",
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          {l.name}
                        </div>
                        <div
                          style={{
                            color: "var(--color-on-surface-variant)",
                            fontSize: 11,
                          }}
                        >
                          {l.type} · {l.from} – {l.to}
                        </div>
                      </div>
                    </div>
                    <Tag
                      style={{
                        background: "rgba(128,216,255,0.1)",
                        color: "#80d8ff",
                        border: "1px solid rgba(128,216,255,0.2)",
                        borderRadius: 4,
                      }}
                    >
                      {l.days}d
                    </Tag>
                  </div>
                ))}
              </Card>
            </Col>
            <Col span={24}>
              <Card
                title={
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--color-on-surface)",
                      fontWeight: 600,
                    }}
                  >
                    <CheckCircleOutlined
                      style={{ color: "#6dd58c", marginRight: 8 }}
                    />
                    Recent Hires
                  </span>
                }
                extra={
                  <Link href="/hr/employees">
                    <Button type="link" size="small">
                      View <RightOutlined />
                    </Button>
                  </Link>
                }
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--ghost-border)",
                  borderRadius: 4,
                }}
                styles={{ body: { padding: "8px 20px" } }}
              >
                {recentHires.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom:
                        i < recentHires.length - 1
                          ? "1px solid var(--ghost-border)"
                          : "none",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <Avatar name={h.name} size={28} />
                      <div>
                        <div
                          style={{
                            color: "var(--color-on-surface)",
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                        >
                          {h.name}
                        </div>
                        <div
                          style={{
                            color: "var(--color-on-surface-variant)",
                            fontSize: 11,
                          }}
                        >
                          {h.department}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        color: "var(--color-on-surface-variant)",
                        fontSize: 11,
                      }}
                    >
                      {h.date}
                    </span>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Activity Feed */}
      <Card
        title={
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-on-surface)",
              fontWeight: 600,
            }}
          >
            <HistoryOutlined style={{ color: "#e3eeff", marginRight: 8 }} />
            Recent Activity
          </span>
        }
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
        }}
        styles={{ body: { padding: 0 } }}
      >
        {recentActivity.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 20px",
              borderBottom:
                i < recentActivity.length - 1
                  ? "1px solid var(--ghost-border)"
                  : "none",
              transition: "background 0.15s",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  item.type === "success"
                    ? "#6dd58c"
                    : item.type === "warning"
                      ? "#ffb347"
                      : item.type === "error"
                        ? "#ffb4ab"
                        : "#80d8ff",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ color: "var(--color-on-surface)", fontSize: 13 }}>
                {item.action}
              </span>
            </div>
            <span
              style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}
            >
              {item.user}
            </span>
            <span
              style={{
                color: "var(--color-on-surface-variant)",
                fontSize: 11,
                minWidth: 80,
                textAlign: "right",
              }}
            >
              <ClockCircleOutlined style={{ marginRight: 4, fontSize: 10 }} />
              {item.time}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}
