"use client";

import React from "react";
import { Card, Table, Progress } from "antd";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar } from "@/components/common/Avatar";
import type { ColumnsType } from "antd/es/table";

interface LeaveBalance {
  id: string;
  employee: string;
  annual: { total: number; used: number };
  sick: { total: number; used: number };
  casual: { total: number; used: number };
}

const mockBalances: LeaveBalance[] = [
  {
    id: "1",
    employee: "Sarah Ahmed",
    annual: { total: 20, used: 8 },
    sick: { total: 10, used: 2 },
    casual: { total: 5, used: 1 },
  },
  {
    id: "2",
    employee: "James Wilson",
    annual: { total: 20, used: 12 },
    sick: { total: 10, used: 5 },
    casual: { total: 5, used: 3 },
  },
  {
    id: "3",
    employee: "Fatima Khan",
    annual: { total: 20, used: 3 },
    sick: { total: 10, used: 0 },
    casual: { total: 5, used: 2 },
  },
  {
    id: "4",
    employee: "Michael Chen",
    annual: { total: 20, used: 15 },
    sick: { total: 10, used: 1 },
    casual: { total: 5, used: 5 },
  },
  {
    id: "5",
    employee: "Priya Sharma",
    annual: { total: 15, used: 10 },
    sick: { total: 10, used: 3 },
    casual: { total: 5, used: 2 },
  },
  {
    id: "6",
    employee: "David Miller",
    annual: { total: 20, used: 0 },
    sick: { total: 10, used: 0 },
    casual: { total: 5, used: 0 },
  },
];

function BalanceCell({ total, used }: { total: number; used: number }) {
  const remaining = total - used;
  const pct = Math.round((used / total) * 100);
  const color = pct >= 80 ? "#ffb4ab" : pct >= 50 ? "#ffb347" : "#6dd58c";

  return (
    <div style={{ minWidth: 100 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <span
          style={{
            color: "var(--color-on-surface)",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-display)",
          }}
        >
          {remaining}
        </span>
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 11 }}
        >
          / {total}
        </span>
      </div>
      <Progress
        percent={pct}
        size="small"
        strokeColor={color}
        showInfo={false}
      />
    </div>
  );
}

const columns: ColumnsType<LeaveBalance> = [
  {
    title: "Employee",
    key: "employee",
    width: 220,
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
    title: "Annual Leave",
    key: "annual",
    width: 160,
    render: (_, r) => (
      <BalanceCell total={r.annual.total} used={r.annual.used} />
    ),
  },
  {
    title: "Sick Leave",
    key: "sick",
    width: 160,
    render: (_, r) => <BalanceCell total={r.sick.total} used={r.sick.used} />,
  },
  {
    title: "Casual Leave",
    key: "casual",
    width: 160,
    render: (_, r) => (
      <BalanceCell total={r.casual.total} used={r.casual.used} />
    ),
  },
  {
    title: "Total Remaining",
    key: "totalRemaining",
    width: 130,
    sorter: (a, b) => {
      const aR =
        a.annual.total -
        a.annual.used +
        (a.sick.total - a.sick.used) +
        (a.casual.total - a.casual.used);
      const bR =
        b.annual.total -
        b.annual.used +
        (b.sick.total - b.sick.used) +
        (b.casual.total - b.casual.used);
      return aR - bR;
    },
    render: (_, r) => {
      const remaining =
        r.annual.total -
        r.annual.used +
        (r.sick.total - r.sick.used) +
        (r.casual.total - r.casual.used);
      return (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-primary)",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {remaining} days
        </span>
      );
    },
  },
];

export default function LeaveBalancesPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Leave Balances"
        subtitle="Remaining leave days per employee"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Leave", href: "/leave" },
          { label: "Balances" },
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
          dataSource={mockBalances}
          rowKey="id"
          pagination={false}
          size="middle"
          style={{ background: "transparent" }}
        />
      </Card>
    </div>
  );
}
