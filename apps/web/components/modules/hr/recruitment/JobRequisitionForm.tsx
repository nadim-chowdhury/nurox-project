"use client";

import React from "react";
import { Form, Input, Select, InputNumber, Button, Space, Card, Row, Col, message } from "antd";
import { useCreateJobMutation } from "@/store/api/recruitmentApi";
import { useGetDepartmentsQuery } from "@/store/api/hrApi";
import { useGetUsersQuery } from "@/store/api/usersApi";

const { TextArea } = Input;

export function JobRequisitionForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form] = Form.useForm();
  const [createJob, { isLoading }] = useCreateJobMutation();
  const { data: departments } = useGetDepartmentsQuery();
  const { data: usersResponse } = useGetUsersQuery({ page: 1, limit: 100, sortBy: "firstName", sortOrder: "ASC" });
  const users = usersResponse?.data;

  const onFinish = async (values: any) => {
    try {
      await createJob(values).unwrap();
      message.success("Job requisition created as DRAFT");
      form.resetFields();
      if (onSuccess) onSuccess();
    } catch (err) {
      message.error("Failed to create job requisition");
    }
  };

  return (
    <Card title="New Job Requisition" bordered={false}>
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
              <Select placeholder="Select department">
                {departments?.map((dept) => (
                  <Select.Option key={dept.id} value={dept.id}>{dept.name}</Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: "Please enter location" }]}
            >
              <Input placeholder="e.g. Remote, New York, etc." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="approverIds"
              label="Approval Chain"
              tooltip="Select users who need to approve this requisition"
            >
              <Select mode="multiple" placeholder="Select approvers">
                {users?.map((user: any) => (
                  <Select.Option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
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
          <Col span={12}>
            <Form.Item name="vacancies" label="Number of Vacancies">
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="minSalary" label="Min Salary">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="maxSalary" label="Max Salary">
              <InputNumber style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
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
          <TextArea rows={6} placeholder="Describe the role, responsibilities, and requirements..." />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Save as Draft
            </Button>
            <Button onClick={() => form.resetFields()}>Reset</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
