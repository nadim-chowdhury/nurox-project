"use client";

import React, { useState } from "react";
import { Button } from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  source: string;
  status: string;
  assignedTo: string;
  createdAt: string;
}

const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Alex Morgan",
    company: "TechStart Inc",
    email: "alex@techstart.io",
    source: "Website",
    status: "qualified",
    assignedTo: "Priya Sharma",
    createdAt: "2026-04-20",
  },
  {
    id: "2",
    name: "Nina Patel",
    company: "DataFlow Ltd",
    email: "nina@dataflow.com",
    source: "Referral",
    status: "open",
    assignedTo: "James Wilson",
    createdAt: "2026-04-19",
  },
  {
    id: "3",
    name: "Carlos Rivera",
    company: "BuildRight Co",
    email: "carlos@buildright.com",
    source: "LinkedIn",
    status: "contacted",
    assignedTo: "Priya Sharma",
    createdAt: "2026-04-18",
  },
  {
    id: "4",
    name: "Emma Chen",
    company: "FinEdge",
    email: "emma@finedge.io",
    source: "Conference",
    status: "qualified",
    assignedTo: "David Miller",
    createdAt: "2026-04-17",
  },
  {
    id: "5",
    name: "Tom Baker",
    company: "GreenLogix",
    email: "tom@greenlogix.com",
    source: "Cold Call",
    status: "open",
    assignedTo: "James Wilson",
    createdAt: "2026-04-16",
  },
  {
    id: "6",
    name: "Lara Kim",
    company: "NovaHealth",
    email: "lara@novahealth.co",
    source: "Website",
    status: "lost",
    assignedTo: "Priya Sharma",
    createdAt: "2026-04-14",
  },
];

const SOURCE_COLORS: Record<string, string> = {
  Website: "#c3f5ff",
  Referral: "#6dd58c",
  LinkedIn: "#80d8ff",
  Conference: "#ffb347",
  "Cold Call": "#9aa5be",
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockLeads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.company.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Lead> = [
    {
      title: "Lead",
      key: "name",
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
            {r.name}
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
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (v: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Source",
      dataIndex: "source",
      key: "source",
      width: 110,
      render: (s: string) => (
        <StatusTag
          status={s.toLowerCase().replace(" ", "_")}
          label={s}
          color={SOURCE_COLORS[s]}
        />
      ),
    },
    {
      title: "Assigned To",
      key: "assigned",
      width: 160,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={r.assignedTo} size={24} />
          <span
            style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
          >
            {r.assignedTo}
          </span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "date",
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
        title="Leads"
        subtitle={`${filtered.length} leads`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Sales", href: "/sales" },
          { label: "Leads" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Lead
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search leads..."
        showExport
      />
      <DataTable<Lead> columns={columns} dataSource={filtered} rowKey="id" />
    </div>
  );
}
