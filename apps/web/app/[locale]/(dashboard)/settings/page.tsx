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
  MonitorOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar } from "@/components/common/Avatar";
import { useAppSelector } from "@/hooks/useRedux";
import {
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useGetRolesQuery,
} from "@/store/api/authApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

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

function SessionsTab() {
  const { data: sessions, isLoading, refetch } = useGetSessionsQuery();
  const [revoke] = useRevokeSessionMutation();

  const handleRevoke = async (id: string) => {
    try {
      await revoke(id).unwrap();
      message.success("Session revoked");
      refetch();
    } catch {
      message.error("Failed to revoke session");
    }
  };

  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          marginBottom: 24,
        }}
      >
        Active Sessions
      </h3>
      <p
        style={{
          color: "var(--color-on-surface-variant)",
          fontSize: 13,
          marginBottom: 24,
        }}
      >
        These are the devices that are currently logged into your account. You
        can revoke any session to log out from that device.
      </p>

      {isLoading ? (
        <div style={{ padding: 24, textAlign: "center" }}>Loading...</div>
      ) : (
        sessions?.map((session) => (
          <div
            key={session.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 0",
              borderBottom: "1px solid var(--ghost-border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  background: "var(--ghost-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  color: "var(--color-primary)",
                }}
              >
                <MonitorOutlined />
              </div>
              <div>
                <div
                  style={{
                    color: "var(--color-on-surface)",
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  {session.userAgent || "Unknown Device"}{" "}
                  {session.isCurrent && (
                    <span
                      style={{
                        background: "var(--color-primary)",
                        color: "white",
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 10,
                        marginLeft: 8,
                      }}
                    >
                      Current
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 12,
                  }}
                >
                  {session.ipAddress} • Last active{" "}
                  {dayjs(session.lastActiveAt).fromNow()}
                </div>
              </div>
            </div>
            {!session.isCurrent && (
              <Button
                type="text"
                danger
                size="small"
                onClick={() => handleRevoke(session.id)}
              >
                Revoke
              </Button>
            )}
          </div>
        ))
      )}
    </Card>
  );
}

function RolesTab() {
  const { data: roles, isLoading } = useGetRolesQuery();

  return (
    <Card style={cardStyle} styles={{ body: { padding: 32 } }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-on-surface)",
            margin: 0,
          }}
        >
          Roles & Permissions
        </h3>
        <Button type="primary" size="small">
          Create Role
        </Button>
      </div>

      {isLoading ? (
        <div style={{ padding: 24, textAlign: "center" }}>Loading...</div>
      ) : (
        roles?.map((role) => (
          <div
            key={role.id}
            style={{
              padding: "16px 0",
              borderBottom: "1px solid var(--ghost-border)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div
                style={{ fontWeight: 500, color: "var(--color-on-surface)" }}
              >
                {role.name}
              </div>
              {role.isSystem && (
                <span
                  style={{
                    fontSize: 11,
                    color: "var(--color-on-surface-variant)",
                  }}
                >
                  System Role
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--color-on-surface-variant)",
                marginTop: 4,
              }}
            >
              {role.description || "No description"}
            </div>
            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
              }}
            >
              {role.permissions.map((p) => (
                <span
                  key={p}
                  style={{
                    fontSize: 10,
                    background: "var(--ghost-bg)",
                    color: "var(--color-on-surface-variant)",
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
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
            key: "sessions",
            label: (
              <span>
                <MonitorOutlined /> Sessions
              </span>
            ),
            children: <SessionsTab />,
          },
          {
            key: "roles",
            label: (
              <span>
                <TeamOutlined /> Roles
              </span>
            ),
            children: <RolesTab />,
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
