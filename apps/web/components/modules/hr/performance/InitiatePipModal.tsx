"use client";

import React from "react";
import { Modal, Form, Select, Input, DatePicker, message } from "antd";
import { useInitiatePIPMutation, useGetEmployeesQuery } from "@/store/api/hrApi";
import dayjs from "dayjs";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const InitiatePipModal: React.FC<Props> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [initiatePip, { isLoading }] = useInitiatePIPMutation();
  const { data: employees } = useGetEmployeesQuery({});

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await initiatePip({
        id: values.employeeId,
        data: {
            ...values,
            startDate: dayjs(values.startDate).toISOString(),
            endDate: dayjs(values.endDate).toISOString(),
        },
      }).unwrap();
      message.success("PIP initiated successfully");
      onClose();
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to initiate PIP");
    }
  };

  return (
    <Modal
      title="Initiate Performance Improvement Plan (PIP)"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={isLoading}
      destroyOnClose
      okText="Initiate PIP"
      okButtonProps={{ danger: true }}
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
        <Form.Item name="period" label="PIP Period" rules={[{ required: true }]}>
          <Input placeholder="e.g. 30 Days Improvement Plan" />
        </Form.Item>
        <Form.Item name="objective" label="Primary Objectives" rules={[{ required: true }]}>
          <Input.TextArea rows={3} placeholder="What needs to be improved?" />
        </Form.Item>
        <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]} style={{ flex: 1 }}>
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="endDate" label="End Date" rules={[{ required: true }]} style={{ flex: 1 }}>
                <DatePicker style={{ width: '100%' }} />
            </Form.Item>
        </div>
        <Form.Item name="documentationUrl" label="Documentation Link">
          <Input placeholder="Link to detailed plan / previous reviews" />
        </Form.Item>
        <Form.Item name="comments" label="Manager's Comments">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
