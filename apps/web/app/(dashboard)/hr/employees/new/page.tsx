"use client";

import React, { useState } from "react";
import {
  Steps,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Result,
  Space,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  UserOutlined,
  BankOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";

const STEPS = [
  { title: "Personal", icon: <UserOutlined /> },
  { title: "Employment", icon: <BankOutlined /> },
  { title: "Emergency", icon: <SafetyOutlined /> },
];

const labelStyle = { color: "var(--color-on-surface-variant)", fontSize: 13 };

export default function NewEmployeePage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [allValues, setAllValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const next = async () => {
    try {
      const values = await form.validateFields();
      setAllValues((prev) => ({ ...prev, ...values }));
      setCurrent((c) => c + 1);
    } catch {
      // Validation failed
    }
  };

  const prev = () => setCurrent((c) => c - 1);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      const finalData = { ...allValues, ...values };
      setLoading(true);
      // Will be: await createEmployee(finalData).unwrap();
      setTimeout(() => {
        setLoading(false);
        setDone(true);
        message.success("Employee created successfully");
      }, 1000);
    } catch {
      // Validation failed
    }
  };

  if (done) {
    return (
      <div
        className="animate-fade-in-up"
        style={{ maxWidth: 600, margin: "0 auto", marginTop: 80 }}
      >
        <Result
          status="success"
          title="Employee Created Successfully"
          subTitle="The new employee has been added to the system."
          extra={[
            <Button
              type="primary"
              key="list"
              onClick={() => router.push("/hr/employees")}
            >
              View Employees
            </Button>,
            <Button
              key="another"
              onClick={() => {
                setDone(false);
                setCurrent(0);
                form.resetFields();
                setAllValues({});
              }}
            >
              Add Another
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="New Employee"
        subtitle="Multi-step new hire onboarding"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Employees", href: "/hr/employees" },
          { label: "New" },
        ]}
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/hr/employees")}
          >
            Cancel
          </Button>
        }
      />

      {/* Steps */}
      <div style={{ maxWidth: 500, margin: "0 auto 32px" }}>
        <Steps current={current} size="small" items={STEPS} />
      </div>

      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          maxWidth: 700,
          margin: "0 auto",
        }}
        styles={{ body: { padding: 32 } }}
      >
        <Form form={form} layout="vertical" requiredMark={false} size="large">
          {/* Step 1: Personal */}
          <div style={{ display: current === 0 ? "block" : "none" }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-on-surface)",
                marginBottom: 24,
              }}
            >
              Personal Information
            </h3>
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="firstName"
                  label={<span style={labelStyle}>First Name</span>}
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="John" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="lastName"
                  label={<span style={labelStyle}>Last Name</span>}
                  rules={[{ required: true, message: "Required" }]}
                >
                  <Input placeholder="Doe" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="email"
                  label={<span style={labelStyle}>Email</span>}
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input placeholder="john.doe@nurox.com" />
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
              <Col xs={24} sm={12}>
                <Form.Item
                  name="gender"
                  label={<span style={labelStyle}>Gender</span>}
                >
                  <Select
                    placeholder="Select"
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
                  name="dateOfBirth"
                  label={<span style={labelStyle}>Date of Birth</span>}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Step 2: Employment */}
          <div style={{ display: current === 1 ? "block" : "none" }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-on-surface)",
                marginBottom: 24,
              }}
            >
              Employment Details
            </h3>
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="department"
                  label={<span style={labelStyle}>Department</span>}
                  rules={[{ required: true }]}
                >
                  <Select
                    placeholder="Select department"
                    options={[
                      { value: "Engineering", label: "Engineering" },
                      { value: "Human Resources", label: "Human Resources" },
                      { value: "Finance", label: "Finance" },
                      {
                        value: "Sales & Marketing",
                        label: "Sales & Marketing",
                      },
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
                  <Input placeholder="e.g., Frontend Developer" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="joinDate"
                  label={<span style={labelStyle}>Join Date</span>}
                  rules={[{ required: true }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="salary"
                  label={<span style={labelStyle}>Annual Salary (USD)</span>}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder="75000"
                    formatter={(value) =>
                      `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Step 3: Emergency */}
          <div style={{ display: current === 2 ? "block" : "none" }}>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-on-surface)",
                marginBottom: 24,
              }}
            >
              Emergency Contact
            </h3>
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="emergencyContact"
                  label={<span style={labelStyle}>Contact Name</span>}
                >
                  <Input placeholder="Parent / Spouse name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="emergencyPhone"
                  label={<span style={labelStyle}>Contact Phone</span>}
                >
                  <Input placeholder="+1 (555) 000-0000" />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item
                  name="address"
                  label={<span style={labelStyle}>Address</span>}
                >
                  <Input.TextArea rows={3} placeholder="Full address" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 24,
          }}
        >
          <Button onClick={prev} disabled={current === 0}>
            <ArrowLeftOutlined /> Previous
          </Button>
          {current < STEPS.length - 1 ? (
            <Button type="primary" onClick={next}>
              Next <ArrowRightOutlined />
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleFinish}
              loading={loading}
              icon={<CheckOutlined />}
            >
              Create Employee
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
