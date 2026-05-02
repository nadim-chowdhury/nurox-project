"use client";

import React, { useState } from "react";
import {
  Card,
  Tabs,
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  DatePicker,
  Tag,
  Tooltip,
  message,
  Row,
  Col,
} from "antd";
import {
  CalendarOutlined,
  GlobalOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useGetCalendarsQuery,
  useCreateCalendarMutation,
  useUpdateCalendarMutation,
  useDeleteCalendarMutation,
  useGetHolidaysQuery,
  useCreateHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
  useGetBranchesQuery,
} from "@/store/api/systemApi";
import dayjs from "dayjs";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function CalendarManagementPage() {
  const { data: calendars, isLoading: loadingCalendars } = useGetCalendarsQuery();
  const { data: holidays, isLoading: loadingHolidays } = useGetHolidaysQuery();
  const { data: branches } = useGetBranchesQuery();

  const [createCalendar] = useCreateCalendarMutation();
  const [updateCalendar] = useUpdateCalendarMutation();
  const [deleteCalendar] = useDeleteCalendarMutation();

  const [createHoliday] = useCreateHolidayMutation();
  const [updateHoliday] = useUpdateHolidayMutation();
  const [deleteHoliday] = useDeleteHolidayMutation();

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [editingCalendar, setEditingCalendar] = useState<any>(null);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [calendarForm] = Form.useForm();
  const [holidayForm] = Form.useForm();

  const handleSaveCalendar = async (values: any) => {
    try {
      if (editingCalendar) {
        await updateCalendar({ id: editingCalendar.id, data: values }).unwrap();
        message.success("Calendar updated");
      } else {
        await createCalendar(values).unwrap();
        message.success("Calendar created");
      }
      setIsCalendarModalOpen(false);
    } catch {
      message.error("Failed to save calendar");
    }
  };

  const handleSaveHoliday = async (values: any) => {
    try {
      const data = { ...values, date: values.date.format("YYYY-MM-DD") };
      if (editingHoliday) {
        await updateHoliday({ id: editingHoliday.id, data }).unwrap();
        message.success("Holiday updated");
      } else {
        await createHoliday(data).unwrap();
        message.success("Holiday created");
      }
      setIsHolidayModalOpen(false);
    } catch {
      message.error("Failed to save holiday");
    }
  };

  const calendarColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (val: string, record: any) => (
        <Space>
          <span style={{ fontWeight: 500 }}>{val}</span>
          {record.isDefault && <Tag color="blue">Default</Tag>}
        </Space>
      ),
    },
    {
      title: "Branch",
      dataIndex: ["branch", "name"],
      key: "branch",
      render: (val: string) => val || "All Branches",
    },
    {
      title: "Working Days",
      dataIndex: "workingDays",
      key: "workingDays",
      render: (days: string[]) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {days.map(d => <Tag key={d} style={{ fontSize: 11 }}>{d.substring(0, 3)}</Tag>)}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingCalendar(record);
              calendarForm.setFieldsValue({
                ...record,
                workingDays: record.workingDays || [],
              });
              setIsCalendarModalOpen(true);
            }}
          />
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteCalendar(record.id)}
          />
        </Space>
      ),
    },
  ];

  const holidayColumns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (val: string) => dayjs(val).format("MMM D, YYYY"),
      sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Holiday Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Branch Scope",
      dataIndex: ["branch", "name"],
      key: "branch",
      render: (val: string) => val || "Global",
    },
    {
      title: "Recurring",
      dataIndex: "isRecurring",
      key: "isRecurring",
      render: (val: boolean) => (val ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right" as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingHoliday(record);
              holidayForm.setFieldsValue({
                ...record,
                date: dayjs(record.date),
              });
              setIsHolidayModalOpen(true);
            }}
          />
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteHoliday(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Calendar & Holidays"
        subtitle="Configure working days and public holidays"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Calendar" },
        ]}
      />

      <Tabs
        defaultActiveKey="holidays"
        items={[
          {
            key: "holidays",
            label: (
              <span>
                <CalendarOutlined /> Public Holidays
              </span>
            ),
            children: (
              <Card
                title="Holiday Calendar 2026"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingHoliday(null);
                      holidayForm.resetFields();
                      setIsHolidayModalOpen(true);
                    }}
                  >
                    Add Holiday
                  </Button>
                }
              >
                <Table
                  dataSource={holidays}
                  columns={holidayColumns}
                  loading={loadingHolidays}
                  rowKey="id"
                />
              </Card>
            ),
          },
          {
            key: "working-days",
            label: (
              <span>
                <ClockCircleOutlined /> Working Calendars
              </span>
            ),
            children: (
              <Card
                title="Work Schedules"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingCalendar(null);
                      calendarForm.resetFields();
                      setIsCalendarModalOpen(true);
                    }}
                  >
                    Add Calendar
                  </Button>
                }
              >
                <Table
                  dataSource={calendars}
                  columns={calendarColumns}
                  loading={loadingCalendars}
                  rowKey="id"
                />
              </Card>
            ),
          },
        ]}
      />

      {/* Calendar Modal */}
      <Modal
        title={editingCalendar ? "Edit Schedule" : "Add Schedule"}
        open={isCalendarModalOpen}
        onCancel={() => setIsCalendarModalOpen(false)}
        onOk={() => calendarForm.submit()}
      >
        <Form
          form={calendarForm}
          layout="vertical"
          onFinish={handleSaveCalendar}
        >
          <Form.Item name="name" label="Schedule Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Standard 5-Day Week" />
          </Form.Item>
          <Form.Item name="branchId" label="Assign to Branch (Optional)">
            <Select
              allowClear
              placeholder="All Branches"
              options={branches?.map((b) => ({ label: b.name, value: b.id }))}
            />
          </Form.Item>
          <Form.Item name="workingDays" label="Working Days">
            <Checkbox.Group options={DAYS_OF_WEEK.map(d => d.toLowerCase())} />
          </Form.Item>
          <Form.Item name="isDefault" valuePropName="checked">
            <Checkbox>Set as default for new employees</Checkbox>
          </Form.Item>
        </Form>
      </Modal>

      {/* Holiday Modal */}
      <Modal
        title={editingHoliday ? "Edit Holiday" : "Add Holiday"}
        open={isHolidayModalOpen}
        onCancel={() => setIsHolidayModalOpen(false)}
        onOk={() => holidayForm.submit()}
      >
        <Form form={holidayForm} layout="vertical" onFinish={handleSaveHoliday}>
          <Form.Item name="name" label="Holiday Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Independence Day" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="branchId" label="Branch Scope">
                <Select
                  allowClear
                  placeholder="Global"
                  options={branches?.map((b) => ({ label: b.name, value: b.id }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="isRecurring" valuePropName="checked">
            <Checkbox>Recurring every year</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
