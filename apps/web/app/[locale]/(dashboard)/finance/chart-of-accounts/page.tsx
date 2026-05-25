"use client";

import React, { useState } from "react";
import { Card, Tag, Button, Tree, Space, Typography, Spin, Modal, Form, Input, Select, message } from "antd";
import { PlusOutlined, FolderOutlined, FileTextOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetAccountsTreeQuery, useCreateAccountMutation, useGetAccountsQuery } from "@/store/api/financeApi";

const { Text } = Typography;
const { Option } = Select;

const typeColors: Record<string, string> = {
  ASSET: "blue",
  LIABILITY: "magenta",
  EQUITY: "purple",
  REVENUE: "green",
  EXPENSE: "orange",
};

const formatTreeData = (data: any[]): any[] => {
  return data.map((item) => ({
    key: item.id,
    title: (
      <Space style={{ width: "100%", justifyContent: "space-between" }}>
        <span>
          <Text strong>{item.code}</Text> - {item.name}
        </span>
        <Space>
          <Tag color={typeColors[item.type] || "default"}>{item.type}</Tag>
          <Text type={item.balance >= 0 ? "success" : "danger"}>
            ${Math.abs(item.balance || 0).toLocaleString()}
          </Text>
        </Space>
      </Space>
    ),
    icon: item.parentId === null ? <FolderOutlined /> : <FileTextOutlined />,
    children: item.children ? formatTreeData(item.children) : [],
  }));
};

export default function ChartOfAccountsPage() {
  const { data, isLoading } = useGetAccountsTreeQuery();
  const { data: flatAccounts } = useGetAccountsQuery();
  const [createAccount] = useCreateAccountMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  if (isLoading) return <Spin size="large" />;

  const treeData = data ? formatTreeData(data) : [];

  const handleCreate = async (values: any) => {
    try {
      await createAccount(values).unwrap();
      message.success("Account created successfully");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to create account");
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Chart of Accounts"
        subtitle="General ledger account structure"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Chart of Accounts" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Add Account
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <Tree
          showIcon
          defaultExpandAll
          treeData={treeData}
          style={{ background: "transparent" }}
        />
      </Card>

      <Modal
        title="Add New Account"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="code" label="Account Code" rules={[{ required: true }]}>
            <Input placeholder="e.g. 1000, 2100" />
          </Form.Item>
          <Form.Item name="name" label="Account Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Cash at Bank, Accounts Payable" />
          </Form.Item>
          <Form.Item name="type" label="Account Type" rules={[{ required: true }]}>
            <Select>
              <Option value="ASSET">Asset</Option>
              <Option value="LIABILITY">Liability</Option>
              <Option value="EQUITY">Equity</Option>
              <Option value="REVENUE">Revenue</Option>
              <Option value="EXPENSE">Expense</Option>
            </Select>
          </Form.Item>
          <Form.Item name="parentId" label="Parent Account">
            <Select allowClear showSearch optionFilterProp="children">
              {flatAccounts?.map(acc => (
                <Option key={acc.id} value={acc.id}>
                  {acc.code} - {acc.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
