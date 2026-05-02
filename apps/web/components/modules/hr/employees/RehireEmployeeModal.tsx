"use client";

import React from "react";
import { Modal, Form, DatePicker, InputNumber, Select, message, Alert } from "antd";
import { useRehireEmployeeMutation, useGetDepartmentsQuery, useGetDesignationsQuery } from "@/store/api/hrApi";
import dayjs from "dayjs";

interface Props {
  employee: any;
  open: boolean;
  onClose: () => void;
}

export const RehireEmployeeModal: React.FC<Props> = ({ employee, open, onClose }) => {
  const [form] = Form.useForm();
  const [rehire, { isLoading }] = useRehireEmployeeMutation();
  const { data: departments } = useGetDepartmentsQuery();
  const { data: designations } = useGetDesignationsQuery();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await rehire({
        id: employee.id,
        data: {
          ...values,
          joinDate: dayjs(values.joinDate).toISOString(),
        },
      }).unwrap();
      message.success("Employee re-hired successfully");
      onClose();
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to re-hire employee");
    }
  };

  return (
    <Modal
      title={`Re-hire Employee: ${employee?.firstName} ${employee?.lastName}`}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={isLoading}
      destroyOnClose
      okText="Confirm Re-hire"
    >
      <Alert
        message="Re-hiring will reactivate the employee record and create a new employment history entry."
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />
      <Form form={form} layout="vertical">
        <Form.Item name="joinDate" label="New Join Date" rules={[{ required: true }]} initialValue={dayjs()}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="baseSalary" label="New Base Salary" rules={[{ required: true }]} initialValue={employee?.salary}>
          <InputNumber style={{ width: "100%" }} prefix="$" />
        </Form.Item>
        <Form.Item name="departmentId" label="Department" rules={[{ required: true }]} initialValue={employee?.departmentId}>
          <Select options={departments?.map(d => ({ value: d.id, label: d.name }))} />
        </Form.Item>
        <Form.Item name="designationId" label="Designation" rules={[{ required: true }]} initialValue={employee?.designationId}>
          <Select options={designations?.map(d => ({ value: d.id, label: d.title }))} />
        </Form.Item>
        <Form.Item name="employmentType" label="Employment Type" rules={[{ required: true }]} initialValue={employee?.employmentType}>
          <Select options={[
              { value: "FULL_TIME", label: "Full Time" },
              { value: "PART_TIME", label: "Part Time" },
              { value: "CONTRACT", label: "Contract" },
              { value: "INTERN", label: "Intern" },
          ]} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
