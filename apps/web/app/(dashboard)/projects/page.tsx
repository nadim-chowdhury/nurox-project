"use client";

import React from "react";
import { Row, Col, Button, Tag } from "antd";
import {
  PlusOutlined,
  ProjectOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";

export default function ProjectsPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Projects"
        subtitle="Track projects, tasks, milestones, and timesheets"
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

      <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Active Projects
              </span>
            }
            value={14}
            prefix={
              <ProjectOutlined
                style={{ color: "var(--color-primary)", marginRight: 8 }}
              />
            }
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Completed
              </span>
            }
            value={38}
            prefix={
              <CheckCircleOutlined
                style={{ color: "var(--color-success)", marginRight: 8 }}
              />
            }
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard
            title={
              <span style={{ color: "var(--color-on-surface-variant)" }}>
                Overdue Tasks
              </span>
            }
            value={5}
            prefix={
              <ClockCircleOutlined
                style={{ color: "var(--color-error)", marginRight: 8 }}
              />
            }
            trend="down"
            trendValue="-2"
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
        <ProjectOutlined
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
          Project Management
        </div>
        <div style={{ fontSize: 13 }}>
          Kanban boards, task tracking, milestones, and timesheet management
          will be here.
        </div>
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <Tag>Kanban</Tag>
          <Tag>Tasks</Tag>
          <Tag>Milestones</Tag>
          <Tag>Timesheets</Tag>
        </div>
      </div>
    </div>
  );
}
