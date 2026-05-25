"use client";

import { useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Tag, message, Space } from "antd";
import { PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetExpenseClaimsQuery, useCreateExpenseClaimMutation, useApproveExpenseClaimMutation } from "@/store/api/financeApi";
import dayjs from "dayjs";

const { Option } = Select;

export default function ExpenseClaims() {
  const { data: claims, isLoading } = useGetExpenseClaimsQuery();
  const [createClaim] = useCreateExpenseClaimMutation();
  const [approveClaim] = useApproveExpenseClaimMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createClaim({
        ...values,
        date: values.date.toISOString(),
      }).unwrap();
      message.success("Expense claim submitted");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to submit claim");
    }
  };

  const handleApprove = async (id: string) => {
      try {
          await approveClaim({ id, approverId: "current-user-id" }).unwrap();
          message.success("Expense claim approved");
      } catch (err: any) {
          message.error(err.data?.message || "Failed to approve claim");
      }
  };

  const columns = [
    { title: "Date", dataIndex: "date", render: (d: string) => dayjs(d).format("YYYY-MM-DD") },
    { title: "Description", dataIndex: "description" },
    { title: "Category", dataIndex: "category" },
    { title: "Amount", dataIndex: "amount", render: (val: number) => `$${val.toFixed(2)}` },
    { 
      title: "Status", 
      dataIndex: "status",
      render: (s: string) => {
          let color = "orange";
          if (s === "APPROVED") color = "green";
          if (s === "REJECTED") color = "red";
          if (s === "PAID") color = "blue";
          return <Tag color={color}>{s}</Tag>;
      }
    },
    {
        title: "Actions",
        key: "actions",
        render: (_: any, record: any) => (
            record.status === "PENDING" && (
                <Space>
                    <Button size="small" icon={<CheckCircleOutlined />} type="primary" onClick={() => handleApprove(record.id)}>Approve</Button>
                    <Button size="small" icon={<CloseCircleOutlined />} danger>Reject</Button>
                </Space>
            )
        )
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Expense Claims"
        subtitle="Employee expense reimbursement management"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Expense Claims" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Submit Expense
          </Button>
        }
      />

      <Table dataSource={claims} columns={columns} rowKey="id" loading={isLoading} />

      <Modal
        title="Submit New Expense Claim"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="date" label="Expense Date" rules={[{ required: true }]} initialValue={dayjs()}>
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input placeholder="e.g., Client dinner, Taxi to airport" />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select>
                <Option value="Travel">Travel</Option>
                <Option value="Meals">Meals</Option>
                <Option value="Supplies">Supplies</Option>
                <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={0.01} precision={2} prefix="$" />
          </Form.Item>
          <Form.Item name="receiptUrl" label="Receipt Image URL">
              <Input placeholder="https://..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
