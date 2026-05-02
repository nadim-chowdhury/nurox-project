"use client";

import React, { useState } from "react";
import { Card, Table, Tag, Button, Modal, Form, Input, DatePicker, message, Space } from "antd";
import { PlusOutlined, DeleteOutlined, CalendarOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import dayjs from "dayjs";

export default function HolidaysPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  // Mock data for prototype
  const [holidays, setHolidays] = useState([
    { id: "1", name: "New Year's Day", date: "2025-01-01", isRecurring: true },
    { id: "2", name: "Independence Day", date: "2025-03-26", isRecurring: true },
    { id: "3", name: "Eid-ul-Fitr", date: "2025-03-31", isRecurring: false },
    { id: "4", name: "Pahela Baishakh", date: "2025-04-14", isRecurring: true },
  ]);

  const columns = [
    {
      title: "Holiday Name",
      dataIndex: "name",
      key: "name",
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (v: string) => dayjs(v).format("DD MMM YYYY"),
    },
    {
      title: "Type",
      dataIndex: "isRecurring",
      key: "type",
      render: (v: boolean) => <Tag color={v ? "blue" : "orange"}>{v ? "RECURRING" : "ONE-TIME"}</Tag>,
    },
    {
        title: "Actions",
        key: "actions",
        render: (_: any, r: any) => (
            <Button danger icon={<DeleteOutlined />} size="small" onClick={() => setHolidays(h => h.filter(x => x.id !== r.id))} />
        )
    }
  ];

  const onFinish = (values: any) => {
      const newHoliday = {
          id: Math.random().toString(),
          name: values.name,
          date: values.date.format("YYYY-MM-DD"),
          isRecurring: values.isRecurring
      };
      setHolidays([...holidays, newHoliday]);
      message.success("Holiday added successfully");
      setIsModalOpen(false);
      form.resetFields();
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Public Holidays"
        subtitle="Manage official holidays for attendance calculation"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Attendance", href: "/attendance" },
          { label: "Holidays" },
        ]}
        extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                Add Holiday
            </Button>
        }
      />

      <Card styles={{ body: { padding: 0 } }}>
          <Table columns={columns} dataSource={holidays} rowKey="id" pagination={false} />
      </Card>

      <Modal
        title="Add New Holiday"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
          <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item name="name" label="Holiday Name" rules={[{ required: true }]}>
                  <Input placeholder="e.g. Christmas Day" />
              </Form.Item>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="isRecurring" label="Recurring Every Year" valuePropName="checked">
                  <Input type="checkbox" />
              </Form.Item>
          </Form>
      </Modal>
    </div>
  );
}
