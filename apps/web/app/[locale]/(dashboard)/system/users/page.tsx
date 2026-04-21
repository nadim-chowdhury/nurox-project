"use client";

import React, { useState } from "react";
import { Button, Space, message, Modal, Form, Input, Select, Row, Col } from "antd";
import {
  UserAddOutlined,
  FileTextOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { confirmModal } from "@/components/common/ConfirmModal";
import { useGetUsersQuery, useDeleteUserMutation, useInviteUserMutation } from "@/store/api/usersApi";
import { useGetRolesQuery } from "@/store/api/authApi";
import { usePagination } from "@/hooks/usePagination";
import { BulkUserImport } from "@/components/modules/system/BulkUserImport";
import type { ColumnsType } from "antd/es/table";
import type { UserResponseDto } from "@repo/shared-schemas";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const { tablePagination, queryParams } = usePagination();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading, isFetching, refetch } = useGetUsersQuery({
    page: queryParams.page,
    limit: queryParams.limit,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const { data: roles } = useGetRolesQuery();
  const [inviteUser, { isLoading: isInviting }] = useInviteUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const handleInvite = async (values: any) => {
    try {
      await inviteUser(values).unwrap();
      message.success("Invitation sent successfully");
      setIsInviteModalOpen(false);
      form.resetFields();
    } catch {
      message.error("Failed to send invitation");
    }
  };

  const handleDelete = (user: UserResponseDto) => {
    confirmModal({
      title: `Delete User: ${user.firstName} ${user.lastName}?`,
      content: "This will permanently disable their login. This action cannot be undone.",
      onOk: async () => {
        try {
          await deleteUser(user.id).unwrap();
          message.success("User deleted");
        } catch {
          message.error("Failed to delete user");
        }
      },
    });
  };

  const columns: ColumnsType<UserResponseDto> = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Space size={12}>
          <Avatar name={`${record.firstName} ${record.lastName}`} src={record.avatarUrl || undefined} size={36} />
          <div>
            <div style={{ fontWeight: 500, color: 'var(--color-on-surface)' }}>
              {record.firstName} {record.lastName}
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <span style={{ fontSize: 13, color: 'var(--color-on-surface-variant)' }}>{role}</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <StatusTag status={status} />,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <Space size={4}>
          <Button type="text" size="small" icon={<EditOutlined />} />
          <Button 
            type="text" 
            danger 
            size="small" 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Users & Invites"
        subtitle="Manage system access and user roles"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "System" },
          { label: "Users" },
        ]}
        extra={
          <Space>
            <Button icon={<FileTextOutlined />} onClick={() => setIsBulkImportOpen(true)}>
              Bulk Import
            </Button>
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              onClick={() => setIsInviteModalOpen(true)}
            >
              Invite User
            </Button>
          </Space>
        }
      />

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name or email..."
        showRefresh
        onRefresh={refetch}
        loading={isFetching}
      />

      <DataTable<UserResponseDto>
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading || isFetching}
        pagination={{
          ...tablePagination,
          total: data?.meta?.total || 0,
        }}
      />

      <Modal
        title="Invite New User"
        open={isInviteModalOpen}
        onCancel={() => setIsInviteModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isInviting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleInvite}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input placeholder="John" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input placeholder="Doe" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="john.doe@company.com" />
          </Form.Item>
          <Form.Item name="role" label="Assign Role" rules={[{ required: true }]}>
            <Select 
              placeholder="Select a role"
              options={roles?.map(r => ({ label: r.name, value: r.name }))} 
            />
          </Form.Item>
        </Form>
      </Modal>

      <BulkUserImport 
        open={isBulkImportOpen} 
        onClose={() => setIsBulkImportOpen(false)} 
        onSuccess={refetch} 
      />
    </div>
  );
}
