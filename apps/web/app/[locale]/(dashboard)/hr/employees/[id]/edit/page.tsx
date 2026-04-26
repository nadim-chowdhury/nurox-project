"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  message,
} from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Mock initial values — will be replaced by useGetEmployeeQuery(params.id)
  const initialValues = {
    firstName: "Sarah",
    lastName: "Ahmed",
    email: "sarah.ahmed@nurox.com",
    phone: "+1 (555) 234-5678",
    department: "Engineering",
    designation: "Sr. Frontend Developer",
    status: "ACTIVE",
    gender: "Female",
    address: "742 Evergreen Terrace",
    city: "San Francisco, CA",
    country: "United States",
    salary: 125000,
    emergencyContact: "Kamal Ahmed",
    emergencyPhone: "+1 (555) 987-6543",
  };

  const handleSubmit = async (_values: Record<string, unknown>) => {
    setLoading(true);
    // Will be: await updateEmployee({ id: params.id, data: values }).unwrap()
    setTimeout(() => {
      message.success("Employee updated successfully");
      setLoading(false);
      router.push(`/hr/employees/${params.id}`);
    }, 1000);
  };

  const labelStyle = { color: "var(--color-on-surface-variant)", fontSize: 13 };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Edit Employee"
        subtitle="Update employee information"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Employees", href: "/hr/employees" },
          { label: "Edit" },
        ]}
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push(`/hr/employees/${params.id}`)}
          >
            Back to Profile
          </Button>
        }
      />

      <Form
        layout="vertical"
        initialValues={initialValues}
        onFinish={handleSubmit}
        requiredMark={false}
        size="large"
      >
        {/* Personal Information */}
        <Card
          title={
            <span
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-on-surface)",
                fontWeight: 600,
              }}
            >
              Personal Information
            </span>
          }
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--ghost-border)",
            borderRadius: 4,
            marginBottom: 24,
          }}
          styles={{ body: { padding: 24 } }}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label={<span style={labelStyle}>First Name</span>}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label={<span style={labelStyle}>Last Name</span>}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label={<span style={labelStyle}>Email</span>}
                rules={[{ required: true, type: "email" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone"
                label={<span style={labelStyle}>Phone</span>}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="gender"
                label={<span style={labelStyle}>Gender</span>}
              >
                <Select
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="address"
                label={<span style={labelStyle}>Address</span>}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="city"
                label={<span style={labelStyle}>City</span>}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="country"
                label={<span style={labelStyle}>Country</span>}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Employment */}
        <Card
          title={
            <span
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-on-surface)",
                fontWeight: 600,
              }}
            >
              Employment Details
            </span>
          }
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--ghost-border)",
            borderRadius: 4,
            marginBottom: 24,
          }}
          styles={{ body: { padding: 24 } }}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="department"
                label={<span style={labelStyle}>Department</span>}
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: "Engineering", label: "Engineering" },
                    { value: "Human Resources", label: "Human Resources" },
                    { value: "Finance", label: "Finance" },
                    { value: "Sales & Marketing", label: "Sales & Marketing" },
                    { value: "Operations", label: "Operations" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="designation"
                label={<span style={labelStyle}>Designation</span>}
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label={<span style={labelStyle}>Status</span>}
              >
                <Select
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "ON_LEAVE", label: "On Leave" },
                    { value: "PROBATION", label: "Probation" },
                    { value: "SUSPENDED", label: "Suspended" },
                    { value: "TERMINATED", label: "Terminated" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="salary"
                label={<span style={labelStyle}>Annual Salary (USD)</span>}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Emergency Contact */}
        <Card
          title={
            <span
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-on-surface)",
                fontWeight: 600,
              }}
            >
              Emergency Contact
            </span>
          }
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--ghost-border)",
            borderRadius: 4,
            marginBottom: 24,
          }}
          styles={{ body: { padding: 24 } }}
        >
          <Row gutter={[24, 0]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="emergencyContact"
                label={<span style={labelStyle}>Contact Name</span>}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="emergencyPhone"
                label={<span style={labelStyle}>Contact Phone</span>}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button onClick={() => router.push(`/hr/employees/${params.id}`)}>
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  );
}
