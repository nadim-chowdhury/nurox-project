"use client";

import React from "react";
import { Modal, Form, Select, DatePicker, Input, message, Checkbox } from "antd";
import { useTerminateEmployeeMutation } from "@/store/api/hrApi";
import dayjs from "dayjs";

interface Props {
  employeeId: string;
  visible: boolean;
  onClose: () => void;
}

const reasons = [
  { value: "RESIGNED", label: "Resigned" },
  { value: "TERMINATED", label: "Terminated" },
  { value: "RETIRED", label: "Retired" },
  { value: "DECEASED", label: "Deceased" },
];

const clearanceItems = [
  "IT Equipment Returned",
  "ID Card / Access Card Returned",
  "Company Credit Card Cancelled",
  "Relieving Letter Issued",
  "Full & Final Settlement Paid",
];

export const TerminateEmployeeModal: React.FC<Props> = ({ employeeId, visible, onClose }) => {
  const [form] = Form.useForm();
  const [terminate, { isLoading }] = useTerminateEmployeeMutation();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await terminate({
        id: employeeId,
        data: {
          ...values,
          endDate: dayjs(values.endDate).toISOString(),
        },
      }).unwrap();
      message.success("Employee termination processed successfully");
      onClose();
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to terminate employee");
    }
  };

  return (
    <Modal
      title="Terminate / Resignation Processing"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={isLoading}
      destroyOnClose
      okText="Process Termination"
      okButtonProps={{ danger: true }}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="reason" label="Reason" rules={[{ required: true }]}>
          <Select options={reasons} />
        </Form.Item>
        <Form.Item name="endDate" label="End Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="clearanceChecklist" label="Clearance Checklist">
          <Checkbox.Group options={clearanceItems} className="flex flex-col" />
        </Form.Item>
        <Form.Item name="comments" label="Comments">
          <Input.TextArea rows={3} placeholder="Additional notes..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};
