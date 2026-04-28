"use client";

import React, { useState } from "react";
import { Card, Tag, Button, Space, message, Input } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnsType } from "antd/es/table";
import { useGetPayslipsByRunQuery, useLazyGetPayslipDownloadUrlQuery } from "@/store/api/payrollApi";

export default function PayslipsPage() {
  const [selectedRun, setSelectedRun] = useState<string>("");
  const { data: payslips, isLoading } = useGetPayslipsByRunQuery(selectedRun, { skip: !selectedRun });
  const [getDownloadUrl] = useLazyGetPayslipDownloadUrlQuery();

  const handleDownload = async (id: string) => {
    try {
      const response = await getDownloadUrl(id).unwrap();
      window.open(response.url, "_blank");
    } catch (_err) {
      message.error("Failed to get download URL");
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "Employee",
      dataIndex: ["employee", "firstName"],
      render: (_: any, record: any) => (
        <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
          {record.employee.firstName} {record.employee.lastName}
        </span>
      ),
    },
    {
      title: "Gross Pay",
      dataIndex: "grossPay",
      align: "right" as const,
      render: (v: number) => (
        <span className="font-display" style={{ color: "var(--color-on-surface)" }}>
          ${Number(v).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Net Pay",
      dataIndex: "netPay",
      sorter: (a, b) => a.netPay - b.netPay,
      align: "right" as const,
      render: (v: number) => (
        <span className="font-display" style={{ color: "var(--color-success)" }}>
          ${Number(v).toLocaleString()}
        </span>
      ),
    },
    {
      title: "Status",
      render: (record: any) => (
          <Tag color={record.isPublished ? "success" : "warning"}>
              {record.isPublished ? "PUBLISHED" : "DRAFT"}
          </Tag>
      )
    },
    {
        title: "Actions",
        key: "actions",
        render: (record: any) => (
            <Space>
                <Button 
                    size="small" 
                    icon={<DownloadOutlined />} 
                    onClick={() => handleDownload(record.id)}
                    disabled={!record.pdfUrl}
                >
                    Download
                </Button>
            </Space>
        )
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Payslips"
        subtitle="View and manage employee payslips"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Payroll", href: "/payroll" },
          { label: "Payslips" },
        ]}
      />
      
      <div style={{ marginBottom: 16 }}>
          <Input 
            placeholder="Enter Payroll Run ID (e.g. uuid)" 
            value={selectedRun} 
            onChange={(e) => setSelectedRun(e.target.value)} 
            style={{ width: 400 }}
          />
      </div>

      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<any>
          columns={columns}
          dataSource={payslips}
          rowKey="id"
          loading={isLoading}
        />
      </Card>
    </div>
  );
}
