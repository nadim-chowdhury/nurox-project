"use client";

import React from "react";
import { Button, Space, Table, Card, message } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar } from "@/components/common/Avatar";
import { StatusTag } from "@/components/common/StatusTag";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface PendingLeave {
  id: string;
  employee: string;
  type: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  appliedOn: string;
}

const mockPending: PendingLeave[] = [
  {
    id: "1",
    employee: "James Wilson",
    type: "Annual",
    from: "2026-05-01",
    to: "2026-05-05",
    days: 5,
    reason: "Personal trip",
    appliedOn: "2026-04-18",
  },
  {
    id: "2",
    employee: "Aisha Rahman",
    type: "Casual",
    from: "2026-04-28",
    to: "2026-04-28",
    days: 1,
    reason: "Personal errand",
    appliedOn: "2026-04-19",
  },
  {
    id: "3",
    employee: "Michael Chen",
    type: "Annual",
    from: "2026-05-10",
    to: "2026-05-15",
    days: 6,
    reason: "Wedding",
    appliedOn: "2026-04-20",
  },
];

export default function LeaveApprovalsPage() {
  const handleAction = (id: string, action: "approve" | "reject") => {
    message.success(
      `Leave request ${action === "approve" ? "approved" : "rejected"}`,
    );
  };

  const columns: ColumnsType<PendingLeave> = [
    {
      title: "Employee",
      key: "employee",
      width: 200,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={r.employee} size={32} />
          <span
            style={{
              color: "var(--color-on-surface)",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {r.employee}
          </span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 90,
      render: (t: string) => <StatusTag status={t.toLowerCase()} label={t} />,
    },
    {
      title: "From",
      dataIndex: "from",
      key: "from",
      width: 130,
      render: (d: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: "To",
      dataIndex: "to",
      key: "to",
      width: 130,
      render: (d: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: "Days",
      dataIndex: "days",
      key: "days",
      width: 70,
      render: (d: number) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-primary)",
            fontWeight: 600,
          }}
        >
          {d}
        </span>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      width: 200,
      render: (r: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {r}
        </span>
      ),
    },
    {
      title: "Applied",
      dataIndex: "appliedOn",
      key: "applied",
      width: 120,
      render: (d: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}
        >
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      align: "right" as const,
      render: (_, r) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => handleAction(r.id, "approve")}
            style={{ background: "#1a6b3a", borderColor: "#1a6b3a" }}
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            onClick={() => handleAction(r.id, "reject")}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Leave Approvals"
        subtitle={`${mockPending.length} requests pending approval`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Leave", href: "/leave" },
          { label: "Approvals" },
        ]}
      />

      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={mockPending}
          rowKey="id"
          pagination={false}
          size="middle"
          style={{ background: "transparent" }}
        />
      </Card>
    </div>
  );
}
