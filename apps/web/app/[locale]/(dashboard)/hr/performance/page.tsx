"use client";

import React, { useState } from "react";
import { 
    Card, 
    Tag, 
    Button, 
    Space, 
    Progress, 
    Tabs, 
    Table, 
    Modal, 
    Form, 
    Input, 
    Select, 
    Rate, 
    InputNumber, 
    message,
    Typography
} from "antd";
import { PlusOutlined, UserOutlined, FileTextOutlined, WarningOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { 
    useGetEmployeesQuery, 
    useAddOKRMutation,
    useTransferEmployeeMutation // This is not needed here but maybe other hooks
} from "@/store/api/hrApi";

const { Text } = Typography;

export default function PerformancePage() {
  const { data: employees } = useGetEmployeesQuery({});
  const [addOKR] = useAddOKRMutation();
  
  const [isOkrModalOpen, setIsOkrModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleOkrFinish = async (values: any) => {
      try {
          await addOKR({ id: values.employeeId, data: values }).unwrap();
          message.success("OKR added successfully");
          setIsOkrModalOpen(false);
          form.resetFields();
      } catch (err: any) {
          message.error(err.data?.message || "Failed to add OKR");
      }
  };

  const okrColumns = [
    {
      title: "Employee",
      dataIndex: "employee",
      key: "employee",
      render: (emp: any) => `${emp?.firstName} ${emp?.lastName}`,
    },
    {
      title: "Objective",
      dataIndex: "objective",
      key: "objective",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Period",
      dataIndex: "period",
      key: "period",
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (p: number) => <Progress percent={p} size="small" />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={s === "COMPLETED" ? "green" : "blue"}>{s}</Tag>,
    },
  ];

  const items = [
    {
      key: "okrs",
      label: "OKRs & Goals",
      children: (
        <Card className="shadow-sm">
          <Table columns={okrColumns} dataSource={[]} rowKey="id" />
        </Card>
      ),
    },
    {
      key: "360",
      label: "360° Reviews",
      children: (
        <Card className="shadow-sm">
           <div style={{ textAlign: 'center', padding: '40px 0' }}>
               <UserOutlined style={{ fontSize: 48, color: 'var(--color-on-surface-variant)', marginBottom: 16 }} />
               <Title level={4}>360° Feedback Cycles</Title>
               <Text type="secondary">Implement multi-rater feedback for comprehensive employee evaluation.</Text>
               <div style={{ marginTop: 24 }}>
                   <Button type="primary">Start Feedback Cycle</Button>
               </div>
           </div>
        </Card>
      ),
    },
    {
      key: "pip",
      label: "PIP (Performance Improvement)",
      children: (
        <Card className="shadow-sm">
           <div style={{ padding: 24 }}>
               <Space direction="vertical" style={{ width: '100%' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                       <WarningOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                       <Title level={4} style={{ margin: 0 }}>Active PIPs</Title>
                   </div>
                   <Table columns={[]} dataSource={[]} />
                   <Button type="primary" danger ghost icon={<PlusOutlined />}>Initiate PIP</Button>
               </Space>
           </div>
        </Card>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Performance Management"
        subtitle="Manage OKRs, 360° reviews, and performance improvements"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Performance" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsOkrModalOpen(true)}>
            New OKR
          </Button>
        }
      />

      <Tabs items={items} />

      <Modal
        title="Create New OKR"
        open={isOkrModalOpen}
        onCancel={() => setIsOkrModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleOkrFinish}>
          <Form.Item name="employeeId" label="Employee" rules={[{ required: true }]}>
            <Select 
                showSearch
                placeholder="Select employee"
                options={employees?.data.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="objective" label="Objective" rules={[{ required: true }]}>
            <Input placeholder="e.g. Scale engineering team output by 20%" />
          </Form.Item>
          <Form.Item name="period" label="Period" rules={[{ required: true }]}>
            <Select options={[
                { value: "Q1 2026", label: "Q1 2026" },
                { value: "Q2 2026", label: "Q2 2026" },
                { value: "Q3 2026", label: "Q3 2026" },
                { value: "Q4 2026", label: "Q4 2026" },
            ]} />
          </Form.Item>
          {/* Key Results would go here in a dynamic form list */}
        </Form>
      </Modal>
    </div>
  );
}

const Title = Typography.Title;
