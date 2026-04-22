"use client";

import React, { useState } from "react";
import { 
    Card, 
    Table, 
    Tag, 
    Button, 
    Space, 
    Modal, 
    Form, 
    Input, 
    Select, 
    DatePicker, 
    InputNumber,
    message,
    Typography
} from "antd";
import { PlusOutlined, BookOutlined, FilePdfOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetTrainingsQuery, useAddTrainingMutation, useGetEmployeesQuery } from "@/store/api/hrApi";
import { formatDate } from "@/lib/utils";

const { Title, Text } = Typography;

export default function TrainingCatalogPage() {
  const { data: trainings, isLoading } = useGetTrainingsQuery();
  const { data: employees } = useGetEmployeesQuery({});
  const [addTraining, { isLoading: isAdding }] = useAddTrainingMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleFinish = async (values: any) => {
    try {
      await addTraining({ id: values.employeeId, data: values }).unwrap();
      message.success("Training record added successfully");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to add training");
    }
  };

  const columns = [
    {
      title: "Training Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Employee",
      dataIndex: "employee",
      key: "employee",
      render: (emp: any) => `${emp.firstName} ${emp.lastName}`,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat: string) => <Tag color="blue">{cat || "General"}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "COMPLETED" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Completion",
      dataIndex: "completionDate",
      key: "completionDate",
      render: (date: string) => date ? formatDate(date) : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          {record.status === "COMPLETED" && (
            <Button 
                size="small" 
                icon={<FilePdfOutlined />}
                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/hr/trainings/${record.id}/certificate`, "_blank")}
            >
                Certificate
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Training Catalog"
        subtitle="Employee professional development and certifications"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Training" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Record Training
          </Button>
        }
      />

      <Card className="shadow-sm">
        <Table
          dataSource={trainings}
          columns={columns}
          loading={isLoading}
          rowKey="id"
        />
      </Card>

      <Modal
        title="Add Training Record"
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
          <Form.Item name="title" label="Training Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Advanced Project Management" />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Select options={[
                { value: "Technical", label: "Technical" },
                { value: "Soft Skills", label: "Soft Skills" },
                { value: "Compliance", label: "Compliance" },
                { value: "Leadership", label: "Leadership" },
            ]} />
          </Form.Item>
          <Form.Item name="provider" label="Provider">
            <Input placeholder="e.g. Coursera, Internal" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
              <Form.Item name="status" label="Status" initialValue="ENROLLED">
                  <Select options={[
                      { value: "ENROLLED", label: "Enrolled" },
                      { value: "IN_PROGRESS", label: "In Progress" },
                      { value: "COMPLETED", label: "Completed" },
                  ]} />
              </Form.Item>
              <Form.Item name="durationHours" label="Duration (Hours)">
                  <InputNumber style={{ width: '100%' }} />
              </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
