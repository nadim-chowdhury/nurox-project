"use client";

import React, { useState } from "react";
import { Button, Tag, Space, Modal, Form, Input, InputNumber, Switch, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import type { ColumnsType } from "antd/es/table";
import { useGetGradesQuery, useCreateGradeMutation, useUpdateGradeMutation, useDeleteGradeMutation } from "@/store/api/hrApi";
import { confirmModal } from "@/components/common/ConfirmModal";

interface Grade {
  id: string;
  name: string;
  level: number;
  minSalary: number;
  maxSalary: number;
  isActive: boolean;
}

export default function GradesPage() {
  const { data: grades, isLoading, refetch } = useGetGradesQuery();
  const [createGrade] = useCreateGradeMutation();
  const [updateGrade] = useUpdateGradeMutation();
  const [deleteGrade] = useDeleteGradeMutation();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [form] = Form.useForm();

  const filtered = (grades || []).filter(
    (g) => g.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    setEditingGrade(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    form.setFieldsValue(grade);
    setIsModalOpen(true);
  };

  const handleDelete = (grade: Grade) => {
    confirmModal({
      title: `Delete Grade: ${grade.name}?`,
      content: "This action cannot be undone and may affect linked employees.",
      onOk: async () => {
        try {
          await deleteGrade(grade.id).unwrap();
          message.success("Grade deleted");
          refetch();
        } catch {
          message.error("Failed to delete grade");
        }
      },
    });
  };

  const onFinish = async (values: any) => {
    try {
      if (editingGrade) {
        await updateGrade({ id: editingGrade.id, data: values }).unwrap();
        message.success("Grade updated");
      } else {
        await createGrade(values).unwrap();
        message.success("Grade created");
      }
      setIsModalOpen(false);
      refetch();
    } catch {
      message.error("Failed to save grade");
    }
  };

  const columns: ColumnsType<Grade> = [
    {
      title: "Grade Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (val: string) => (
        <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>{val}</span>
      ),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      sorter: (a, b) => a.level - b.level,
      render: (val: number) => <Tag color="blue">Level {val}</Tag>,
    },
    {
      title: "Min Salary",
      dataIndex: "minSalary",
      key: "minSalary",
      render: (val: number) => `$${Number(val).toLocaleString()}`,
    },
    {
      title: "Max Salary",
      dataIndex: "maxSalary",
      key: "maxSalary",
      render: (val: number) => `$${Number(val).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (val: boolean) => <StatusTag status={val ? "ACTIVE" : "INACTIVE"} />,
    },
    {
      title: "",
      key: "actions",
      width: 80,
      align: "right",
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            type="text"
            size="small"
            danger
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
        title="Pay Grades"
        subtitle="Manage salary bands and seniority levels"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Grades" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Grade
          </Button>
        }
      />

      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search grades..."
      />

      <DataTable<Grade>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={isLoading}
      />

      <Modal
        title={editingGrade ? "Edit Grade" : "Add Grade"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isActive: true }}>
          <Form.Item name="name" label="Grade Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. G1, Senior, Executive" />
          </Form.Item>
          <Form.Item name="level" label="Seniority Level" rules={[{ required: true }]}>
            <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="minSalary" label="Min Salary" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} formatter={val => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
            <Form.Item name="maxSalary" label="Max Salary" rules={[{ required: true }]} style={{ flex: 1 }}>
              <InputNumber min={0} style={{ width: '100%' }} formatter={val => `$ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
            </Form.Item>
          </div>
          <Form.Item name="isActive" label="Is Active" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
