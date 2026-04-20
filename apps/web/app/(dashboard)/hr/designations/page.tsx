"use client";

import React, { useState } from "react";
import { Button, Tag, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import type { ColumnsType } from "antd/es/table";

interface Designation {
  id: string;
  title: string;
  department: string;
  level: string;
  headcount: number;
  salaryRange: string;
  status: string;
}

const mockDesignations: Designation[] = [
  {
    id: "1",
    title: "Chief Executive Officer",
    department: "Executive",
    level: "C-Suite",
    headcount: 1,
    salaryRange: "$200K–$350K",
    status: "active",
  },
  {
    id: "2",
    title: "VP of Engineering",
    department: "Engineering",
    level: "VP",
    headcount: 1,
    salaryRange: "$150K–$220K",
    status: "active",
  },
  {
    id: "3",
    title: "Sr. Frontend Developer",
    department: "Engineering",
    level: "Senior",
    headcount: 4,
    salaryRange: "$90K–$140K",
    status: "active",
  },
  {
    id: "4",
    title: "Backend Developer",
    department: "Engineering",
    level: "Mid",
    headcount: 6,
    salaryRange: "$70K–$110K",
    status: "active",
  },
  {
    id: "5",
    title: "QA Engineer",
    department: "Engineering",
    level: "Mid",
    headcount: 3,
    salaryRange: "$60K–$95K",
    status: "active",
  },
  {
    id: "6",
    title: "HR Manager",
    department: "Human Resources",
    level: "Manager",
    headcount: 2,
    salaryRange: "$80K–$120K",
    status: "active",
  },
  {
    id: "7",
    title: "Financial Analyst",
    department: "Finance",
    level: "Mid",
    headcount: 3,
    salaryRange: "$65K–$100K",
    status: "active",
  },
  {
    id: "8",
    title: "Sales Executive",
    department: "Sales & Marketing",
    level: "Mid",
    headcount: 5,
    salaryRange: "$55K–$85K",
    status: "active",
  },
  {
    id: "9",
    title: "Junior Developer",
    department: "Engineering",
    level: "Junior",
    headcount: 0,
    salaryRange: "$45K–$65K",
    status: "inactive",
  },
  {
    id: "10",
    title: "Operations Lead",
    department: "Operations",
    level: "Lead",
    headcount: 2,
    salaryRange: "$75K–$110K",
    status: "active",
  },
];

const LEVEL_COLORS: Record<string, string> = {
  "C-Suite": "#c3f5ff",
  VP: "#80d8ff",
  Manager: "#6dd58c",
  Lead: "#e3eeff",
  Senior: "#ffb347",
  Mid: "#9aa5be",
  Junior: "#9aa5be",
};

export default function DesignationsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockDesignations.filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.department.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Designation> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 260,
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (val: string) => (
        <span
          style={{
            color: "var(--color-on-surface)",
            fontWeight: 500,
            fontSize: 13,
          }}
        >
          {val}
        </span>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 180,
      filters: [...new Set(mockDesignations.map((d) => d.department))].map(
        (d) => ({ text: d, value: d }),
      ),
      onFilter: (value, record) => record.department === value,
      render: (val: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {val}
        </span>
      ),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 120,
      render: (level: string) => (
        <Tag
          style={{
            background: `${LEVEL_COLORS[level] || "#9aa5be"}15`,
            color: LEVEL_COLORS[level] || "#9aa5be",
            border: `1px solid ${LEVEL_COLORS[level] || "#9aa5be"}30`,
            borderRadius: 4,
            fontSize: 12,
          }}
        >
          {level}
        </Tag>
      ),
    },
    {
      title: "Headcount",
      dataIndex: "headcount",
      key: "headcount",
      width: 110,
      sorter: (a, b) => a.headcount - b.headcount,
      render: (val: number) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color:
              val > 0
                ? "var(--color-primary)"
                : "var(--color-on-surface-variant)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {val}
        </span>
      ),
    },
    {
      title: "Salary Range",
      dataIndex: "salaryRange",
      key: "salaryRange",
      width: 150,
      render: (val: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {val}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: "",
      key: "actions",
      width: 80,
      align: "right" as const,
      render: () => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            style={{ color: "var(--color-on-surface-variant)" }}
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            style={{ color: "var(--color-error)" }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Designations"
        subtitle={`${filtered.length} designations configured`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Designations" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Designation
          </Button>
        }
      />

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search designations..."
      />

      <DataTable<Designation>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
      />
    </div>
  );
}
