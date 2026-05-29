"use client";

import React from "react";
import { Modal, Button, Space, message, Form } from "antd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transferEmployeeSchema,
  type TransferEmployeeDto,
} from "@repo/shared-schemas";
import {
  useTransferEmployeeMutation,
  useGetDepartmentsQuery,
  useGetDesignationsQuery,
} from "@/store/api/hrApi";
import { RhfSelect } from "@/components/common/forms/RhfSelect";
import { RhfDatePicker } from "@/components/common/forms/RhfDatePicker";
import { RhfTextArea } from "@/components/common/forms/RhfTextArea";
import dayjs from "dayjs";

interface Props {
  employee: any;
  open: boolean;
  onClose: () => void;
}

export const TransferEmployeeModal: React.FC<Props> = ({
  employee,
  open,
  onClose,
}) => {
  const [transfer, { isLoading }] = useTransferEmployeeMutation();
  const { data: departments } = useGetDepartmentsQuery();
  const { data: designations } = useGetDesignationsQuery();

  const { control, handleSubmit, reset } = useForm<TransferEmployeeDto>({
    resolver: zodResolver(transferEmployeeSchema),
    defaultValues: {
      departmentId: employee?.department?.id || "",
      designationId: employee?.designation?.id || "",
      effectiveDate: dayjs().toISOString(),
      comments: "",
    },
  });

  const onFinish = async (data: TransferEmployeeDto) => {
    try {
      await transfer({
        id: employee.id,
        data,
      }).unwrap();
      message.success("Employee transferred successfully");
      reset();
      onClose();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to transfer employee");
    }
  };

  return (
    <Modal
      title="Transfer / Promote Employee"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form layout="vertical" onFinish={handleSubmit(onFinish)}>
        <RhfSelect
          name="departmentId"
          control={control}
          label="New Department"
          required
          options={departments?.map((d) => ({ value: d.id, label: d.name }))}
        />
        <RhfSelect
          name="designationId"
          control={control}
          label="New Designation"
          required
          options={designations?.map((d) => ({ value: d.id, label: d.name }))}
        />
        <RhfDatePicker
          name="effectiveDate"
          control={control}
          label="Effective Date"
          required
        />
        <RhfTextArea
          name="comments"
          control={control}
          label="Comments"
          rows={3}
        />

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Transfer Employee
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};
