"use client";

import React from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const mockFields = [
  {
    id: "1",
    entity: "Employee",
    name: "Blood Group",
    key: "bloodGroup",
    type: "DROPDOWN",
    required: false,
  },
  {
    id: "2",
    entity: "Invoice",
    name: "PO Reference",
    key: "poRef",
    type: "VARCHAR",
    required: false,
  },
];

export function CustomFieldsBuilder() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const columns = [
    { title: "Entity", dataIndex: "entity", key: "entity" },
    { title: "Field Name", dataIndex: "name", key: "name" },
    { title: "Field Key", dataIndex: "key", key: "key" },
    { title: "Type", dataIndex: "type", key: "type" },
    {
      title: "Required",
      dataIndex: "required",
      key: "required",
      render: (req: boolean) => (req ? "Yes" : "No"),
    },
    {
      title: "Action",
      key: "action",
      render: () => (
        <Space size="middle">
          <Button type="text" icon={<EditOutlined />} />
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Space>
      ),
    },
  ];

  const handleSave = () => {
    message.success("Custom field created!");
    setIsModalOpen(false);
  };

  return (
    <Card className="shadow-sm rounded-lg border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold m-0">Custom Fields</h2>
          <p className="text-gray-500 m-0 text-sm">
            Add dynamic fields to standard system entities
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Custom Field
        </Button>
      </div>

      <Table
        dataSource={mockFields}
        columns={columns}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title="Create Custom Field"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSave}
      >
        <Form layout="vertical">
          <Form.Item label="Target Entity">
            <Select
              options={[
                { value: "Employee", label: "Employee" },
                { value: "Invoice", label: "Invoice" },
                { value: "PurchaseOrder", label: "Purchase Order" },
              ]}
            />
          </Form.Item>

          <div className="flex gap-4">
            <Form.Item label="Field Name" className="flex-1">
              <Input placeholder="e.g. T-Shirt Size" />
            </Form.Item>
            <Form.Item label="Field Key" className="flex-1">
              <Input placeholder="e.g. tShirtSize" />
            </Form.Item>
          </div>

          <Form.Item label="Field Type">
            <Select
              options={[
                { value: "VARCHAR", label: "Short Text" },
                { value: "NUMBER", label: "Number" },
                { value: "BOOLEAN", label: "Yes/No (Checkbox)" },
                { value: "DATE", label: "Date" },
                { value: "DROPDOWN", label: "Dropdown List" },
              ]}
            />
          </Form.Item>

          <Form.Item label="Is Required?" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
