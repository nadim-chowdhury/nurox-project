"use client";

import React from "react";
import { Modal, Form, Select, DatePicker, Input, message } from "antd";
import { useTransferEmployeeMutation, useGetDepartmentsQuery, useGetDesignationsQuery } from "@/store/api/hrApi";
import dayjs from "dayjs";

interface Props {
  employee: any;
  open: boolean;
  onClose: () => void;
}

export const TransferEmployeeModal: React.FC<Props> = ({ employee, open, onClose }) => {
  const [form] = Form.useForm();
  const [transfer, { isLoading }] = useTransferEmployeeMutation();
  const { data: departments } = useGetDepartmentsQuery();
  const { data: designations } = useGetDesignationsQuery();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await transfer({
        id: employee.id,
        data: {
          ...values,
          effectiveDate: dayjs(values.effectiveDate).toISOString(),
        },
      }).unwrap();
      message.success("Employee transferred successfully");
      onClose();
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to transfer employee");
    }
  };

  return (
    <Modal
      title="Transfer / Promote Employee"
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={isLoading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="departmentId" label="New Department" rules={[{ required: true }]}>
          <Select options={departments?.map(d => ({ value: d.id, label: d.name }))} />
        </Form.Item>
        <Form.Item name="designationId" label="New Designation" rules={[{ required: true }]}>
          <Select options={designations?.map(d => ({ value: d.id, label: d.title }))} />
        </Form.Item>
        <Form.Item name="effectiveDate" label="Effective Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="comments" label="Comments">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
