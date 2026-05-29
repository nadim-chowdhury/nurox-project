"use client";

import React from "react";
import { Modal, Button, Space, message, Form } from "antd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  manualAttendanceSchema,
  type ManualAttendanceDto,
} from "@repo/shared-schemas";
import { useGetEmployeesQuery } from "@/store/api/hrApi";
import {
  useCheckInMutation,
  useCheckOutMutation,
} from "@/store/api/attendanceApi";
import { RhfSelect } from "@/components/common/forms/RhfSelect";
import { RhfDatePicker } from "@/components/common/forms/RhfDatePicker";
import { RhfTimePicker } from "@/components/common/forms/RhfTimePicker";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AttendanceEntryModal({ open, onClose }: Props) {
  const { data: employees } = useGetEmployeesQuery({});
  const [checkIn, { isLoading: isCheckInLoading }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckOutLoading }] = useCheckOutMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ManualAttendanceDto>({
    resolver: zodResolver(manualAttendanceSchema),
    defaultValues: {
      type: "IN",
      date: dayjs().toISOString(),
      time: dayjs().toISOString(),
    },
  });

  const onSubmit = async (values: ManualAttendanceDto) => {
    const { employeeId, type, date, time } = values;

    // Construct valid ISO timestamp
    const baseDate = dayjs(date);
    const baseTime = dayjs(time);
    const dateTime = baseDate
      .hour(baseTime.hour())
      .minute(baseTime.minute())
      .second(0)
      .toISOString();

    try {
      if (type === "IN") {
        await checkIn({
          employeeId,
          method: "MANUAL",
          location: { lat: 0, lng: 0, address: "Manual Entry" },
          timestamp: dateTime,
        }).unwrap();
      } else {
        await checkOut({
          employeeId,
          method: "MANUAL",
          timestamp: dateTime,
        }).unwrap();
      }
      message.success("Attendance recorded successfully");
      reset();
      onClose();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to record attendance");
    }
  };

  return (
    <Modal
      title="Manual Attendance Entry"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
        <RhfSelect
          name="employeeId"
          control={control}
          label="Employee"
          required
          showSearch
          placeholder="Select employee"
          optionFilterProp="children"
          options={employees?.data.map((e) => ({
            value: e.id,
            label: `${e.firstName} ${e.lastName}`,
          }))}
        />

        <RhfSelect
          name="type"
          control={control}
          label="Entry Type"
          required
          options={[
            { value: "IN", label: "Check In" },
            { value: "OUT", label: "Check Out" },
          ]}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <RhfDatePicker name="date" control={control} label="Date" required />
          <RhfTimePicker
            name="time"
            control={control}
            label="Time"
            required
            format="HH:mm"
          />
        </div>

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCheckInLoading || isCheckOutLoading || isSubmitting}
            >
              Save Entry
            </Button>
          </Space>
        </div>
      </Form>
    </Modal>
  );
}
