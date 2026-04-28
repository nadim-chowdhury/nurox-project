"use client";

import React, { useState } from "react";
import { Row, Col, Card, Table, Calendar, Badge, Button, Space, message, Tabs } from "antd";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";
import { useGetLeaveRequestsQuery, useGetLeaveBalancesQuery, useApproveLeaveMutation } from "@/store/api/attendanceApi";
import { ApplyLeaveModal } from "@/components/modules/hr/leave/ApplyLeaveModal";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const LEAVE_TYPE_COLORS: Record<string, string> = {
  ANNUAL: "#80d8ff",
  SICK: "#ffb4ab",
  CASUAL: "#ffb347",
  MATERNITY: "#c3f5ff",
  PATERNITY: "#6dd58c",
};

export default function LeavePage() {
  const [activeTab, setActiveTab] = useState("1");
  const { data: requests, isLoading } = useGetLeaveRequestsQuery();
  // Mock current employee ID for prototype
  const currentEmployeeId = "550e8400-e29b-41d4-a716-446655440000"; 
  const { data: balances } = useGetLeaveBalancesQuery(currentEmployeeId);
  const [approveLeave, { isLoading: isApproving }] = useApproveLeaveMutation();

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const pending = requests?.filter((l) => l.status === "PENDING").length || 0;
  const approved = requests?.filter((l) => l.status === "APPROVED").length || 0;

  const handleApprove = async (id: string, status: string) => {
      try {
          await approveLeave({ id, status, approvedBy: currentEmployeeId }).unwrap();
          message.success(`Leave request ${status.toLowerCase()}`);
      } catch (err) {
          message.error("Action failed");
      }
  };

  const columns: ColumnsType<any> = [
    {
      title: "Employee",
      key: "employee",
      width: 200,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={`${r.employee?.firstName} ${r.employee?.lastName}`} size={32} />
          <span style={{ color: "var(--color-on-surface)", fontSize: 13, fontWeight: 500 }}>
            {r.employee?.firstName} {r.employee?.lastName}
          </span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "leaveType",
      key: "type",
      width: 100,
      render: (t: string) => (
        <Badge
          color={LEAVE_TYPE_COLORS[t] || "#9aa5be"}
          text={<span style={{ color: LEAVE_TYPE_COLORS[t] || "#9aa5be", fontSize: 13 }}>{t}</span>}
        />
      ),
    },
    {
      title: "From",
      dataIndex: "startDate",
      key: "from",
      width: 130,
      render: (d: string) => <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>{formatDate(d)}</span>,
    },
    {
      title: "To",
      dataIndex: "endDate",
      key: "to",
      width: 130,
      render: (d: string) => <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>{formatDate(d)}</span>,
    },
    {
      title: "Days",
      dataIndex: "totalDays",
      key: "days",
      width: 70,
      render: (d: number) => (
        <span style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)", fontWeight: 600, fontSize: 14 }}>
          {d}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 110,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, r) => r.status === "PENDING" && (
          <Space>
              <Button size="small" type="primary" onClick={() => handleApprove(r.id, "APPROVED")}>Approve</Button>
              <Button size="small" danger onClick={() => handleApprove(r.id, "REJECTED")}>Reject</Button>
          </Space>
      )
    }
  ];

  const dateCellRender = (value: dayjs.Dayjs) => {
      const _dateStr = value.format("YYYY-MM-DD");
      const dayLeaves = requests?.filter(r => 
          r.status === "APPROVED" && 
          dayjs(r.startDate).startOf('day').isSameOrBefore(value) && 
          dayjs(r.endDate).startOf('day').isSameOrAfter(value)
      );

      return (
          <ul className="events" style={{ listStyle: "none", padding: 0 }}>
              {dayLeaves?.map(item => (
                  <li key={item.id}>
                      <Badge status="success" text={item.employee?.firstName} />
                  </li>
              ))}
          </ul>
      );
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Leave Management"
        subtitle="Manage leave applications and balances"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Leave" },
        ]}
        extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsApplyModalOpen(true)}>
                Apply for Leave
            </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Pending Requests"
            value={`${pending}`}
            prefix={<ClockCircleOutlined style={{ color: "#ffb347" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Approved"
            value={`${approved}`}
            prefix={<CheckCircleOutlined style={{ color: "#6dd58c" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Carry Forward"
            value="5 Days"
            prefix={<CalendarOutlined style={{ color: "#80d8ff" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Rejected"
            value="0"
            prefix={<StopOutlined style={{ color: "#ffb4ab" }} />}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
          <Col span={16}>
              <Card styles={{ body: { padding: 0 } }}>
                  <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    style={{ padding: "0 16px" }}
                    items={[
                        {
                            key: "1",
                            label: "Leave Requests",
                            children: (
                                <Table
                                    columns={columns}
                                    dataSource={requests}
                                    rowKey="id"
                                    loading={isLoading}
                                    pagination={{ pageSize: 8 }}
                                    size="middle"
                                />
                            )
                        },
                        {
                            key: "2",
                            label: "Team Calendar",
                            children: (
                                <div style={{ padding: 16 }}>
                                    <Calendar cellRender={dateCellRender} />
                                </div>
                            )
                        }
                    ]}
                  />
              </Card>
          </Col>
          <Col span={8}>
              <Card title="Leave Balances" bordered={false}>
                  {balances?.map(b => (
                      <div key={b.leaveType} style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <span style={{ fontWeight: 500 }}>{b.leaveType}</span>
                              <span style={{ color: "var(--color-primary)" }}>{b.totalDays - b.usedDays} / {b.totalDays} Days</span>
                          </div>
                          <div style={{ height: 6, background: "var(--color-surface-variant)", borderRadius: 3 }}>
                              <div style={{ 
                                  height: "100%", 
                                  width: `${(b.usedDays / b.totalDays) * 100}%`, 
                                  background: LEAVE_TYPE_COLORS[b.leaveType] || "var(--color-primary)",
                                  borderRadius: 3
                              }} />
                          </div>
                      </div>
                  ))}
                  {(!balances || balances.length === 0) && <div>No balances found for this fiscal year.</div>}
              </Card>
          </Col>
      </Row>

      <ApplyLeaveModal 
        open={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        employeeId={currentEmployeeId}
      />
    </div>
  );
}

