"use client";

import React, { useState } from "react";
import { Table, Tag, Button, Space, Modal } from "antd";
import { PlusOutlined, FileSearchOutlined, SwapOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetRfqComparisonQuery } from "@/store/api/procurementApi";
import { formatCurrency } from "@/lib/utils";

export default function RequisitionsPage() {
  const [selectedRfq, setSelectedRfq] = useState<string | null>(null);
  const { data: comparison, isLoading: loadingComparison } = useGetRfqComparisonQuery(selectedRfq!, {
    skip: !selectedRfq,
  });

  const mockPRs = [
    {
      id: "pr-1",
      prNumber: "PR-2026-001",
      department: "IT",
      requestedBy: "John Doe",
      status: "CONVERTED_TO_RFQ",
      totalEstimatedCost: 5000,
      createdAt: "2026-04-20",
    },
    {
      id: "pr-2",
      prNumber: "PR-2026-002",
      department: "Operations",
      requestedBy: "Jane Smith",
      status: "APPROVED",
      totalEstimatedCost: 1200,
      createdAt: "2026-04-21",
    },
  ];

  const columns = [
    {
      title: "PR Number",
      dataIndex: "prNumber",
      key: "prNumber",
      render: (val: string) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    { title: "Department", dataIndex: "department", key: "dept" },
    { title: "Requested By", dataIndex: "requestedBy", key: "user" },
    {
      title: "Est. Total",
      dataIndex: "totalEstimatedCost",
      key: "cost",
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "CONVERTED_TO_RFQ" ? "blue" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<FileSearchOutlined />} size="small">Details</Button>
          {record.status === "CONVERTED_TO_RFQ" && (
            <Button 
              type="primary" 
              ghost 
              icon={<SwapOutlined />} 
              size="small"
              onClick={() => setSelectedRfq(record.id)}
            >
              Compare Quotes
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Purchase Requisitions"
        subtitle="Manage internal requests and vendor sourcing"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Procurement", href: "/procurement" },
          { label: "Requisitions" },
        ]}
        extra={[
          <Button key="add" type="primary" icon={<PlusOutlined />}>
            New PR
          </Button>,
        ]}
      />

      <Table dataSource={mockPRs} columns={columns} rowKey="id" />

      <Modal
        title="RFQ Auto-Comparison Table"
        open={!!selectedRfq}
        onCancel={() => setSelectedRfq(null)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setSelectedRfq(null)}>Close</Button>,
          <Button key="po" type="primary" icon={<CheckCircleOutlined />}>Convert to PO</Button>
        ]}
      >
        <p>Consolidated view of all vendor responses for this requisition.</p>
        <Table
          loading={loadingComparison}
          dataSource={comparison || []}
          pagination={false}
          columns={[
            { title: "Vendor", dataIndex: "vendorId", key: "v" },
            { title: "Total Amount", dataIndex: "totalAmount", key: "amt", render: (v) => formatCurrency(v) },
            { title: "Currency", dataIndex: "currency", key: "curr" },
            { title: "Lead Time (Avg)", key: "lt", render: () => "5 Days" },
          ]}
        />
      </Modal>
    </div>
  );
}
