"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Card,
  Space,
  Typography,
  Tag,
  Modal,
  Form,
  Input,
  Divider,
} from "antd";
import { EditOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;
const { TextArea } = Input;

// Mock data for demonstration as API endpoints for templates aren't fully specified
const mockTemplates = [
  {
    id: "1",
    name: "Leave Approved",
    type: "Email",
    subject: "Your leave request has been approved",
    content:
      "Hi {{name}},\\n\\nYour leave request from {{startDate}} to {{endDate}} has been approved.\\n\\nRegards,\\nHR Team",
  },
  {
    id: "2",
    name: "Payroll Processed",
    type: "SMS",
    subject: "",
    content:
      "Your salary for {{month}} has been processed and credited to your account.",
  },
  {
    id: "3",
    name: "New Document Uploaded",
    type: "In-App",
    subject: "New Document in {{folder}}",
    content: 'A new document "{{docName}}" has been uploaded by {{author}}.',
  },
];

export default function NotificationTemplatesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [form] = Form.useForm();

  const handleEdit = (record: any) => {
    setEditingTemplate(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    setIsModalOpen(false);
    form.resetFields();
    setEditingTemplate(null);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Channel",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag
          color={
            type === "Email" ? "blue" : type === "SMS" ? "green" : "orange"
          }
        >
          {type}
        </Tag>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button icon={<EyeOutlined />} size="small">
            Preview
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Notification Templates
          </Title>
          <Text type="secondary">
            Manage Handlebars templates for Emails, SMS, and In-App
            notifications.
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            setEditingTemplate(null);
            setIsModalOpen(true);
          }}
        >
          Create Template
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={mockTemplates}
          rowKey="id"
          pagination={false}
        />
      </Card>

      <Modal
        title={editingTemplate ? "Edit Template" : "Create Template"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={700}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="Template Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="e.g. Leave Approved Email" />
          </Form.Item>
          <Form.Item name="type" label="Channel">
            <Input placeholder="Email, SMS, In-App" />
          </Form.Item>
          <Form.Item name="subject" label="Subject (For Email)">
            <Input placeholder="Subject line with {{variables}}" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Template Body (Handlebars)"
            rules={[{ required: true }]}
          >
            <TextArea
              rows={8}
              style={{ fontFamily: "monospace" }}
              placeholder={"Hi {{name}},\n\nYour request has been approved."}
            />
          </Form.Item>
          <Divider />
          <Text type="secondary">
            Use <code>{`{{variableName}}`}</code> to inject dynamic data into
            your templates.
          </Text>
        </Form>
      </Modal>
    </div>
  );
}
