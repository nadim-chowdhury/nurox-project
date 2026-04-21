"use client";

import React, { useState } from "react";
import {
  Form,
  Select,
  DatePicker,
  Input,
  Button,
  Card,
  Result,
  message,
} from "antd";
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";

const { RangePicker } = DatePicker;
const { TextArea } = Input;

const labelStyle = { color: "var(--color-on-surface-variant)", fontSize: 13 };

export default function ApplyLeavePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      message.success("Leave request submitted");
    }, 1000);
  };

  if (done) {
    return (
      <div
        className="animate-fade-in-up"
        style={{ maxWidth: 500, margin: "80px auto" }}
      >
        <Result
          status="success"
          title="Leave Request Submitted"
          subTitle="Your manager will be notified for approval."
          extra={[
            <Button
              type="primary"
              key="back"
              onClick={() => router.push("/leave")}
            >
              Back to Leave
            </Button>,
            <Button key="another" onClick={() => setDone(false)}>
              Apply Another
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Apply for Leave"
        subtitle="Submit a new leave request"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Leave", href: "/leave" },
          { label: "Apply" },
        ]}
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/leave")}
          >
            Back
          </Button>
        }
      />

      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          maxWidth: 600,
          margin: "0 auto",
        }}
        styles={{ body: { padding: 32 } }}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          size="large"
        >
          <Form.Item
            name="type"
            label={<span style={labelStyle}>Leave Type</span>}
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select leave type"
              options={[
                { value: "Annual", label: "Annual Leave" },
                { value: "Sick", label: "Sick Leave" },
                { value: "Casual", label: "Casual Leave" },
                { value: "Maternity", label: "Maternity Leave" },
                { value: "Paternity", label: "Paternity Leave" },
                { value: "Unpaid", label: "Unpaid Leave" },
              ]}
            />
          </Form.Item>

          <Form.Item
            name="dates"
            label={<span style={labelStyle}>Date Range</span>}
            rules={[{ required: true }]}
          >
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="reason"
            label={<span style={labelStyle}>Reason</span>}
            rules={[
              {
                required: true,
                min: 10,
                message: "Please provide a detailed reason (min 10 chars)",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Describe the reason for your leave..."
            />
          </Form.Item>

          <Form.Item
            name="handover"
            label={<span style={labelStyle}>Handover Notes</span>}
          >
            <TextArea
              rows={3}
              placeholder="Any tasks to hand over during your absence..."
            />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button onClick={() => router.push("/leave")}>Cancel</Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SendOutlined />}
            >
              Submit Request
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
