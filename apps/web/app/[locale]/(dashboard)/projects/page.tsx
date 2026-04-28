"use client";

import React from "react";
import { Row, Col, Card, Progress, Button } from "antd";
import {
  PlusOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";

interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  status: string;
  team: string[];
  tasks: { total: number; done: number };
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Nurox ERP v2.0",
    client: "Internal",
    progress: 42,
    status: "in_progress",
    team: ["Sarah Ahmed", "James Wilson", "Fatima Khan"],
    tasks: { total: 64, done: 27 },
  },
  {
    id: "2",
    name: "TechStart Cloud Migration",
    client: "TechStart Inc",
    progress: 78,
    status: "in_progress",
    team: ["Michael Chen", "David Miller"],
    tasks: { total: 32, done: 25 },
  },
  {
    id: "3",
    name: "FinEdge Data Analytics",
    client: "FinEdge",
    progress: 15,
    status: "in_progress",
    team: ["Priya Sharma", "Aisha Rahman"],
    tasks: { total: 28, done: 4 },
  },
  {
    id: "4",
    name: "BuildRight Mobile App",
    client: "BuildRight Co",
    progress: 100,
    status: "completed",
    team: ["James Wilson"],
    tasks: { total: 18, done: 18 },
  },
  {
    id: "5",
    name: "GreenLogix API Integration",
    client: "GreenLogix",
    progress: 0,
    status: "not_started",
    team: ["David Miller", "Sarah Ahmed"],
    tasks: { total: 12, done: 0 },
  },
];

export default function ProjectsPage() {
  const router = useRouter();

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Projects"
        subtitle="Project tracking and task management"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Projects" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Project
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Active Projects" value="3" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Total Tasks" value="154" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Completed" value="74" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Team Members" value="8" />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {mockProjects.map((p) => (
          <Col xs={24} sm={12} lg={8} key={p.id}>
            <Card
              hoverable
              onClick={() => router.push(`/projects/${p.id}`)}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--ghost-border)",
                borderRadius: 4,
                cursor: "pointer",
              }}
              styles={{ body: { padding: 24 } }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--color-on-surface)",
                      fontWeight: 600,
                      fontSize: 15,
                      margin: 0,
                    }}
                  >
                    {p.name}
                  </h3>
                  <span
                    style={{
                      color: "var(--color-on-surface-variant)",
                      fontSize: 12,
                    }}
                  >
                    {p.client}
                  </span>
                </div>
                <StatusTag status={p.status} />
              </div>

              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      color: "var(--color-on-surface-variant)",
                      fontSize: 12,
                    }}
                  >
                    Progress
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--color-on-surface)",
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    {p.progress}%
                  </span>
                </div>
                <Progress
                  percent={p.progress}
                  size="small"
                  showInfo={false}
                  strokeColor={p.progress === 100 ? "#6dd58c" : "#c3f5ff"}
                  trailColor="rgba(195,245,255,0.1)"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: -8 }}>
                  {p.team.slice(0, 3).map((name) => (
                    <Avatar key={name} name={name} size={24} />
                  ))}
                  {p.team.length > 3 && (
                    <span
                      style={{
                        color: "var(--color-on-surface-variant)",
                        fontSize: 11,
                        marginLeft: 8,
                      }}
                    >
                      +{p.team.length - 3}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 12,
                  }}
                >
                  {p.tasks.done}/{p.tasks.total} tasks
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
