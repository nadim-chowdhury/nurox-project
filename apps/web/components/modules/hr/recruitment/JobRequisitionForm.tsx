"use client";

import React from "react";
import { Form, Input, Select, InputNumber, Button, Space, Card, Row, Col, message, Divider } from "antd";
import { useCreateJobMutation } from "@/store/api/recruitmentApi";
import { useGetDepartmentsQuery, useGetDesignationsQuery } from "@/store/api/hrApi";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import { ApplicationFormBuilder } from "./ApplicationFormBuilder";

export function JobRequisitionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form] = Form.useForm();
  const [createJob, { isLoading }] = useCreateJobMutation();
  const { data: departments } = useGetDepartmentsQuery();
  const { data: designations } = useGetDesignationsQuery();
  const { data: usersResponse } = useGetUsersQuery({ page: 1, limit: 100, sortBy: "firstName", sortOrder: "ASC" });
  const users = usersResponse?.data;

  const onFinish = async (values: any) => {
    try {
      // Structure the approval chain based on the specific fields
      const approverIds = [
        values.reportingManagerId,
        values.hrManagerId,
        values.financeManagerId
      ].filter(Boolean);

      const payload = {
        ...values,
        approverIds, // We'll pass this and handle it on backend or in the submit call
      };

      await createJob(payload).unwrap();
      message.success("Job requisition created as DRAFT");
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (err) {
      message.error("Failed to create job requisition");
    }
  };

  return (
    <div style={{ maxHeight: "70vh", overflowY: "auto", padding: "4px" }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ currency: "USD", employmentType: "FULL_TIME", vacancies: 1 }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Job Title"
              rules={[{ required: true, message: "Please enter job title" }]}
            >
              <Input placeholder="e.g. Senior Frontend Engineer" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="departmentId"
              label="Department"
              rules={[{ required: true, message: "Please select department" }]}
            >
              <Select placeholder="Select department" showSearch filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>
                {departments?.map((dept) => (
                  <Select.Option key={dept.id} value={dept.id}>{dept.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="designationId"
              label="Designation"
              rules={[{ required: true, message: "Please select designation" }]}
            >
              <Select placeholder="Select designation" showSearch filterOption={(input, option) => (option?.children as unknown as string).toLowerCase().includes(input.toLowerCase())}>
                {designations?.map((desig) => (
                  <Select.Option key={desig.id} value={desig.id}>{desig.title}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: "Please enter location" }]}
            >
              <Input placeholder="e.g. Remote, New York, etc." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="employmentType" label="Employment Type">
              <Select>
                <Select.Option value="FULL_TIME">Full Time</Select.Option>
                <Select.Option value="PART_TIME">Part Time</Select.Option>
                <Select.Option value="CONTRACT">Contract</Select.Option>
                <Select.Option value="INTERN">Intern</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider>Approval Workflow</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="reportingManagerId"
              label="Reporting Manager"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select placeholder="Select Manager" showSearch>
                {users?.map((u: any) => (
                  <Select.Option key={u.id} value={u.id}>{u.firstName} {u.lastName}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="hrManagerId"
              label="HR Approver"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select placeholder="Select HR" showSearch>
                {users?.map((u: any) => (
                  <Select.Option key={u.id} value={u.id}>{u.firstName} {u.lastName}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="financeManagerId"
              label="Finance Approver"
              rules={[{ required: true, message: "Required" }]}
            >
              <Select placeholder="Select Finance" showSearch>
                {users?.map((u: any) => (
                  <Select.Option key={u.id} value={u.id}>{u.firstName} {u.lastName}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Divider>
Compensation & Vacancies</Divider>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="vacancies" label="Vacancies">
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="minSalary" label="Min Salary">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="maxSalary" label="Max Salary">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="currency" label="Currency">
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Job Description"
          rules={[{ required: true, message: "Please enter job description" }]}
        >
          <RichTextEditor placeholder="Enter job description, requirements, responsibilities..." />
        </Form.Item>

        <Divider>
Application Form Customization</Divider>
        <Form.Item name="applicationFormConfig">
          <ApplicationFormBuilder />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={isLoading} size="large">
              Create Requisition
            </Button>
            <Button onClick={() => form.resetFields()} size="large">Reset</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
