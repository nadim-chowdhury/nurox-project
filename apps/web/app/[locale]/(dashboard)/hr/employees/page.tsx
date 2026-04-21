"use client";

import React, { useState } from "react";
import { Button, Space, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { confirmModal } from "@/components/common/ConfirmModal";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  designation: string;
  status: string;
  joinDate: string;
}

// Mock data — will be replaced by useGetEmployeesQuery
const mockEmployees: Employee[] = [
  {
    id: "1",
    firstName: "Sarah",
    lastName: "Ahmed",
    email: "sarah.ahmed@nurox.com",
    department: "Engineering",
    designation: "Sr. Frontend Developer",
    status: "ACTIVE",
    joinDate: "2023-03-15",
  },
  {
    id: "2",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@nurox.com",
    department: "Engineering",
    designation: "Backend Developer",
    status: "ACTIVE",
    joinDate: "2023-06-01",
  },
  {
    id: "3",
    firstName: "Fatima",
    lastName: "Khan",
    email: "fatima.khan@nurox.com",
    department: "Human Resources",
    designation: "HR Manager",
    status: "ACTIVE",
    joinDate: "2022-11-20",
  },
  {
    id: "4",
    firstName: "Michael",
    lastName: "Chen",
    email: "michael.chen@nurox.com",
    department: "Finance",
    designation: "Financial Analyst",
    status: "ACTIVE",
    joinDate: "2024-01-10",
  },
  {
    id: "5",
    firstName: "Priya",
    lastName: "Sharma",
    email: "priya.sharma@nurox.com",
    department: "Sales & Marketing",
    designation: "Sales Executive",
    status: "ON_LEAVE",
    joinDate: "2023-09-08",
  },
  {
    id: "6",
    firstName: "David",
    lastName: "Miller",
    email: "david.miller@nurox.com",
    department: "Operations",
    designation: "Operations Lead",
    status: "ACTIVE",
    joinDate: "2022-07-25",
  },
  {
    id: "7",
    firstName: "Aisha",
    lastName: "Rahman",
    email: "aisha.rahman@nurox.com",
    department: "Engineering",
    designation: "QA Engineer",
    status: "ACTIVE",
    joinDate: "2024-02-14",
  },
  {
    id: "8",
    firstName: "Robert",
    lastName: "Taylor",
    email: "robert.taylor@nurox.com",
    department: "Finance",
    designation: "Accountant",
    status: "SUSPENDED",
    joinDate: "2023-04-03",
  },
];

export default function EmployeesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = mockEmployees.filter(
    (e) =>
      `${e.firstName} ${e.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (emp: Employee) => {
    confirmModal({
      title: `Delete ${emp.firstName} ${emp.lastName}?`,
      content:
        "This will permanently remove the employee record. This action cannot be undone.",
      onOk: async () => {
        // Will be: await deleteEmployee(emp.id).unwrap()
      },
    });
  };

  const columns: ColumnsType<Employee> = [
    {
      title: "Employee",
      key: "name",
      width: 280,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Avatar name={`${record.firstName} ${record.lastName}`} size={36} />
          <div>
            <div
              style={{
                color: "var(--color-on-surface)",
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              {record.firstName} {record.lastName}
            </div>
            <div
              style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}
            >
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 180,
      filters: [...new Set(mockEmployees.map((e) => e.department))].map(
        (d) => ({ text: d, value: d }),
      ),
      onFilter: (value, record) => record.department === value,
      render: (dept: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {dept}
        </span>
      ),
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
      width: 200,
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
      width: 120,
      filters: [
        { text: "Active", value: "ACTIVE" },
        { text: "On Leave", value: "ON_LEAVE" },
        { text: "Suspended", value: "SUSPENDED" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: "Joined",
      dataIndex: "joinDate",
      key: "joinDate",
      width: 130,
      sorter: (a, b) =>
        new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime(),
      render: (date: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {formatDate(date)}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 120,
      align: "right" as const,
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="View">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              style={{ color: "var(--color-on-surface-variant)" }}
              onClick={() => router.push(`/hr/employees/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              style={{ color: "var(--color-on-surface-variant)" }}
              onClick={() => router.push(`/hr/employees/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              style={{ color: "var(--color-error)" }}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Employees"
        subtitle={`${filtered.length} employees found`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Employees" },
        ]}
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

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, or department..."
        showExport
        showRefresh
      />

      <DataTable<Employee>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
      />
    </div>
  );
}
