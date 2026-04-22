"use client";

import React from "react";
import { Modal, Form, Select, Input, Rate, message } from "antd";
import { useSubmit360ReviewMutation, useGetEmployeesQuery } from "@/store/api/hrApi";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const AddThreeSixtyReviewModal: React.FC<Props> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [submit360, { isLoading }] = useSubmit360ReviewMutation();
  const { data: employees } = useGetEmployeesQuery({});

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await submit360({
        id: values.employeeId,
        data: values,
      }).unwrap();
      message.success("360° Review submitted successfully");
      onClose();
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to submit review");
    }
  };

  return (
    <Modal
      title="Submit 360° Feedback"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={isLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="employeeId" label="Employee" rules={[{ required: true }]}>
          <Select 
            showSearch
            placeholder="Select employee"
            options={employees?.data.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </Form.Item>
        <Form.Item name="period" label="Review Period" rules={[{ required: true }]}>
            <Select options={[
                { value: "Annual 2025", label: "Annual 2025" },
                { value: "Mid-Year 2026", label: "Mid-Year 2026" },
                { value: "Probation Review", label: "Probation Review" },
            ]} />
        </Form.Item>
        <Form.Item name="objective" label="Review Focus" rules={[{ required: true }]}>
          <Input placeholder="e.g. Leadership and Collaboration" />
        </Form.Item>
        <Form.Item name="selfRating" label="Self Rating" rules={[{ required: true }]}>
          <Rate allowHalf />
        </Form.Item>
        <Form.Item name="comments" label="Overall Feedback">
          <Input.TextArea rows={4} placeholder="Detailed feedback..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
