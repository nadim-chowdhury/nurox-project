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
  message,
  Upload,
} from "antd";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckOutlined,
  UserOutlined,
  BankOutlined,
  SafetyOutlined,
  DollarOutlined,
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { 
  useCreateEmployeeMutation, 
  useGetDepartmentsQuery, 
  useGetDesignationsQuery,
  useGetEmployeesQuery 
} from "@/store/api/hrApi";
import dayjs from "dayjs";
import { 
  employeePersonalSchema, 
  employmentDetailsSchema, 
  compensationDetailsSchema 
} from "@repo/shared-schemas";

const STEPS = [
  { title: "Personal", icon: <UserOutlined />, schema: employeePersonalSchema },
  { title: "Employment", icon: <BankOutlined />, schema: employmentDetailsSchema },
  { title: "Compensation", icon: <DollarOutlined />, schema: compensationDetailsSchema },
  { title: "Emergency", icon: <SafetyOutlined />, schema: null },
  { title: "Documents", icon: <FileTextOutlined />, schema: null },
];

const labelStyle = { color: "var(--color-on-surface-variant)", fontSize: 13 };

export default function NewEmployeePage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [allValues, setAllValues] = useState<Record<string, any>>({});
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [createEmployee, { isLoading }] = useCreateEmployeeMutation();
  const { data: departments } = useGetDepartmentsQuery();
  const { data: designations } = useGetDesignationsQuery();
  const { data: managers } = useGetEmployeesQuery({});

  const validateStep = async (stepIndex: number, values: any) => {
    const step = STEPS[stepIndex];
    if (!step || !step.schema) return true;

    // Pre-process values for Zod (e.g. format dates)
    const processedValues = { ...values };
    if (processedValues.dateOfBirth) processedValues.dateOfBirth = dayjs(processedValues.dateOfBirth).toISOString();
    if (processedValues.joinDate) processedValues.joinDate = dayjs(processedValues.joinDate).toISOString();
    if (processedValues.probationEndDate) processedValues.probationEndDate = dayjs(processedValues.probationEndDate).toISOString();
    if (processedValues.contractExpiryDate) processedValues.contractExpiryDate = dayjs(processedValues.contractExpiryDate).toISOString();

    const result = step.schema.safeParse(processedValues);
    if (!result.success) {
      const fieldErrors = result.error.issues.map(err => ({
        name: err.path,
        errors: [err.message],
      }));
      form.setFields(fieldErrors);
      return false;
    }
    return true;
  };

  const next = async () => {
    try {
      const values = await form.validateFields();
      const isValid = await validateStep(current, values);
      if (!isValid) return;

      setAllValues((prev) => ({ ...prev, ...values }));
      setCurrent((c) => c + 1);
    } catch {
      // Ant Design internal validation failed
    }
  };

  const prev = () => setCurrent((c) => c - 1);

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      const finalData = { ...allValues, ...values };
      
      // Format dates for API
      const formattedData = {
          ...finalData,
          dateOfBirth: finalData.dateOfBirth ? dayjs(finalData.dateOfBirth).toISOString() : undefined,
          joinDate: dayjs(finalData.joinDate).toISOString(),
          probationEndDate: finalData.probationEndDate ? dayjs(finalData.probationEndDate).toISOString() : undefined,
          contractExpiryDate: finalData.contractExpiryDate ? dayjs(finalData.contractExpiryDate).toISOString() : undefined,
          branchId: "b8f6e696-e137-4d7a-8f55-7c050002f23b", // Mock branch ID
      };

      await createEmployee(formattedData).unwrap();
      setDone(true);
      message.success("Employee created successfully");
    } catch (err: any) {
      message.error(err.data?.message || "Failed to create employee");
    }
  };

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      // 1. Get pre-signed URL
      const resp = await fetch(`/api/system/upload-url?fileName=${file.name}&contentType=${file.type}`);
      const { url, key } = await resp.json();

      // 2. Upload to S3/MinIO
      await fetch(url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // 3. Set field value to the key/URL
      const publicUrl = `http://localhost:9000/nurox/${key}`; // Mock public URL
      form.setFieldValue("contractUrl", publicUrl);
      
      onSuccess(null, file);
      message.success(`${file.name} uploaded successfully`);
    } catch (err) {
      onError(err);
      message.error(`${file.name} upload failed`);
    } finally {
      setUploading(false);
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
          subTitle="The new employee has been added to the system and initial records have been generated."
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
      <div style={{ maxWidth: 600, margin: "0 auto 32px" }}>
        <Steps current={current} size="small" items={STEPS} />
      </div>

      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          maxWidth: 800,
          margin: "0 auto",
        }}
        styles={{ body: { padding: 32 } }}
      >
        <Form form={form} layout="vertical" requiredMark={false} size="large">
          {/* Step 1: Personal */}
          <div style={{ display: current === 0 ? "block" : "none" }}>
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--color-on-surface)", marginBottom: 24 }}>
              Personal Information
            </h3>
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item name="firstName" label={<span style={labelStyle}>First Name</span>} rules={[{ required: true }]}>
                  <Input placeholder="John" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="lastName" label={<span style={labelStyle}>Last Name</span>} rules={[{ required: true }]}>
                  <Input placeholder="Doe" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="email" label={<span style={labelStyle}>Email</span>} rules={[{ required: true, type: "email" }]}>
                  <Input placeholder="john.doe@nurox.com" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="phone" label={<span style={labelStyle}>Phone</span>} rules={[{ required: true }]}>
                  <Input placeholder="+1 (555) 000-0000" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="gender" label={<span style={labelStyle}>Gender</span>}>
                  <Select placeholder="Select" options={[{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "OTHER", label: "Other" }]} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="dateOfBirth" label={<span style={labelStyle}>Date of Birth</span>}>
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24}>
                <Form.Item name="address" label={<span style={labelStyle}>Current Address</span>}>
                  <Input.TextArea rows={2} placeholder="Full address" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Step 2: Employment */}
          <div style={{ display: current === 1 ? "block" : "none" }}>
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--color-on-surface)", marginBottom: 24 }}>
              Employment Details
            </h3>
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item name="employeeCode" label={<span style={labelStyle}>Employee Code</span>} rules={[{ required: true }]}>
                  <Input placeholder="EMP-001" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="employmentType" label={<span style={labelStyle}>Employment Type</span>} initialValue="FULL_TIME">
                  <Select options={[
                      { value: "FULL_TIME", label: "Full Time" },
                      { value: "PART_TIME", label: "Part Time" },
                      { value: "CONTRACT", label: "Contract" },
                      { value: "INTERN", label: "Intern" },
                      { value: "PROBATION", label: "Probation" },
                  ]} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="departmentId" label={<span style={labelStyle}>Department</span>} rules={[{ required: true }]}>
                  <Select placeholder="Select department" options={departments?.map(d => ({ value: d.id, label: d.name }))} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="designationId" label={<span style={labelStyle}>Designation</span>} rules={[{ required: true }]}>
                   <Select placeholder="Select designation" options={designations?.map(d => ({ value: d.id, label: d.title }))} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="managerId" label={<span style={labelStyle}>Reporting Manager</span>}>
                  <Select placeholder="Select manager" options={managers?.data.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="joinDate" label={<span style={labelStyle}>Join Date</span>} rules={[{ required: true }]}>
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="probationEndDate" label={<span style={labelStyle}>Probation End Date</span>}>
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Step 3: Compensation & Bank */}
          <div style={{ display: current === 2 ? "block" : "none" }}>
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--color-on-surface)", marginBottom: 24 }}>
              Compensation & Bank Details
            </h3>
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item name="baseSalary" label={<span style={labelStyle}>Base Salary (Monthly)</span>} rules={[{ required: true }]}>
                  <InputNumber style={{ width: "100%" }} min={0} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="currency" label={<span style={labelStyle}>Currency</span>} initialValue="USD">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="bankName" label={<span style={labelStyle}>Bank Name</span>}>
                  <Input placeholder="e.g. Standard Chartered" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="accountNumber" label={<span style={labelStyle}>Account Number</span>}>
                  <Input placeholder="000-000000-00" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="routingNumber" label={<span style={labelStyle}>Routing Number</span>}>
                  <Input placeholder="123456789" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="taxId" label={<span style={labelStyle}>Tax ID / TIN</span>}>
                  <Input placeholder="000-000-000" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Step 4: Emergency */}
          <div style={{ display: current === 3 ? "block" : "none" }}>
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--color-on-surface)", marginBottom: 24 }}>
              Emergency Contact
            </h3>
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item name="emergencyContactName" label={<span style={labelStyle}>Contact Name</span>} rules={[{ required: true }]}>
                  <Input placeholder="Full name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="emergencyContactPhone" label={<span style={labelStyle}>Contact Phone</span>} rules={[{ required: true }]}>
                  <Input placeholder="+1 (555) 000-0000" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="emergencyContactRelationship" label={<span style={labelStyle}>Relationship</span>}>
                  <Select placeholder="Select" options={[
                      { value: "SPOUSE", label: "Spouse" },
                      { value: "PARENT", label: "Parent" },
                      { value: "SIBLING", label: "Sibling" },
                      { value: "OTHER", label: "Other" },
                  ]} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Step 5: Documents */}
          <div style={{ display: current === 4 ? "block" : "none" }}>
            <h3 style={{ fontFamily: "var(--font-display)", color: "var(--color-on-surface)", marginBottom: 24 }}>
              Documents & Contract
            </h3>
            <Row gutter={[24, 0]}>
              <Col xs={24} sm={12}>
                <Form.Item name="contractUrl" label={<span style={labelStyle}>Contract Upload</span>}>
                  <Upload 
                    customRequest={customRequest} 
                    maxCount={1}
                    showUploadList={{ showRemoveIcon: true }}
                  >
                    <Button icon={<UploadOutlined />} loading={uploading}>Click to Upload Contract</Button>
                  </Upload>
                </Form.Item>
                <Form.Item name="contractUrl" noStyle>
                    <Input type="hidden" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="contractExpiryDate" label={<span style={labelStyle}>Contract Expiry Date</span>}>
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
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
              loading={isLoading}
              icon={<CheckOutlined />}
            >
              Complete Onboarding
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
