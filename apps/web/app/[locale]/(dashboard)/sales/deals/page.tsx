"use client";

import React from "react";
import { Card, Tag, Button } from "antd";
import { PlusOutlined, FunnelPlotOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";

interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: string;
  probability: number;
  owner: string;
  closeDate: string;
}

const mockDeals: Deal[] = [
  {
    id: "1",
    title: "Enterprise License",
    customer: "Acme Corp",
    value: 250000,
    stage: "NEGOTIATION",
    probability: 70,
    owner: "James Wilson",
    closeDate: "2025-08-15",
  },
  {
    id: "2",
    title: "Platform Integration",
    customer: "TechFlow Inc",
    value: 180000,
    stage: "PROPOSAL",
    probability: 50,
    owner: "Priya Sharma",
    closeDate: "2025-09-01",
  },
  {
    id: "3",
    title: "Annual Renewal",
    customer: "GlobalTrade Ltd",
    value: 95000,
    stage: "CLOSED_WON",
    probability: 100,
    owner: "James Wilson",
    closeDate: "2025-06-30",
  },
  {
    id: "4",
    title: "Pilot Program",
    customer: "DataSync Co",
    value: 45000,
    stage: "QUALIFICATION",
    probability: 25,
    owner: "Priya Sharma",
    closeDate: "2025-10-15",
  },
  {
    id: "5",
    title: "Cloud Migration",
    customer: "CloudNine Solutions",
    value: 320000,
    stage: "DISCOVERY",
    probability: 15,
    owner: "James Wilson",
    closeDate: "2025-11-01",
  },
];

const stageMap: Record<string, string> = {
  DISCOVERY: "default",
  QUALIFICATION: "processing",
  PROPOSAL: "warning",
  NEGOTIATION: "cyan",
  CLOSED_WON: "success",
  CLOSED_LOST: "error",
};

const columns: ColumnsType<Deal> = [
  {
    title: "Deal",
    dataIndex: "title",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Customer",
    dataIndex: "customer",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface-variant)" }}>{v}</span>
    ),
  },
  {
    title: "Value",
    dataIndex: "value",
    sorter: (a, b) => a.value - b.value,
    align: "right" as const,
    render: (v: number) => (
      <span className="font-display" style={{ color: "var(--color-primary)" }}>
        ${v.toLocaleString()}
      </span>
    ),
  },
  {
    title: "Stage",
    dataIndex: "stage",
    filters: [
      { text: "Discovery", value: "DISCOVERY" },
      { text: "Qualification", value: "QUALIFICATION" },
      { text: "Proposal", value: "PROPOSAL" },
      { text: "Negotiation", value: "NEGOTIATION" },
      { text: "Closed Won", value: "CLOSED_WON" },
    ],
    onFilter: (value, record) => record.stage === value,
    render: (s: string) => (
      <Tag color={stageMap[s] || "default"}>{s.replace(/_/g, " ")}</Tag>
    ),
  },
  {
    title: "Probability",
    dataIndex: "probability",
    align: "right" as const,
    render: (v: number) => (
      <span
        className="font-display"
        style={{
          color:
            v >= 70
              ? "var(--color-success)"
              : v >= 40
                ? "var(--color-warning)"
                : "var(--color-on-surface-variant)",
        }}
      >
        {v}%
      </span>
    ),
  },
  {
    title: "Owner",
    dataIndex: "owner",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface-variant)" }}>{v}</span>
    ),
  },
  {
    title: "Close Date",
    dataIndex: "closeDate",
    sorter: (a, b) =>
      new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime(),
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {new Date(v).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </span>
    ),
  },
];

export default function DealsPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Deals"
        subtitle="Track deals through the sales pipeline"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Sales", href: "/sales" },
          { label: "Deals" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Deal
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<Deal> columns={columns} dataSource={mockDeals} rowKey="id" />
      </Card>
    </div>
  );
}
