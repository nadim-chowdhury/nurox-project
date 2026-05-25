"use client";

import React from "react";
import {
  Card,
  Tabs,
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  message,
  Space,
  Divider,
} from "antd";
import {
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

export function SystemAdminSettings() {
  const [form] = Form.useForm();

  const handleSave = () => {
    message.success("Settings updated successfully");
  };

  const securityTab = (
    <Form
      layout="vertical"
      form={form}
      initialValues={{ sessionTimeoutMinutes: 60, maxConcurrentSessions: 3 }}
    >
      <div className="max-w-2xl">
        <h3 className="font-semibold mb-4 text-lg">Access Policies</h3>
        <Form.Item name="mfaEnforced" valuePropName="checked">
          <Switch checkedChildren="Enforced" unCheckedChildren="Optional" />
          <span className="ml-3">
            Enforce Two-Factor Authentication (2FA) for all users
          </span>
        </Form.Item>

        <Space size="large">
          <Form.Item
            name="sessionTimeoutMinutes"
            label="Session Timeout (Minutes)"
          >
            <InputNumber min={5} max={1440} />
          </Form.Item>
          <Form.Item
            name="maxConcurrentSessions"
            label="Max Concurrent Sessions"
          >
            <InputNumber min={1} max={10} />
          </Form.Item>
        </Space>

        <Divider />

        <h3 className="font-semibold mb-4 text-lg">Password Policy</h3>
        <Space size="large" wrap>
          <Form.Item
            name={["passwordPolicy", "minLength"]}
            label="Minimum Length"
          >
            <InputNumber min={8} defaultValue={8} />
          </Form.Item>
          <Form.Item
            name={["passwordPolicy", "expiryDays"]}
            label="Expiry (Days)"
          >
            <InputNumber min={0} defaultValue={90} />
          </Form.Item>
        </Space>

        <div className="flex flex-col gap-2">
          <Switch defaultChecked /> Require Uppercase Letters
          <Switch defaultChecked /> Require Numbers
          <Switch defaultChecked /> Require Symbols
        </div>

        <Button
          type="primary"
          onClick={handleSave}
          className="mt-6"
          icon={<SafetyCertificateOutlined />}
        >
          Save Security Policies
        </Button>
      </div>
    </Form>
  );

  const smtpTab = (
    <div className="max-w-xl">
      <p className="text-gray-500 mb-6">
        Override the default system email sender with your own SMTP credentials.
      </p>
      <Form layout="vertical">
        <Form.Item label="SMTP Host">
          <Input placeholder="smtp.gmail.com" />
        </Form.Item>
        <Space size="large">
          <Form.Item label="Port">
            <InputNumber placeholder="587" />
          </Form.Item>
          <Form.Item label="Use TLS/SSL" valuePropName="checked">
            <Switch defaultChecked />
          </Form.Item>
        </Space>
        <Form.Item label="Username">
          <Input />
        </Form.Item>
        <Form.Item label="Password">
          <Input.Password />
        </Form.Item>
        <Form.Item label="From Email Address">
          <Input placeholder="noreply@yourdomain.com" />
        </Form.Item>
        <Space>
          <Button type="primary" onClick={handleSave}>
            Save SMTP Settings
          </Button>
          <Button onClick={() => message.info("Testing connection...")}>
            Test Connection
          </Button>
        </Space>
      </Form>
    </div>
  );

  return (
    <Card className="shadow-sm rounded-lg border-gray-100">
      <Tabs
        items={[
          {
            key: "security",
            label: (
              <span>
                <LockOutlined /> Security
              </span>
            ),
            children: securityTab,
          },
          {
            key: "smtp",
            label: (
              <span>
                <MailOutlined /> SMTP Overrides
              </span>
            ),
            children: smtpTab,
          },
          {
            key: "modules",
            label: "Feature Modules",
            children: <p>Module toggles here...</p>,
          },
          {
            key: "autonumber",
            label: "Auto-Number Sequences",
            children: <p>Sequence settings here...</p>,
          },
        ]}
      />
    </Card>
  );
}
