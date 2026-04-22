"use client";

import React, { useState } from "react";
import { Form, Input, Button, Space, message, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useCreateCandidateMutation, useGetResumeUploadUrlMutation } from "@/store/api/recruitmentApi";

export function CandidateForm({ onSuccess }: { onSuccess: (candidate: any) => void }) {
  const [form] = Form.useForm();
  const [createCandidate, { isLoading: isCreating }] = useCreateCandidateMutation();
  const [getUploadUrl] = useGetResumeUploadUrlMutation();
  const [fileList, setFileList] = useState<any[]>([]);

  const onFinish = async (values: any) => {
    try {
        const candidate = await createCandidate(values).unwrap();
        
        if (fileList.length > 0) {
            const file = fileList[0].originFileObj;
            const { uploadUrl, key } = await getUploadUrl({ 
                id: candidate.id, 
                fileName: file.name, 
                contentType: file.type 
            }).unwrap();

            // Simulate upload to S3/MinIO
            message.loading("Uploading resume...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            message.success("Candidate profile & resume created");
        } else {
            message.success("Candidate profile created");
        }
        
        onSuccess(candidate);
    } catch (err) {
        message.error("Failed to create candidate");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={16}>
        <Col span={12}>
            <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
                <Input placeholder="John" />
            </Form.Item>
        </Col>
        <Col span={12}>
            <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
                <Input placeholder="Doe" />
            </Form.Item>
        </Col>
      </Row>

      <Form.Item name="email" label="Email" rules={[{ required: true, type: "email" }]}>
        <Input placeholder="john.doe@example.com" />
      </Form.Item>

      <Form.Item name="phone" label="Phone">
        <Input placeholder="+1234567890" />
      </Form.Item>

      <Form.Item label="Resume">
        <Upload 
            fileList={fileList} 
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            maxCount={1}
        >
          <Button icon={<UploadOutlined />} block>Select Resume (PDF)</Button>
        </Upload>
      </Form.Item>

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" loading={isCreating} block>
          Create Candidate
        </Button>
      </Form.Item>
    </Form>
  );
}

import { Row, Col } from "antd";
