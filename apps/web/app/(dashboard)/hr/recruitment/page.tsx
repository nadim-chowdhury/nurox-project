"use client";

import React, { useState } from "react";
import { Button, Space, Row, Col } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  UserAddOutlined,
  FileSearchOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  applicants: number;
  postedDate: string;
  status: string;
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Senior Backend Developer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    applicants: 28,
    postedDate: "2026-04-10",
    status: "active",
  },
  {
    id: "2",
    title: "Product Designer",
    department: "Design",
    location: "San Francisco",
    type: "Full-time",
    applicants: 15,
    postedDate: "2026-04-12",
    status: "active",
  },
  {
    id: "3",
    title: "Financial Controller",
    department: "Finance",
    location: "New York",
    type: "Full-time",
    applicants: 8,
    postedDate: "2026-04-05",
    status: "active",
  },
  {
    id: "4",
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Contract",
    applicants: 22,
    postedDate: "2026-03-28",
    status: "active",
  },
  {
    id: "5",
    title: "Sales Manager",
    department: "Sales & Marketing",
    location: "Chicago",
    type: "Full-time",
    applicants: 11,
    postedDate: "2026-04-01",
    status: "paused",
  },
  {
    id: "6",
    title: "Office Coordinator",
    department: "Operations",
    location: "San Francisco",
    type: "Part-time",
    applicants: 35,
    postedDate: "2026-03-15",
    status: "closed",
  },
];

export default function RecruitmentPage() {
  const [search, setSearch] = useState("");
  const filtered = mockJobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()),
  );
  const activeJobs = mockJobs.filter((j) => j.status === "active").length;
  const totalApplicants = mockJobs.reduce((a, b) => a + b.applicants, 0);

  const columns: ColumnsType<Job> = [
    {
      title: "Position",
      dataIndex: "title",
      key: "title",
      width: 240,
      render: (v: string) => (
        <span
          style={{
            color: "var(--color-on-surface)",
            fontWeight: 500,
            fontSize: 13,
          }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "dept",
      width: 150,
      render: (v: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      width: 130,
      render: (v: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (t: string) => (
        <StatusTag status={t.toLowerCase().replace("-", "_")} label={t} />
      ),
    },
    {
      title: "Applicants",
      dataIndex: "applicants",
      key: "applicants",
      width: 100,
      sorter: (a, b) => a.applicants - b.applicants,
      render: (v: number) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-primary)",
            fontWeight: 700,
          }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Posted",
      dataIndex: "postedDate",
      key: "posted",
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (s: string) => <StatusTag status={s} />,
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
        title="Recruitment"
        subtitle="Job openings & applicant tracking"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Recruitment" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Post Job
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Active Jobs"
            value={`${activeJobs}`}
            prefix={<FileSearchOutlined style={{ color: "#6dd58c" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Total Applicants"
            value={`${totalApplicants}`}
            prefix={<UserAddOutlined style={{ color: "#c3f5ff" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Interviews Scheduled"
            value="12"
            prefix={<CheckSquareOutlined style={{ color: "#ffb347" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Offers Made"
            value="3"
            prefix={<UserAddOutlined style={{ color: "#80d8ff" }} />}
          />
        </Col>
      </Row>

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search positions..."
      />
      <DataTable<Job> columns={columns} dataSource={filtered} rowKey="id" />
    </div>
  );
}
