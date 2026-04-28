"use client";

import React, { useState } from "react";
import { Table, Tag, Button, Space, Modal, Form, Select, Input } from "antd";
import { PlusOutlined, CheckCircleOutlined, AuditOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetWarehousesQuery } from "@/store/api/inventoryApi";

export default function StockAuditsPage() {
  const { data: warehouses } = useGetWarehousesQuery();
  const [isStartModalVisible, setIsStartModalVisible] = useState(false);
  const [form] = Form.useForm();

  const mockAudits = [
    {
      id: "sc-1",
      warehouse: "Main Warehouse",
      status: "IN_PROGRESS",
      startedAt: "2026-04-22 09:00",
      notes: "Annual full count",
    },
    {
      id: "sc-2",
      warehouse: "Electronics Zone",
      status: "COMPLETED",
      startedAt: "2026-04-15 10:00",
      completedAt: "2026-04-15 16:00",
      notes: "Monthly spot check",
    }
  ];

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Warehouse", dataIndex: "warehouse", key: "wh" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "COMPLETED" ? "green" : "blue"}>{status}</Tag>
      ),
    },
    { title: "Started At", dataIndex: "startedAt", key: "start" },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          {record.status === "IN_PROGRESS" ? (
            <Button icon={<CheckCircleOutlined />} type="primary" size="small">Complete Count</Button>
          ) : (
            <Button icon={<AuditOutlined />} size="small">View Report</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Stock Audits"
        subtitle="Physical stock count and adjustment workflow"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Inventory", href: "/inventory" },
          { label: "Stock Audits" },
        ]}
        extra={[
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsStartModalVisible(true)}
          >
            Start New Count
          </Button>,
        ]}
      />

      <Table dataSource={mockAudits} columns={columns} rowKey="id" />

      <Modal
        title="Start Physical Stock Count"
        open={isStartModalVisible}
        onCancel={() => setIsStartModalVisible(false)}
        okText="Initialize Count"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="warehouseId" label="Select Warehouse" rules={[{ required: true }]}>
            <Select options={warehouses?.map(w => ({ label: w.name, value: w.id }))} />
          </Form.Item>
          <Form.Item name="notes" label="Audit Notes">
            <Input.TextArea rows={3} placeholder="e.g. End of Q1 Audit" />
          </Form.Item>
          <p style={{ color: "gray", fontSize: 12 }}>
            This will freeze expectations for the current stock level. Discrepancies found during count will generate auto-adjustments.
          </p>
        </Form>
      </Modal>
    </div>
  );
}
