"use client";

import React, { useState } from "react";
import { Button, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import type { ColumnsType } from "antd/es/table";

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  totalHours: number;
  employees: number;
  status: string;
}

const mockShifts: Shift[] = [
  {
    id: "1",
    name: "Morning Shift",
    startTime: "06:00 AM",
    endTime: "02:00 PM",
    breakDuration: "30 min",
    totalHours: 7.5,
    employees: 24,
    status: "active",
  },
  {
    id: "2",
    name: "General Shift",
    startTime: "09:00 AM",
    endTime: "06:00 PM",
    breakDuration: "1 hr",
    totalHours: 8,
    employees: 45,
    status: "active",
  },
  {
    id: "3",
    name: "Evening Shift",
    startTime: "02:00 PM",
    endTime: "10:00 PM",
    breakDuration: "30 min",
    totalHours: 7.5,
    employees: 18,
    status: "active",
  },
  {
    id: "4",
    name: "Night Shift",
    startTime: "10:00 PM",
    endTime: "06:00 AM",
    breakDuration: "1 hr",
    totalHours: 7,
    employees: 12,
    status: "active",
  },
  {
    id: "5",
    name: "Flexible",
    startTime: "Flex",
    endTime: "Flex",
    breakDuration: "1 hr",
    totalHours: 8,
    employees: 15,
    status: "active",
  },
  {
    id: "6",
    name: "Weekend Only",
    startTime: "10:00 AM",
    endTime: "06:00 PM",
    breakDuration: "30 min",
    totalHours: 7.5,
    employees: 0,
    status: "inactive",
  },
];

export default function ShiftsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockShifts.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Shift> = [
    {
      title: "Shift Name",
      dataIndex: "name",
      key: "name",
      width: 180,
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
      title: "Start",
      dataIndex: "startTime",
      key: "start",
      width: 110,
      render: (v: string) => (
        <span style={{ color: "#6dd58c", fontWeight: 500, fontSize: 13 }}>
          {v}
        </span>
      ),
    },
    {
      title: "End",
      dataIndex: "endTime",
      key: "end",
      width: 110,
      render: (v: string) => (
        <span style={{ color: "#c3f5ff", fontWeight: 500, fontSize: 13 }}>
          {v}
        </span>
      ),
    },
    {
      title: "Break",
      dataIndex: "breakDuration",
      key: "break",
      width: 90,
      render: (v: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Hours",
      dataIndex: "totalHours",
      key: "hours",
      width: 80,
      render: (v: number) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-primary)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {v}h
        </span>
      ),
    },
    {
      title: "Employees",
      dataIndex: "employees",
      key: "employees",
      width: 100,
      sorter: (a, b) => a.employees - b.employees,
      render: (v: number) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 14,
            fontWeight: 600,
            color: "var(--color-on-surface)",
          }}
        >
          {v}
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
        title="Shifts"
        subtitle={`${filtered.length} shift configurations`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Attendance", href: "/attendance" },
          { label: "Shifts" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Shift
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search shifts..."
      />
      <DataTable<Shift> columns={columns} dataSource={filtered} rowKey="id" />
    </div>
  );
}
