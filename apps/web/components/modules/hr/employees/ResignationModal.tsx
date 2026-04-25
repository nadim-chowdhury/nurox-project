"use client";

import React from "react";
import {
  Modal,
  Form,
  DatePicker,
  Input,
  message,
} from "antd";
import {
  LogoutOutlined,
} from "@ant-design/icons";
import { 
  useSubmitResignationMutation 
} from "@/store/api/hrApi";
import dayjs from "dayjs";

interface Props {
  employee: any;
  open: boolean;
  onClose: () => void;
}

const { TextArea } = Input;

export function ResignationModal({ employee, open, onClose }: Props) {
  const [form] = Form.useForm();
  const [submitResignation, { isLoading }] = useSubmitResignationMutation();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await submitResignation({
        id: employee.id,
        requestedLastWorkingDay: values.requestedLastWorkingDay.toISOString(),
        reason: values.reason,
      }).unwrap();
      message.success("Resignation submitted successfully");
      onClose();
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to submit resignation");
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LogoutOutlined style={{ color: 'var(--color-error)' }} />
          <span>Submit Resignation: {employee?.firstName} {employee?.lastName}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="Submit Resignation"
      okButtonProps={{ danger: true }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item 
          name="requestedLastWorkingDay" 
          label="Requested Last Working Day" 
          rules={[{ required: true }]}
          initialValue={dayjs().add(30, 'day')}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item 
          name="reason" 
          label="Reason for Leaving" 
          rules={[{ required: true, message: 'Please provide a reason' }]}
        >
          <TextArea rows={4} placeholder="Briefly describe your reason for leaving..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
