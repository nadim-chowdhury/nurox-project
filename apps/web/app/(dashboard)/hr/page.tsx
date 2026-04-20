"use client";

import React from "react";
import { Row, Col, Card, Button } from "antd";
import {
  TeamOutlined,
  ApartmentOutlined,
  TrophyOutlined,
  IdcardOutlined,
  UserAddOutlined,
  RightOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";

const modules = [
  {
    title: "Employees",
    description: "View, add, and manage employee records",
    icon: <TeamOutlined style={{ fontSize: 28, color: "#c3f5ff" }} />,
    href: "/hr/employees",
    count: "284",
  },
  {
    title: "Departments",
    description: "Organizational structure and teams",
    icon: <ApartmentOutlined style={{ fontSize: 28, color: "#80d8ff" }} />,
    href: "/hr/departments",
    count: "12",
  },
  {
    title: "Designations",
    description: "Job titles, levels, and salary bands",
    icon: <IdcardOutlined style={{ fontSize: 28, color: "#6dd58c" }} />,
    href: "/hr/designations",
    count: "32",
  },
  {
    title: "Recruitment",
    description: "Job postings and applicant tracking",
    icon: <UserAddOutlined style={{ fontSize: 28, color: "#ffb347" }} />,
    href: "/hr/recruitment",
    count: "6 open",
  },
  {
    title: "Performance",
    description: "Reviews, goals, and appraisals",
    icon: <TrophyOutlined style={{ fontSize: 28, color: "#e3eeff" }} />,
    href: "/hr/performance",
    count: "87%",
  },
];

export default function HRPage() {
  const router = useRouter();

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Human Resources"
        subtitle="Manage your workforce, departments, and performance"
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "HR" }]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/hr/employees/new")}
          >
            Add Employee
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Total Employees" value="284" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Active" value="271" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="On Leave" value="8" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Open Positions" value="6" />
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
                  transition: "border-color 0.2s",
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
