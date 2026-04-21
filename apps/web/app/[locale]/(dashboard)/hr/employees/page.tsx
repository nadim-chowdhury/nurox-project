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
import { useGetEmployeesQuery, useDeleteEmployeeMutation, type Employee } from "@/store/api/hrApi";
import { usePagination } from "@/hooks/usePagination";
import { message } from "antd";
// Employee data is fetched via RTK Query

export default function EmployeesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { tablePagination, queryParams } = usePagination();

  const { data, isLoading, isFetching } = useGetEmployeesQuery({
    page: queryParams.page,
    limit: queryParams.limit,
    search: search || undefined,
    sortBy: "firstName",
    sortOrder: "ASC",
  });

  const [deleteEmployee] = useDeleteEmployeeMutation();

  const handleDelete = (emp: Employee) => {
    confirmModal({
      title: `Delete ${emp.firstName} ${emp.lastName}?`,
      content:
        "This will permanently remove the employee record. This action cannot be undone.",
      onOk: async () => {
        try {
          await deleteEmployee(emp.id).unwrap();
          message.success("Employee deleted successfully");
        } catch {
          message.error("Failed to delete employee");
        }
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
      filters: data
        ? [...new Set(data.data.map((e) => e.department))].map((d) => ({
            text: String(d),
            value: String(d),
          }))
        : [],
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
        subtitle={`${data?.meta?.total || 0} employees found`}
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
        loading={isLoading || isFetching}
      />

      <DataTable<Employee>
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading || isFetching}
        pagination={{
          ...tablePagination,
          total: data?.meta?.total || 0,
        }}
      />
    </div>
  );
}
