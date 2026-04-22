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
import { 
    useGetEmployeeQuery, 
    useGetEmployeeHistoryQuery,
    useTransferEmployeeMutation,
    useTerminateEmployeeMutation 
} from "@/store/api/hrApi";

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: emp, isLoading: isEmpLoading } = useGetEmployeeQuery(id);
  const { data: history, isLoading: isHistoryLoading } = useGetEmployeeHistoryQuery(id);

  if (isEmpLoading || isHistoryLoading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Spin size="large" />
          </div>
      );
  }

  if (!emp) return <div>Employee not found</div>;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={`${emp.firstName} ${emp.lastName}`}
        subtitle={emp.employeeId}
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
              onClick={() => router.push(`/hr/employees/${id}/edit`)}
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
              {emp.designation?.title} · {emp.department?.name}
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
          <KpiCard title="Annual Salary" value={formatCurrency(emp.salary || 0)} />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard title="Employment Type" value={emp.employmentType} />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard title="Probation Ends" value={emp.probationEndDate ? formatDate(emp.probationEndDate) : "N/A"} />
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
                    {emp.dateOfBirth ? formatDate(emp.dateOfBirth) : "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Gender">
                    {emp.gender}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {emp.address}
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
                    {emp.department?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Designation">
                    {emp.designation?.title}
                  </Descriptions.Item>
                  <Descriptions.Item label="Join Date">
                    {formatDate(emp.joinDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Employment Type">
                    {emp.employmentType}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <StatusTag status={emp.status} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Employee ID">
                    {emp.employeeId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Contract Expiry">
                    {emp.contractExpiryDate ? formatDate(emp.contractExpiryDate) : "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ),
          },
          {
            key: "timeline",
            label: "History & Timeline",
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
                  items={history?.map((t) => ({
                    color: "#c3f5ff",
                    children: (
                      <div>
                        <div
                          style={{
                            color: "var(--color-on-surface)",
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {t.event}
                        </div>
                        <div
                          style={{
                            color: "var(--color-on-surface)",
                            fontSize: 13,
                          }}
                        >
                          {t.comments}
                        </div>
                        <div
                          style={{
                            color: "var(--color-on-surface-variant)",
                            fontSize: 12,
                          }}
                        >
                          {formatDate(t.effectiveDate)}
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
