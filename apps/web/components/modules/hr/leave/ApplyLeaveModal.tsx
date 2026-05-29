"use client";

import React from "react";
import { Modal, Button, Space, message } from "antd";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaveRequestSchema, type LeaveRequestDto } from "@repo/shared-schemas";
import { useApplyLeaveMutation } from "@/store/api/attendanceApi";
import { RhfSelect } from "@/components/common/forms/RhfSelect";
import { RhfTextArea } from "@/components/common/forms/RhfTextArea";
import { RhfDatePicker } from "@/components/common/forms/RhfDatePicker";
import { Form } from "antd";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
  employeeId: string;
}

export function ApplyLeaveModal({ open, onClose, employeeId }: Props) {
  const [applyLeave, { isLoading }] = useApplyLeaveMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LeaveRequestDto>({
    resolver: zodResolver(leaveRequestSchema) as Resolver<LeaveRequestDto>,
    defaultValues: {
      employeeId,
      leaveType: "ANNUAL" as any,
      startDate: dayjs().toISOString(),
      endDate: dayjs().add(1, "day").toISOString(),
      reason: "",
      status: "PENDING" as any,
    },
  });

  const onSubmit = async (data: LeaveRequestDto) => {
    try {
      await applyLeave(data).unwrap();
      message.success("Leave application submitted successfully");
      reset();
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
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <RhfSelect
          name="leaveType"
          control={control}
          label="Leave Type"
          required
          options={[
            { value: "ANNUAL", label: "Annual Leave" },
            { value: "SICK", label: "Sick Leave" },
            { value: "CASUAL", label: "Casual Leave" },
            { value: "MATERNITY", label: "Maternity Leave" },
            { value: "PATERNITY", label: "Paternity Leave" },
            { value: "UNPAID", label: "Unpaid Leave" },
          ]}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <RhfDatePicker
            name="startDate"
            control={control}
            label="Start Date"
            required
          />
          <RhfDatePicker
            name="endDate"
            control={control}
            label="End Date"
            required
          />
        </div>

        <RhfTextArea
          name="reason"
          control={control}
          label="Reason"
          required
          rows={4}
          placeholder="Briefly explain the reason for leave"
        />

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading || isSubmitting}
            >
              Submit Application
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
}
