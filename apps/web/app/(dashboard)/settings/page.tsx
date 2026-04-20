"use client";

import React from "react";
import {
  Tabs,
  Form,
  Input,
  Select,
  Button,
  Card,
  Row,
  Col,
  Upload,
  Divider,
  Switch,
  message,
} from "antd";
import {
  SaveOutlined,
  UploadOutlined,
  UserOutlined,
  BellOutlined,
  LockOutlined,
  GlobalOutlined,
  TeamOutlined,
  ApiOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar } from "@/components/common/Avatar";
import { useAppSelector } from "@/hooks/useRedux";

const labelStyle = { color: "var(--color-on-surface-variant)", fontSize: 13 };
const cardStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--ghost-border)",
  borderRadius: 4,
};

function ProfileTab() {
  const user = useAppSelector((s) => s.auth.user);
  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <Avatar
          name={`${user?.firstName || "N"} ${user?.lastName || "U"}`}
          size={72}
        />
        <div>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-on-surface)",
              margin: 0,
            }}
          >
            {user?.firstName} {user?.lastName}
          </h3>
          <p
            style={{
              color: "var(--color-on-surface-variant)",
              fontSize: 13,
              margin: "4px 0 12px",
            }}
          >
            {user?.email}
          </p>
          <Upload showUploadList={false}>
            <Button icon={<UploadOutlined />} size="small">
              Change Photo
            </Button>
          </Upload>
        </div>
      </div>
      <Form
        layout="vertical"
        requiredMark={false}
        size="large"
        initialValues={{
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
        }}
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="firstName"
              label={<span style={labelStyle}>First Name</span>}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="lastName"
              label={<span style={labelStyle}>Last Name</span>}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="email"
              label={<span style={labelStyle}>Email</span>}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="phone"
              label={<span style={labelStyle}>Phone</span>}
            >
              <Input placeholder="+1 (555) 000-0000" />
            </Form.Item>
          </Col>
        </Row>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Profile updated")}
        >
          Save Changes
        </Button>
      </Form>
    </Card>
  );
}

function CompanyTab() {
  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <Form
        layout="vertical"
        requiredMark={false}
        size="large"
        initialValues={{
          company: "Nurox Technologies",
          industry: "Technology",
          website: "https://nurox.com",
          timezone: "America/New_York",
          currency: "USD",
        }}
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="company"
              label={<span style={labelStyle}>Company Name</span>}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="industry"
              label={<span style={labelStyle}>Industry</span>}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="website"
              label={<span style={labelStyle}>Website</span>}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="timezone"
              label={<span style={labelStyle}>Timezone</span>}
            >
              <Select
                options={[
                  { value: "America/New_York", label: "Eastern (ET)" },
                  { value: "America/Chicago", label: "Central (CT)" },
                  { value: "America/Los_Angeles", label: "Pacific (PT)" },
                  { value: "Europe/London", label: "GMT" },
                  { value: "Asia/Dhaka", label: "BST (Dhaka)" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="currency"
              label={<span style={labelStyle}>Default Currency</span>}
            >
              <Select
                options={[
                  { value: "USD", label: "USD ($)" },
                  { value: "EUR", label: "EUR (€)" },
                  { value: "GBP", label: "GBP (£)" },
                  { value: "BDT", label: "BDT (৳)" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="fiscalYear"
              label={<span style={labelStyle}>Fiscal Year Start</span>}
            >
              <Select
                options={[
                  { value: "jan", label: "January" },
                  { value: "apr", label: "April" },
                  { value: "jul", label: "July" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => message.success("Company settings saved")}
        >
          Save
        </Button>
      </Form>
    </Card>
  );
}

function SecurityTab() {
  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          marginBottom: 24,
        }}
      >
        Change Password
      </h3>
      <Form
        layout="vertical"
        requiredMark={false}
        size="large"
        style={{ maxWidth: 400 }}
      >
        <Form.Item
          name="current"
          label={<span style={labelStyle}>Current Password</span>}
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label={<span style={labelStyle}>New Password</span>}
          rules={[{ required: true, min: 8 }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="confirm"
          label={<span style={labelStyle}>Confirm Password</span>}
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Button
          type="primary"
          icon={<LockOutlined />}
          onClick={() => message.success("Password changed")}
        >
          Update Password
        </Button>
      </Form>
      <Divider />
      <h3
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          marginBottom: 16,
        }}
      >
        Two-Factor Authentication
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Switch />
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          Enable 2FA for login
        </span>
      </div>
    </Card>
  );
}

function NotificationsTab() {
  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          marginBottom: 24,
        }}
      >
        Notification Preferences
      </h3>
      {[
        {
          label: "Email notifications for leave approvals",
          defaultChecked: true,
        },
        { label: "Push notifications for new tasks", defaultChecked: true },
        { label: "Weekly summary reports", defaultChecked: false },
        { label: "Invoice payment reminders", defaultChecked: true },
        { label: "Inventory low stock alerts", defaultChecked: true },
        { label: "Payroll run completion", defaultChecked: true },
        { label: "New employee onboarding", defaultChecked: false },
      ].map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 0",
            borderBottom: "1px solid var(--ghost-border)",
          }}
        >
          <span style={{ color: "var(--color-on-surface)", fontSize: 13 }}>
            {item.label}
          </span>
          <Switch defaultChecked={item.defaultChecked} />
        </div>
      ))}
      <Button
        type="primary"
        icon={<SaveOutlined />}
        style={{ marginTop: 24 }}
        onClick={() => message.success("Preferences saved")}
      >
        Save Preferences
      </Button>
    </Card>
  );
}

function IntegrationsTab() {
  const integrations = [
    {
      name: "Slack",
      description: "Get notifications in Slack channels",
      connected: true,
    },
    {
      name: "Google Calendar",
      description: "Sync leave & attendance with calendar",
      connected: true,
    },
    {
      name: "QuickBooks",
      description: "Export financial data to QuickBooks",
      connected: false,
    },
    {
      name: "Stripe",
      description: "Process invoice payments online",
      connected: false,
    },
    {
      name: "Jira",
      description: "Sync project tasks with Jira",
      connected: false,
    },
  ];
  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          marginBottom: 24,
        }}
      >
        Connected Services
      </h3>
      {integrations.map((item) => (
        <div
          key={item.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 0",
            borderBottom: "1px solid var(--ghost-border)",
          }}
        >
          <div>
            <div
              style={{
                color: "var(--color-on-surface)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {item.name}
            </div>
            <div
              style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}
            >
              {item.description}
            </div>
          </div>
          <Button
            type={item.connected ? "default" : "primary"}
            size="small"
            danger={item.connected}
          >
            {item.connected ? "Disconnect" : "Connect"}
          </Button>
        </div>
      ))}
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and system preferences"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Settings" },
        ]}
      />
      <Tabs
        tabPosition="left"
        style={{ minHeight: 500 }}
        items={[
          {
            key: "profile",
            label: (
              <span>
                <UserOutlined /> Profile
              </span>
            ),
            children: <ProfileTab />,
          },
          {
            key: "company",
            label: (
              <span>
                <GlobalOutlined /> Company
              </span>
            ),
            children: <CompanyTab />,
          },
          {
            key: "security",
            label: (
              <span>
                <LockOutlined /> Security
              </span>
            ),
            children: <SecurityTab />,
          },
          {
            key: "notifications",
            label: (
              <span>
                <BellOutlined /> Notifications
              </span>
            ),
            children: <NotificationsTab />,
          },
          {
            key: "integrations",
            label: (
              <span>
                <ApiOutlined /> Integrations
              </span>
            ),
            children: <IntegrationsTab />,
          },
        ]}
      />
    </div>
  );
}
