"use client";

import React, { useState } from "react";
import { Button, Tag, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import type { ColumnsType } from "antd/es/table";
import { useGetDesignationsQuery, useGetDepartmentsQuery } from "@/store/api/hrApi";

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
  const { data: designations, isLoading } = useGetDesignationsQuery();
  const { data: departments } = useGetDepartmentsQuery();
  const [search, setSearch] = useState("");

  const filtered = (designations || []).filter(
    (d) =>
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.department?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<any> = [
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
      dataIndex: ["department", "name"],
      key: "department",
      width: 180,
      filters: (departments || []).map(
        (d) => ({ text: d.name, value: d.id as string }),
      ),
      onFilter: (value, record) => record.departmentId === value,
      render: (val: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {val || 'N/A'}
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
          {level || 'Standard'}
        </Tag>
      ),
    },
    {
      title: "Headcount",
      dataIndex: "headcount",
      key: "headcount",
      width: 110,
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
          {val || 0}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "status",
      width: 100,
      render: (isActive: boolean) => <StatusTag status={isActive ? "active" : "inactive"} />,
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

      <DataTable<any>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={isLoading}
      />
    </div>
  );
}
