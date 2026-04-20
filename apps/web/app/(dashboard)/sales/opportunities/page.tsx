"use client";

import React, { useState } from "react";
import { Button } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface Opportunity {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  owner: string;
  closeDate: string;
}

const mockOpps: Opportunity[] = [
  {
    id: "1",
    title: "ERP Implementation",
    company: "Acme Corp",
    value: 120000,
    stage: "proposal",
    probability: 60,
    owner: "Priya Sharma",
    closeDate: "2026-05-15",
  },
  {
    id: "2",
    title: "Cloud Migration",
    company: "TechStart Inc",
    value: 85000,
    stage: "negotiation",
    probability: 75,
    owner: "James Wilson",
    closeDate: "2026-05-01",
  },
  {
    id: "3",
    title: "Data Analytics Suite",
    company: "FinEdge",
    value: 45000,
    stage: "qualified",
    probability: 30,
    owner: "David Miller",
    closeDate: "2026-06-01",
  },
  {
    id: "4",
    title: "Mobile App Dev",
    company: "GreenLogix",
    value: 65000,
    stage: "proposal",
    probability: 50,
    owner: "Priya Sharma",
    closeDate: "2026-05-20",
  },
  {
    id: "5",
    title: "Security Audit",
    company: "NovaHealth",
    value: 28000,
    stage: "won",
    probability: 100,
    owner: "James Wilson",
    closeDate: "2026-04-10",
  },
  {
    id: "6",
    title: "API Integration",
    company: "BuildRight Co",
    value: 35000,
    stage: "lost",
    probability: 0,
    owner: "David Miller",
    closeDate: "2026-04-05",
  },
];

export default function OpportunitiesPage() {
  const [search, setSearch] = useState("");
  const filtered = mockOpps.filter(
    (o) =>
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.company.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Opportunity> = [
    {
      title: "Opportunity",
      key: "title",
      width: 220,
      render: (_, r) => (
        <div>
          <div
            style={{
              color: "var(--color-on-surface)",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {r.title}
          </div>
          <div
            style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}
          >
            {r.company}
          </div>
        </div>
      ),
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      width: 130,
      sorter: (a, b) => a.value - b.value,
      render: (v: number) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-primary)",
            fontWeight: 700,
          }}
        >
          {formatCurrency(v)}
        </span>
      ),
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      width: 120,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: "Probability",
      dataIndex: "probability",
      key: "prob",
      width: 100,
      sorter: (a, b) => a.probability - b.probability,
      render: (v: number) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: v >= 70 ? "#6dd58c" : v >= 40 ? "#ffb347" : "#9aa5be",
            fontWeight: 600,
          }}
        >
          {v}%
        </span>
      ),
    },
    {
      title: "Owner",
      key: "owner",
      width: 150,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={r.owner} size={24} />
          <span
            style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
          >
            {r.owner}
          </span>
        </div>
      ),
    },
    {
      title: "Close Date",
      dataIndex: "closeDate",
      key: "close",
      width: 120,
      render: (d: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: () => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          style={{ color: "var(--color-on-surface-variant)" }}
        />
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Opportunities"
        subtitle={`${filtered.length} opportunities · Pipeline: ${formatCurrency(filtered.reduce((a, b) => a + b.value, 0))}`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Sales", href: "/sales" },
          { label: "Opportunities" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            New Opportunity
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search opportunities..."
        showExport
      />
      <DataTable<Opportunity>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
      />
    </div>
  );
}
