"use client";

import React from "react";
import { Modal, Form, InputNumber, Select, Input, message } from "antd";
import { useUpdateSalaryMutation } from "@/store/api/hrApi";

interface Props {
  employeeId: string;
  visible: boolean;
  onClose: () => void;
}

const salaryReasons = [
  { value: "ANNUAL_INCREMENT", label: "Annual Increment" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "MARKET_ADJUSTMENT", label: "Market Adjustment" },
  { value: "CORRECTION", label: "Correction" },
  { value: "OTHER", label: "Other" },
];

export const UpdateSalaryModal: React.FC<Props> = ({ employeeId, visible, onClose }) => {
  const [form] = Form.useForm();
  const [updateSalary, { isLoading }] = useUpdateSalaryMutation();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await updateSalary({
        id: employeeId,
        ...values,
      }).unwrap();
      message.success("Salary updated successfully");
      onClose();
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to update salary");
    }
  };

  return (
    <Modal
      title="Salary Revision"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={isLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="newSalary" label="New Monthly Salary" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} min={0} prefix="$" />
        </Form.Item>
        <Form.Item name="reason" label="Reason for Change" rules={[{ required: true }]}>
          <Select options={salaryReasons} />
        </Form.Item>
        <Form.Item name="comments" label="Comments">
          <Input.TextArea rows={3} placeholder="Rationale for revision..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
