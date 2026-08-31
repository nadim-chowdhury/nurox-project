"use client";
import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Typography,
  Table,
  Button,
  Space,
  message,
  DatePicker,
  Avatar as AntAvatar,
} from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { Avatar } from "@/components/common/Avatar";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function TimesheetsPage() {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for timesheets
    setTimesheets([
      {
        id: "1",
        employee: "Alice Smith",
        role: "Senior Developer",
        week: "May 1 - May 7, 2026",
        totalHours: 42.5,
        billableHours: 40.0,
        status: "SUBMITTED",
      },
      {
        id: "2",
        employee: "Bob Jones",
        role: "UI Designer",
        week: "May 1 - May 7, 2026",
        totalHours: 38.0,
        billableHours: 35.5,
        status: "APPROVED",
      },
    ]);
    setLoading(false);
  }, []);

  const handleApprove = (id: string) => {
    setTimesheets((prev) =>
      prev.map((ts) => (ts.id === id ? { ...ts, status: "APPROVED" } : ts)),
    );
    message.success("Timesheet approved successfully!");
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: "employee",
      key: "employee",
      render: (text: string, record: any) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar name={text} size={32} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text
              className="font-display"
              style={{ color: "var(--color-on-surface)", fontWeight: 500 }}
            >
              {text}
            </Text>
            <Text
              style={{
                color: "var(--color-on-surface-variant)",
                fontSize: "12px",
              }}
            >
              {record.role}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: "Period",
      dataIndex: "week",
      key: "week",
      render: (text: string) => (
        <Text style={{ color: "var(--color-on-surface)" }}>{text}</Text>
      ),
    },
    {
      title: "Total Hours",
      dataIndex: "totalHours",
      key: "totalHours",
      render: (hours: number) => (
        <Text
          className="font-display"
          style={{ color: "var(--color-on-surface)", fontWeight: 600 }}
        >
          {hours.toFixed(1)}h
        </Text>
      ),
    },
    {
      title: "Billable",
      dataIndex: "billableHours",
      key: "billableHours",
      render: (hours: number) => (
        <Text
          className="font-display"
          style={{ color: "var(--color-primary)", fontWeight: 600 }}
        >
          {hours.toFixed(1)}h
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const isApproved = status === "APPROVED";
        return (
          <div
            className={!isApproved ? "animate-pulse-glow" : ""}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "20px",
              background: isApproved
                ? "rgba(109, 213, 140, 0.1)"
                : "rgba(195, 245, 255, 0.1)",
              color: isApproved
                ? "var(--color-success)"
                : "var(--color-primary)",
              fontSize: "12px",
              fontWeight: 600,
              border: `1px solid ${isApproved ? "rgba(109, 213, 140, 0.3)" : "rgba(195, 245, 255, 0.3)"}`,
            }}
          >
            {isApproved ? (
              <CheckCircleOutlined />
            ) : (
              <SyncOutlined spin={false} />
            )}
            {status}
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="primary"
            size="small"
            style={{ borderRadius: "4px" }}
            disabled={record.status === "APPROVED"}
            onClick={() => handleApprove(record.id)}
          >
            Approve
          </Button>
          <Button
            size="small"
            type="text"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Timesheet Approvals"
        subtitle="Review and approve team time logs"
        breadcrumbs={[
          { label: "Projects", href: "/projects" },
          { label: "Timesheets" },
        ]}
        extra={
          <Space>
            <RangePicker
              defaultValue={[dayjs().startOf("week"), dayjs().endOf("week")]}
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--ghost-border)",
              }}
            />
            <Button
              icon={<ExportOutlined />}
              style={{
                background: "var(--color-surface)",
                borderColor: "var(--ghost-border)",
                color: "var(--color-on-surface)",
              }}
            >
              Export
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard title="Pending Approvals" value="12" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Total Hours Logged" value="342.5" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Billable Hours" value="290.0" />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Utilization Rate" value="84%" />
        </Col>
      </Row>

      <div
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid var(--ghost-border)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Table
          columns={columns}
          dataSource={timesheets}
          rowKey="id"
          loading={loading}
          pagination={false}
          className="nurox-table"
        />
      </div>
    </div>
  );
}
