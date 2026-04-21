"use client";

import { useState } from "react";
import { Tree, Button, Modal, Form, Input, Select, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { 
  useGetAccountsTreeQuery, 
  useCreateAccountMutation,
  useGetAccountsQuery
} from "@/store/api/financeApi";

const { TreeNode } = Tree;

export default function ChartOfAccounts() {
  const { data: treeData, isLoading } = useGetAccountsTreeQuery();
  const { data: flatAccounts } = useGetAccountsQuery();
  const [createAccount] = useCreateAccountMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

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

  const renderTreeNodes = (data: any[]) =>
    data.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <TreeNode 
            title={`${item.code} - ${item.name} (${item.balance} ${item.currency})`} 
            key={item.id}
          >
            {renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return (
        <TreeNode 
          title={`${item.code} - ${item.name} (${item.balance} ${item.currency})`} 
          key={item.id} 
        />
      );
    });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Chart of Accounts</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalOpen(true)}
        >
          Add Account
        </Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Tree showLine defaultExpandAll blockNode>
          {renderTreeNodes(treeData || [])}
        </Tree>
      )}

      <Modal
        title="Add New Account"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item 
            name="code" 
            label="Account Code" 
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="e.g., 1010" />
          </Form.Item>
          <Form.Item 
            name="name" 
            label="Account Name" 
            rules={[{ required: true, message: "Required" }]}
          >
            <Input placeholder="e.g., Main Cash Account" />
          </Form.Item>
          <Form.Item 
            name="type" 
            label="Account Type" 
            rules={[{ required: true, message: "Required" }]}
          >
            <Select options={[
              { label: "Asset", value: "ASSET" },
              { label: "Liability", value: "LIABILITY" },
              { label: "Equity", value: "EQUITY" },
              { label: "Revenue", value: "REVENUE" },
              { label: "Expense", value: "EXPENSE" },
            ]} />
          </Form.Item>
          <Form.Item name="parentId" label="Parent Account">
            <Select 
              allowClear 
              showSearch
              placeholder="Select parent account"
              options={flatAccounts?.map(a => ({ label: `${a.code} - ${a.name}`, value: a.id }))}
            />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
