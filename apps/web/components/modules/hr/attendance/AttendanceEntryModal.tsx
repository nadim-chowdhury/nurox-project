"use client";

import React from "react";
import { Modal, Form, Select, DatePicker, TimePicker, Button, Space, message } from "antd";
import { useGetEmployeesQuery } from "@/store/api/hrApi";
import { useCheckInMutation, useCheckOutMutation } from "@/store/api/attendanceApi";
import dayjs from "dayjs";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AttendanceEntryModal({ open, onClose }: Props) {
  const [form] = Form.useForm();
  const { data: employees } = useGetEmployeesQuery({});
  const [checkIn, { isLoading: isCheckInLoading }] = useCheckInMutation();
  const [checkOut, { isLoading: isCheckOutLoading }] = useCheckOutMutation();

  const onFinish = async (values: any) => {
    const { employeeId, type, date, time } = values;
    const dateTime = dayjs(date).hour(time.hour()).minute(time.minute()).second(0).toISOString();

    try {
      if (type === "IN") {
        await checkIn({ 
            employeeId, 
            method: "MANUAL", 
            location: { lat: 0, lng: 0, address: "Manual Entry" },
            timestamp: dateTime
        }).unwrap();
      } else {
        await checkOut({ 
            employeeId, 
            method: "MANUAL",
            timestamp: dateTime
        }).unwrap();
      }
      message.success("Attendance recorded successfully");
      form.resetFields();
      onClose();
    } catch (err) {
      message.error("Failed to record attendance");
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
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="employeeId" label="Employee" rules={[{ required: true }]}>
          <Select
            showSearch
            placeholder="Select employee"
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={employees?.data.map((e) => ({
              value: e.id,
              label: `${e.firstName} ${e.lastName}`,
            }))}
          />
        </Form.Item>

        <Form.Item name="type" label="Entry Type" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "IN", label: "Check In" },
              { value: "OUT", label: "Check Out" },
            ]}
          />
        </Form.Item>

        <Space>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker />
          </Form.Item>
          <Form.Item name="time" label="Time" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" />
          </Form.Item>
        </Space>

        <Form.Item style={{ marginTop: 24, marginBottom: 0, textAlign: "right" }}>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={isCheckInLoading || isCheckOutLoading}>
              Save Entry
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
