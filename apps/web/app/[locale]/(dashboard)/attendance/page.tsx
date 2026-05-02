"use client";

import React, { useState } from "react";
import { Row, Col, Card, Table, Tag, Button, Space, message, DatePicker, Modal } from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
  PlusOutlined,
  UploadOutlined,
  FileExcelOutlined,
  EnvironmentOutlined,
  QrcodeOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";
import { useGetTeamAttendanceQuery, useCheckInMutation } from "@/store/api/attendanceApi";
import { AttendanceEntryModal } from "@/components/modules/hr/attendance/AttendanceEntryModal";
import { BulkImportModal } from "@/components/modules/hr/attendance/BulkImportModal";
import { QRKiosk } from "@/components/modules/hr/attendance/QRKiosk";
import { QRCheckIn } from "@/components/modules/hr/attendance/QRCheckIn";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

const columns: ColumnsType<any> = [
  {
    title: "Employee",
    key: "employee",
    width: 220,
    render: (_, r) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={`${r.employee?.firstName} ${r.employee?.lastName}`} size={32} />
        <div>
          <div style={{ color: "var(--color-on-surface)", fontSize: 13, fontWeight: 500 }}>
            {r.employee?.firstName} {r.employee?.lastName}
          </div>
          <div style={{ color: "var(--color-on-surface-variant)", fontSize: 11 }}>
            {r.employee?.department?.name}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
    width: 130,
    render: (d: string) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {formatDate(d)}
      </span>
    ),
  },
  {
    title: "Check In",
    dataIndex: "checkIn",
    key: "checkIn",
    width: 110,
    render: (v: string) => (
      <span style={{ color: v ? "#6dd58c" : "var(--color-on-surface-variant)", fontSize: 13, fontWeight: 500 }}>
        {v ? dayjs(v).format("hh:mm A") : "—"}
      </span>
    ),
  },
  {
    title: "Check Out",
    dataIndex: "checkOut",
    key: "checkOut",
    width: 110,
    render: (v: string) => (
      <span style={{ color: v ? "#c3f5ff" : "var(--color-on-surface-variant)", fontSize: 13, fontWeight: 500 }}>
        {v ? dayjs(v).format("hh:mm A") : "—"}
      </span>
    ),
  },
  {
    title: "Method",
    dataIndex: "method",
    key: "method",
    width: 100,
    render: (m: string) => <Tag>{m}</Tag>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 120,
    render: (s: string) => <StatusTag status={s?.toLowerCase()} />,
  },
  {
      title: "Overtime",
      key: "overtime",
      width: 100,
      render: (_, r) => r.isOvertime ? <Tag color="orange">{r.overtimeMinutes}m</Tag> : "—",
  }
];

export default function AttendancePage() {
  const router = useRouter();
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const { data: records, isLoading } = useGetTeamAttendanceQuery({ date });
  const [checkIn, { isLoading: isGeoLoading }] = useCheckInMutation();

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const present = records?.filter((r) => r.status === "PRESENT").length || 0;
  const late = records?.filter((r) => r.status === "LATE").length || 0;
  const overtime = records?.filter((r) => r.isOvertime).length || 0;

  const handleGeoCheckIn = () => {
      if (!navigator.geolocation) {
          return message.error("Geolocation is not supported by your browser");
      }

      navigator.geolocation.getCurrentPosition(async (pos) => {
          try {
              // In a real app, employeeId would come from auth context
              const employeeId = "current-user-id"; 
              await checkIn({
                  employeeId,
                  method: "GEO_FENCED",
                  location: {
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                      address: "Current Location"
                  }
              }).unwrap();
              message.success("Geo-fenced check-in successful");
          } catch (err: any) {
              message.error(err.data?.message || "Geo-fenced check-in failed");
          }
      });
  };

  const handleExport = async () => {
      const month = dayjs().month() + 1;
      const year = dayjs().year();
      window.open(`/api/attendance/report?month=${month}&year=${year}`, '_blank');
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Attendance"
        subtitle="Real-time attendance tracking & reports"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Attendance" },
        ]}
        extra={
            <Space wrap>
                <Button icon={<QrcodeOutlined />} onClick={() => setIsQrOpen(true)}>
                    My QR
                </Button>
                <Button icon={<EnvironmentOutlined />} onClick={handleGeoCheckIn} loading={isGeoLoading}>
                    Geo Check-In
                </Button>
                <Button icon={<PlusOutlined />} onClick={() => setIsEntryModalOpen(true)}>
                    Manual Entry
                </Button>
                <Button icon={<UploadOutlined />} onClick={() => setIsBulkModalOpen(true)}>
                    Bulk Import
                </Button>
                <Button icon={<CalendarOutlined />} onClick={() => router.push("/attendance/holidays")}>
                    Holidays
                </Button>
                <Button type="primary" icon={<FileExcelOutlined />} onClick={handleExport}>
                    Monthly Report
                </Button>
            </Space>
        }
      />

      <Card 
        style={{ marginBottom: 24, background: 'rgba(195, 245, 255, 0.05)', border: '1px dashed var(--color-primary)' }}
        styles={{ body: { padding: 12 } }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <QrcodeOutlined style={{ fontSize: 24, color: 'var(--color-primary)' }} />
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>Attendance Kiosk Mode</div>
                    <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>Enable tablet-friendly scanning at office entrance</div>
                </div>
            </div>
            <Button type="primary" onClick={() => setIsKioskOpen(true)}>Launch Kiosk</Button>
        </div>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Present Today"
            value={`${present}`}
            prefix={<CheckCircleOutlined style={{ color: "#6dd58c" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Late"
            value={`${late}`}
            prefix={<ClockCircleOutlined style={{ color: "#ffb347" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Overtime"
            value={`${overtime}`}
            prefix={<WarningOutlined style={{ color: "#ffb4ab" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Active Shifts"
            value="3"
            prefix={<CalendarOutlined style={{ color: "#80d8ff" }} />}
          />
        </Col>
      </Row>

      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
        }}
        styles={{ body: { padding: 0 } }}
      >
          <div style={{ padding: 16, borderBottom: "1px solid var(--ghost-border)" }}>
              <Space>
                  <span style={{ color: "var(--color-on-surface-variant)" }}>Viewing attendance for:</span>
                  <DatePicker defaultValue={dayjs()} onChange={(d) => setDate(d?.format("YYYY-MM-DD") || "")} />
              </Space>
          </div>
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          size="middle"
          style={{ background: "transparent" }}
        />
      </Card>

      <AttendanceEntryModal open={isEntryModalOpen} onClose={() => setIsEntryModalOpen(false)} />
      <BulkImportModal open={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} />
      <QRKiosk open={isKioskOpen} onClose={() => setIsKioskOpen(false)} />
      <Modal 
        title="My Check-In QR" 
        open={isQrOpen} 
        onCancel={() => setIsQrOpen(false)} 
        footer={null}
        width={350}
      >
        <QRCheckIn />
      </Modal>
    </div>
  );
}
