"use client";

import React from "react";
import { Modal, Button, Space, message, Form } from "antd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSalarySchema, type UpdateSalaryDto } from "@repo/shared-schemas";
import { useUpdateSalaryMutation } from "@/store/api/hrApi";
import { RhfInputNumber } from "@/components/common/forms/RhfInputNumber";
import { RhfSelect } from "@/components/common/forms/RhfSelect";
import { RhfTextArea } from "@/components/common/forms/RhfTextArea";

interface Props {
  employee: any;
  open: boolean;
  onClose: () => void;
}

const salaryReasons = [
  { value: "ANNUAL_INCREMENT", label: "Annual Increment" },
  { value: "PROMOTION", label: "Promotion" },
  { value: "MARKET_ADJUSTMENT", label: "Market Adjustment" },
  { value: "CORRECTION", label: "Correction" },
  { value: "OTHER", label: "Other" },
];

export const UpdateSalaryModal: React.FC<Props> = ({
  employee,
  open,
  onClose,
}) => {
  const [updateSalary, { isLoading }] = useUpdateSalaryMutation();

  const { control, handleSubmit, reset } = useForm<UpdateSalaryDto>({
    resolver: zodResolver(updateSalarySchema),
    defaultValues: {
      newSalary: employee?.salary || 0,
      reason: "ANNUAL_INCREMENT",
      comments: "",
    },
  });

  const onFinish = async (values: UpdateSalaryDto) => {
    try {
      await updateSalary({
        id: employee.id,
        ...values,
      }).unwrap();
      message.success("Salary updated successfully");
      reset();
      onClose();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to update salary");
    }
  };

  return (
    <Modal
      title="Salary Revision"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form layout="vertical" onFinish={handleSubmit(onFinish)}>
        <RhfInputNumber
          name="newSalary"
          control={control}
          label="New Monthly Salary"
          required
          min={0}
          prefix="$"
        />
        <RhfSelect
          name="reason"
          control={control}
          label="Reason for Change"
          required
          options={salaryReasons}
        />
        <RhfTextArea
          name="comments"
          control={control}
          label="Comments"
          rows={3}
          placeholder="Rationale for revision..."
        />

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Update Salary
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};
