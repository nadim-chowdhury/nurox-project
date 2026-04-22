"use client";

import React, { useState } from "react";
import { Card, Table, Tag, Rate, Spin, Typography, Button, Modal, Form, Select, message, Input } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetSkillMatrixQuery, useAddSkillMutation, useGetEmployeesQuery } from "@/store/api/hrApi";

const { Text } = Typography;

export default function SkillMatrixPage() {
  const { data: matrix, isLoading, refetch } = useGetSkillMatrixQuery();
  const { data: employees } = useGetEmployeesQuery({});
  const [addSkill, { isLoading: isAdding }] = useAddSkillMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = async (values: any) => {
    try {
      await addSkill({ id: values.employeeId, data: values }).unwrap();
      message.success("Skill assessment added successfully");
      setIsModalOpen(false);
      form.resetFields();
      refetch();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to add skill");
    }
  };

  if (isLoading) return <Spin size="large" />;

  const columns = [
    {
      title: "Skill",
      dataIndex: "skillName",
      key: "skillName",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Employees & Proficiency",
      dataIndex: "employees",
      key: "employees",
      render: (employees: any[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {employees.map((e, i) => (
            <Card key={i} size="small" style={{ width: 220, background: 'var(--color-surface-variant)', border: 'none' }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{e.employeeName}</div>
              <Rate disabled defaultValue={e.proficiency} style={{ fontSize: 12 }} />
            </Card>
          ))}
        </div>
      ),
    },
  ];

  const dataSource = matrix ? Object.keys(matrix).map(skillName => ({
    key: skillName,
    skillName,
    employees: matrix[skillName],
  })) : [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Skill Matrix"
        subtitle="Organization-wide capability and proficiency mapping"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Skills" },
        ]}
        extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                Add Assessment
            </Button>
        }
      />

      <Card className="shadow-sm">
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </Card>

      <Modal
        title="Add Skill Assessment"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isAdding}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="employeeId" label="Employee" rules={[{ required: true }]}>
            <Select 
                showSearch
                placeholder="Select employee"
                options={employees?.data.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="skillName" label="Skill Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. React, Project Management, Negotiation" />
          </Form.Item>
          <Form.Item name="proficiency" label="Proficiency Level" rules={[{ required: true }]}>
            <Rate />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
