"use client";

import React, { useState } from "react";
import {
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Button,
  Space,
  Divider,
  Empty,
  Modal,
  Form,
  Input,
  InputNumber,
  Checkbox,
  Select,
  Upload,
  message,
} from "antd";
import {
  EnvironmentOutlined,
  ClockCircleOutlined,
  SendOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import {
  useApplyForJobMutation,
  useGetPublicResumeUploadUrlMutation,
} from "@/store/api/recruitmentApi";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

export function CareerPortalClient({ initialJobs }: { initialJobs: any[] }) {
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm] = Form.useForm();
  const [applyForJob, { isLoading: isApplying }] = useApplyForJobMutation();
  const [getUploadUrl] = useGetPublicResumeUploadUrlMutation();
  const [resumeUrl, setResumeUrl] = useState<string>("");

  const handleFileUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    try {
      const { uploadUrl, key } = await getUploadUrl({
        fileName: file.name,
        contentType: file.type,
      }).unwrap();

      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      setResumeUrl(key);
      onSuccess("OK");
      message.success(`${file.name} uploaded successfully.`);
    } catch (err) {
      onError(err);
      message.error(`${file.name} upload failed.`);
    }
  };

  const handleApply = async (values: any) => {
    try {
      await applyForJob({
        candidate: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          resumeUrl: resumeUrl,
          skills: [],
        },
        application: {
          jobId: selectedJob.id,
          notes: values.notes,
        },
      }).unwrap();

      message.success("Application submitted successfully!");
      setIsApplyModalOpen(false);
      applyForm.resetFields();
      setResumeUrl("");
    } catch (err) {
      message.error("Failed to submit application");
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <Title>Join Our Team</Title>
        <Paragraph
          style={{ fontSize: 18, color: "var(--color-text-secondary)" }}
        >
          Help us build the future of enterprise management.
        </Paragraph>
      </div>

      {initialJobs && initialJobs.length > 0 ? (
        <Row gutter={[24, 24]}>
          {initialJobs.map((job) => (
            <Col xs={24} key={job.id}>
              <Card
                hoverable
                style={{ borderRadius: 12 }}
                onClick={() => {
                  setSelectedJob(job);
                  setIsApplyModalOpen(true);
                }}
              >
                <Row align="middle" gutter={24}>
                  <Col flex="auto">
                    <Title level={4} style={{ margin: 0 }}>
                      {job.title}
                    </Title>
                    <Space
                      split={<Divider type="vertical" />}
                      style={{ marginTop: 8 }}
                    >
                      <Text type="secondary">
                        <EnvironmentOutlined /> {job.location}
                      </Text>
                      <Text type="secondary">
                        <ClockCircleOutlined />{" "}
                        {job.employmentType.replace("_", " ")}
                      </Text>
                      <Tag color="blue">{job.department?.name}</Tag>
                    </Space>
                  </Col>
                  <Col>
                    <Button type="primary" size="large">
                      Apply Now
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description="No open positions at the moment. Check back later!" />
      )}

      <Modal
        title={selectedJob ? `Apply for ${selectedJob.title}` : "Apply"}
        open={isApplyModalOpen}
        onCancel={() => setIsApplyModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <div style={{ marginBottom: 24 }}>
          <Title level={5}>Job Description</Title>
          <div
            dangerouslySetInnerHTML={{ __html: selectedJob?.description }}
            style={{
              backgroundColor: "#fafafa",
              padding: 16,
              borderRadius: 8,
              maxHeight: 200,
              overflowY: "auto",
            }}
          />
        </div>

        <Divider />

        <Form form={applyForm} layout="vertical" onFinish={handleApply}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Phone">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="notes" label="Why do you want to join us?">
            <Input.TextArea rows={4} />
          </Form.Item>

          {/* Render Custom Fields */}
          {selectedJob?.applicationFormConfig?.map((field: any) => (
            <Form.Item
              key={field.id}
              name={["customFields", field.id]}
              label={field.label}
              rules={[
                {
                  required: field.required,
                  message: `${field.label} is required`,
                },
              ]}
            >
              {field.type === "text" && <Input />}
              {field.type === "number" && (
                <InputNumber style={{ width: "100%" }} />
              )}
              {field.type === "select" && (
                <Select placeholder="Select an option">
                  {field.options?.map((opt: string) => (
                    <Select.Option key={opt} value={opt}>
                      {opt}
                    </Select.Option>
                  ))}
                </Select>
              )}
              {field.type === "checkbox" && <Checkbox>{field.label}</Checkbox>}
              {field.type === "file" && (
                <Upload customRequest={handleFileUpload} maxCount={1}>
                  <Button icon={<InboxOutlined />}>Upload File</Button>
                </Upload>
              )}
            </Form.Item>
          ))}

          <Form.Item
            label="Resume / CV"
            extra="Upload your resume in PDF or Word format"
          >
            <Dragger
              customRequest={handleFileUpload}
              maxCount={1}
              accept=".pdf,.doc,.docx"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag file to this area to upload
              </p>
              <p className="ant-upload-hint">
                Support for a single upload. Maximum file size: 5MB.
              </p>
            </Dragger>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={isApplying}
              block
              size="large"
            >
              Submit Application
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <div
        style={{
          marginTop: 80,
          textAlign: "center",
          color: "var(--color-text-secondary)",
        }}
      >
        <Text type="secondary">
          © 2026 Nurox ERP. Powered by Nurox Recruitment.
        </Text>
      </div>
    </div>
  );
}
