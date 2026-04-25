"use client";

import React from "react";
import {
  Modal,
  Form,
  DatePicker,
  Select,
  Input,
  Checkbox,
  message,
} from "antd";
import {
  StopOutlined,
} from "@ant-design/icons";
import { 
  useTerminateEmployeeMutation 
} from "@/store/api/hrApi";
import dayjs from "dayjs";

interface Props {
  employee: any;
  open: boolean;
  onClose: () => void;
}

const { TextArea } = Input;

export function TerminationModal({ employee, open, onClose }: Props) {
  const [form] = Form.useForm();
  const [terminateEmployee, { isLoading }] = useTerminateEmployeeMutation();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await terminateEmployee({
        id: employee.id,
        data: {
          terminationDate: values.terminationDate.toISOString(),
          lastWorkingDay: values.lastWorkingDay.toISOString(),
          type: values.type,
          reason: values.reason,
          isEligibleForRehire: values.isEligibleForRehire,
        }
      }).unwrap();
      message.success("Employee termination processed");
      onClose();
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to process termination");
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StopOutlined style={{ color: 'var(--color-error)' }} />
          <span>Terminate Employment: {employee?.firstName} {employee?.lastName}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      okText="Confirm Termination"
      okButtonProps={{ danger: true }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item name="type" label="Termination Type" rules={[{ required: true }]}>
          <Select options={[
            { value: "LAYOFF", label: "Layoff" },
            { value: "PERFORMANCE", label: "Performance Related" },
            { value: "MISCONDUCT", label: "Misconduct" },
            { value: "RETIREMENT", label: "Retirement" },
            { value: "OTHER", label: "Other" },
          ]} />
        </Form.Item>

        <Form.Item 
          name="terminationDate" 
          label="Termination Date" 
          rules={[{ required: true }]}
          initialValue={dayjs()}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item 
          name="lastWorkingDay" 
          label="Last Working Day" 
          rules={[{ required: true }]}
          initialValue={dayjs()}
        >
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item 
          name="reason" 
          label="Reason for Termination" 
          rules={[{ required: true, message: 'Please provide detailed reason' }]}
        >
          <TextArea rows={4} placeholder="Detailed justification..." />
        </Form.Item>

        <Form.Item name="isEligibleForRehire" valuePropName="checked">
          <Checkbox>Eligible for re-hire in future</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}
