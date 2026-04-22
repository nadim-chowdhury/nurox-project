"use client";

import React from "react";
import { Modal, Form, Select, DatePicker, Input, Button, Space, message } from "antd";
import { useApplyLeaveMutation } from "@/store/api/attendanceApi";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string;
}

export function ApplyLeaveModal({ open, onClose, employeeId }: Props) {
  const [form] = Form.useForm();
  const [applyLeave, { isLoading }] = useApplyLeaveMutation();

  const onFinish = async (values: any) => {
    const { dateRange, ...rest } = values;
    try {
      await applyLeave({
        employeeId,
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
        ...rest,
      }).unwrap();
      message.success("Leave application submitted successfully");
      form.resetFields();
      onClose();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to apply for leave");
    }
  };

  return (
    <Modal
      title="Apply for Leave"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="leaveType" label="Leave Type" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "ANNUAL", label: "Annual Leave" },
              { value: "SICK", label: "Sick Leave" },
              { value: "CASUAL", label: "Casual Leave" },
              { value: "MATERNITY", label: "Maternity Leave" },
              { value: "PATERNITY", label: "Paternity Leave" },
              { value: "UNPAID", label: "Unpaid Leave" },
            ]}
          />
        </Form.Item>

        <Form.Item name="dateRange" label="Period" rules={[{ required: true }]}>
          <DatePicker.RangePicker style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
          <Input.TextArea rows={4} placeholder="Briefly explain the reason for leave" />
        </Form.Item>

        <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: "right" }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Submit Application
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
