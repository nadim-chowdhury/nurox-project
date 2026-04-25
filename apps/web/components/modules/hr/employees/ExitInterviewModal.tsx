"use client";

import React from "react";
import {
  Modal,
  Form,
  Rate,
  Radio,
  Input,
  message,
  Divider,
} from "antd";
import {
  FileSearchOutlined,
} from "@ant-design/icons";
import { 
  useSubmitExitInterviewMutation 
} from "@/store/api/hrApi";

interface Props {
  employee: any;
  open: boolean;
  onClose: () => void;
}

const { TextArea } = Input;

export function ExitInterviewModal({ employee, open, onClose }: Props) {
  const [form] = Form.useForm();
  const [submitInterview, { isLoading }] = useSubmitExitInterviewMutation();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await submitInterview({
        id: employee.id,
        responses: values,
      }).unwrap();
      message.success("Exit interview submitted");
      onClose();
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to submit exit interview");
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileSearchOutlined style={{ color: 'var(--color-primary)' }} />
          <span>Exit Interview: {employee?.firstName} {employee?.lastName}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="Submit Feedback"
      width={600}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item 
          name="reasonForLeaving" 
          label="Primary reason for leaving?" 
          rules={[{ required: true }]}
        >
          <TextArea rows={2} placeholder="e.g. Better opportunity, relocation, personal reasons..." />
        </Form.Item>

        <Divider />

        <Form.Item name="satisfactionWithRole" label="Satisfaction with your role & responsibilities?" rules={[{ required: true }]}>
          <Rate />
        </Form.Item>

        <Form.Item name="satisfactionWithManagement" label="Satisfaction with company management?" rules={[{ required: true }]}>
          <Rate />
        </Form.Item>

        <Form.Item name="recommendCompany" label="Would you recommend Nurox as a place to work?" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="additionalComments" label="Any other feedback or suggestions?">
          <TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
