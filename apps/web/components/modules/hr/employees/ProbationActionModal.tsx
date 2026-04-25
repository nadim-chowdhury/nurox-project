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
  HistoryOutlined,
} from "@ant-design/icons";
import { 
  useExtendProbationMutation,
  useCompleteProbationMutation
} from "@/store/api/hrApi";
import dayjs from "dayjs";

interface Props {
  employee: any;
  open: boolean;
  onClose: () => void;
  mode: "extend" | "complete";
}

const { TextArea } = Input;

export function ProbationActionModal({ employee, open, onClose, mode }: Props) {
  const [form] = Form.useForm();
  const [extendProbation, { isLoading: isExtending }] = useExtendProbationMutation();
  const [completeProbation, { isLoading: isCompleting }] = useCompleteProbationMutation();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (mode === "extend") {
        await extendProbation({
          id: employee.id,
          newEndDate: values.newEndDate.toISOString(),
          comments: values.comments,
        }).unwrap();
        message.success("Probation period extended");
      } else {
        await completeProbation({
          id: employee.id,
          comments: values.comments,
        }).unwrap();
        message.success("Probation completed successfully");
      }
      onClose();
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || `Failed to ${mode} probation`);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <HistoryOutlined style={{ color: 'var(--color-primary)' }} />
          <span>{mode === "extend" ? "Extend Probation" : "Complete Probation"}: {employee?.firstName} {employee?.lastName}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isExtending || isCompleting}
      okText={mode === "extend" ? "Confirm Extension" : "Confirm Completion"}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {mode === "extend" && (
          <Form.Item 
            name="newEndDate" 
            label="New Probation End Date" 
            rules={[{ required: true }]}
            initialValue={employee?.probationEndDate ? dayjs(employee.probationEndDate).add(3, 'month') : dayjs().add(3, 'month')}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        )}
        <Form.Item 
          name="comments" 
          label="Comments / Review Summary" 
          rules={[{ required: true, message: 'Please provide comments' }]}
        >
          <TextArea rows={4} placeholder="Summarize the performance review..." />
        </Form.Item>
      </Form>
    </Modal>
  );
}
