"use client";

import React, { useState } from "react";
import { Table, Button, Tag, Space, Card, Modal, Input, message, Typography, Badge } from "antd";
import { 
  useGetPayrollRunsQuery, 
  useCreatePayrollRunMutation, 
  useProcessPayrollRunMutation, 
  useApprovePayrollRunMutation, 
  useFinalizePayrollRunMutation 
} from "@/store/api/payrollApi";
import { PlayCircleOutlined, CheckCircleOutlined, FileTextOutlined, DownloadOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export const PayrollRunManager: React.FC = () => {
  const { data: runs, isLoading } = useGetPayrollRunsQuery();
  const [createRun] = useCreatePayrollRunMutation();
  const [processRun, { isLoading: isProcessing }] = useProcessPayrollRunMutation();
  const [approveRun] = useApprovePayrollRunMutation();
  const [finalizeRun] = useFinalizePayrollRunMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [period, setPeriod] = useState("");

  const handleCreate = async () => {
    try {
      await createRun({ period }).unwrap();
      message.success("Payroll run created!");
      setIsModalOpen(false);
    } catch (err: any) {
      message.error(err.data?.message || "Failed to create run");
    }
  };

  const handleProcess = async (id: string) => {
    try {
      await processRun(id).unwrap();
      message.success("Payroll processed successfully!");
    } catch (err: any) {
      message.error(err.data?.message || "Processing failed");
    }
  };

  const handleExportBeftn = (id: string) => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/payroll/runs/${id}/beftn`, "_blank");
  };

  const statusColors: Record<string, string> = {
    DRAFT: "default",
    REVIEW: "blue",
    APPROVED: "orange",
    PROCESSED: "green",
    CANCELLED: "red",
  };

  const columns = [
    {
      title: "Period",
      dataIndex: "period",
      key: "period",
      render: (text: string) => dayjs(text).format("MMMM YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={statusColors[status]}>{status}</Tag>,
    },
    {
      title: "Gross Pay",
      dataIndex: "totalGross",
      key: "totalGross",
      render: (val: number) => `$${Number(val).toLocaleString()}`,
    },
    {
      title: "Net Pay",
      dataIndex: "totalNet",
      key: "totalNet",
      render: (val: number) => <Text strong>$${Number(val).toLocaleString()}</Text>,
    },
    {
      title: "Employees",
      dataIndex: "employeeCount",
      key: "employeeCount",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          {record.status === "DRAFT" && (
            <Button size="small" icon={<PlayCircleOutlined />} onClick={() => handleProcess(record.id)}>Process</Button>
          )}
          {record.status === "REVIEW" && (
            <Button size="small" type="primary" onClick={() => approveRun(record.id)}>Approve</Button>
          )}
          {record.status === "APPROVED" && (
            <Button size="small" type="primary" color="green" variant="solid" onClick={() => finalizeRun(record.id)}>Finalize & Post</Button>
          )}
          {record.status === "PROCESSED" && (
            <>
              <Button size="small" icon={<DownloadOutlined />} onClick={() => handleExportBeftn(record.id)}>BEFTN</Button>
              <Button size="small" icon={<FileTextOutlined />}>Report</Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Title level={2}>Payroll Management</Title>
          <Text type="secondary">Manage monthly payroll cycles and salary disbursements.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)} size="large">
          New Payroll Run
        </Button>
      </div>

      <Card className="shadow-sm">
        <Table 
          dataSource={runs} 
          columns={columns} 
          loading={isLoading || isProcessing} 
          rowKey="id"
          pagination={{ pageSize: 12 }}
        />
      </Card>

      <Modal
        title="Create New Payroll Run"
        open={isModalOpen}
        onOk={handleCreate}
        onCancel={() => setIsModalOpen(false)}
      >
        <div className="py-4">
          <Text>Enter period (YYYY-MM):</Text>
          <Input 
            placeholder="e.g. 2026-04" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)} 
            className="mt-2"
          />
        </div>
      </Modal>
    </div>
  );
};
