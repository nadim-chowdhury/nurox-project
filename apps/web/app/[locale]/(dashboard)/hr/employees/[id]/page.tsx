"use client";

import React from "react";
import {
  Card,
  Descriptions,
  Tag,
  Tabs,
  Timeline,
  Spin,
  Button,
  Space,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  BankOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar } from "@/components/common/Avatar";
import { StatusTag } from "@/components/common/StatusTag";
import { KpiCard } from "@/components/common/KpiCard";
import { formatDate, formatCurrency } from "@/lib/utils";

// Mock data — will be replaced by useGetEmployeeQuery(id)
const mockEmployee = {
  id: "1",
  firstName: "Sarah",
  lastName: "Ahmed",
  email: "sarah.ahmed@nurox.com",
  phone: "+1 (555) 234-5678",
  department: "Engineering",
  designation: "Sr. Frontend Developer",
  status: "ACTIVE" as const,
  joinDate: "2023-03-15",
  dateOfBirth: "1995-08-20",
  gender: "Female",
  address: "742 Evergreen Terrace",
  city: "San Francisco, CA",
  country: "United States",
  salary: 125000,
  managerId: "3",
  emergencyContact: "Kamal Ahmed",
  emergencyPhone: "+1 (555) 987-6543",
  createdAt: "2023-03-15T00:00:00Z",
  updatedAt: "2024-11-10T00:00:00Z",
};

const mockTimeline = [
  { date: "2024-11-10", event: "Promoted to Sr. Frontend Developer" },
  {
    date: "2024-06-15",
    event: "Annual performance review — Rating: Excellent",
  },
  { date: "2024-01-10", event: "Completed React Advanced certification" },
  { date: "2023-09-15", event: "Completed probation period" },
  { date: "2023-03-15", event: "Joined as Frontend Developer" },
];

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const emp = mockEmployee; // Will be: useGetEmployeeQuery(params.id)

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title=""
        subtitle=""
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Employees", href: "/hr/employees" },
          { label: `${emp.firstName} ${emp.lastName}` },
        ]}
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/hr/employees")}
            >
              Back
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/hr/employees/${params.id}/edit`)}
            >
              Edit
            </Button>
          </Space>
        }
      />

      {/* Profile Header */}
      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          marginBottom: 24,
        }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Avatar name={`${emp.firstName} ${emp.lastName}`} size={72} />
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 4,
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-on-surface)",
                  fontSize: 24,
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {emp.firstName} {emp.lastName}
              </h2>
              <StatusTag status={emp.status} />
            </div>
            <p
              style={{
                color: "var(--color-on-surface-variant)",
                fontSize: 14,
                margin: 0,
              }}
            >
              {emp.designation} · {emp.department}
            </p>
            <div style={{ display: "flex", gap: 24, marginTop: 12 }}>
              <span
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <MailOutlined /> {emp.email}
              </span>
              <span
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <PhoneOutlined /> {emp.phone}
              </span>
              <span
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 13,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <CalendarOutlined /> Joined {formatDate(emp.joinDate)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <KpiCard title="Annual Salary" value={formatCurrency(emp.salary)} />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard title="Tenure" value="1y 8m" />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard title="Leave Balance" value="12 days" />
        </Col>
      </Row>

      {/* Tabs */}
      <Tabs
        items={[
          {
            key: "details",
            label: "Personal Details",
            children: (
              <Card
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--ghost-border)",
                  borderRadius: 4,
                }}
                styles={{ body: { padding: 24 } }}
              >
                <Descriptions
                  column={{ xs: 1, sm: 2 }}
                  labelStyle={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 13,
                  }}
                  contentStyle={{
                    color: "var(--color-on-surface)",
                    fontSize: 13,
                  }}
                >
                  <Descriptions.Item label="Full Name">
                    {emp.firstName} {emp.lastName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {emp.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {emp.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Date of Birth">
                    {formatDate(emp.dateOfBirth)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    {emp.gender}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {emp.address}
                  </Descriptions.Item>
                  <Descriptions.Item label="City">{emp.city}</Descriptions.Item>
                  <Descriptions.Item label="Country">
                    {emp.country}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
          {
            key: "employment",
            label: "Employment",
            children: (
              <Card
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--ghost-border)",
                  borderRadius: 4,
                }}
                styles={{ body: { padding: 24 } }}
              >
                <Descriptions
                  column={{ xs: 1, sm: 2 }}
                  labelStyle={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 13,
                  }}
                  contentStyle={{
                    color: "var(--color-on-surface)",
                    fontSize: 13,
                  }}
                >
                  <Descriptions.Item label="Department">
                    {emp.department}
                  </Descriptions.Item>
                  <Descriptions.Item label="Designation">
                    {emp.designation}
                  </Descriptions.Item>
                  <Descriptions.Item label="Join Date">
                    {formatDate(emp.joinDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Salary">
                    {formatCurrency(emp.salary)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <StatusTag status={emp.status} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Employee ID">
                    {emp.id}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
          {
            key: "emergency",
            label: "Emergency Contact",
            children: (
              <Card
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--ghost-border)",
                  borderRadius: 4,
                }}
                styles={{ body: { padding: 24 } }}
              >
                <Descriptions
                  column={{ xs: 1, sm: 2 }}
                  labelStyle={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 13,
                  }}
                  contentStyle={{
                    color: "var(--color-on-surface)",
                    fontSize: 13,
                  }}
                >
                  <Descriptions.Item label="Contact Name">
                    {emp.emergencyContact}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {emp.emergencyPhone}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
          {
            key: "timeline",
            label: "Activity",
            children: (
              <Card
                style={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--ghost-border)",
                  borderRadius: 4,
                }}
                styles={{ body: { padding: 24 } }}
              >
                <Timeline
                  items={mockTimeline.map((t) => ({
                    color: "#c3f5ff",
                    children: (
                      <div>
                        <div
                          style={{
                            color: "var(--color-on-surface)",
                            fontSize: 13,
                          }}
                        >
                          {t.event}
                        </div>
                        <div
                          style={{
                            color: "var(--color-on-surface-variant)",
                            fontSize: 12,
                          }}
                        >
                          {formatDate(t.date)}
                        </div>
                      </div>
                    ),
                  }))}
                />
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
