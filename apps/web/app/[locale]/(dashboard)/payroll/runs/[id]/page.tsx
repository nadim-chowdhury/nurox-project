"use client";

import React from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Row,
  Col,
  Steps,
  Spin,
  Tabs,
  Tag,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckOutlined,
  PlayCircleOutlined,
  FileDoneOutlined,
  DownloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  useGetPayrollRunQuery, 
  useGetPayslipsByRunQuery,
  useGetPayrollSummaryQuery,
  useGetPayrollComparisonQuery,
  useProcessPayrollRunMutation,
  useApprovePayrollRunMutation,
  useFinalizePayrollRunMutation,
  usePublishPayslipsMutation
} from "@/store/api/payrollApi";
import type { ColumnsType } from "antd/es/table";

const columns: ColumnsType<any> = [
  {
    title: "Employee",
    key: "employee",
    width: 250,
    render: (_, r) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={`${r.employee.firstName} ${r.employee.lastName}`} size={32} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ color: "var(--color-on-surface)", fontSize: 13, fontWeight: 500 }}>
            {r.employee.firstName} {r.employee.lastName}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)' }}>{r.employee.employeeId}</span>
        </div>
      </div>
    ),
  },
  {
    title: "Gross Pay",
    dataIndex: "grossPay",
    key: "gross",
    width: 120,
    render: (v: number) => (
      <span style={{ color: "var(--color-on-surface)", fontSize: 13 }}>
        {formatCurrency(v)}
      </span>
    ),
  },
  {
    title: "Deductions",
    dataIndex: "totalDeductions",
    key: "deductions",
    width: 120,
    render: (v: number) => (
      <span style={{ color: "#ffb4ab", fontSize: 13 }}>
        -{formatCurrency(v)}
      </span>
    ),
  },
  {
    title: "Net Pay",
    dataIndex: "netPay",
    key: "netPay",
    width: 120,
    render: (v: number, r) => (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontFamily: "var(--font-display)", color: "var(--color-primary)", fontWeight: 700, fontSize: 14 }}>
          {formatCurrency(v)}
        </span>
        {r.payoutCurrency !== 'USD' && (
          <span style={{ fontSize: 10, color: 'var(--color-on-surface-variant)' }}>
            ≈ {r.payoutCurrency} {(v * r.exchangeRate).toFixed(2)}
          </span>
        )}
      </div>
    ),
  },
  {
    title: "PF (Employer)",
    dataIndex: "employerPfContribution",
    key: "pf",
    width: 120,
    render: (v: number) => formatCurrency(v),
  },
  {
    title: "Items",
    dataIndex: "items",
    key: "items",
    render: (items: any[]) => (
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {items.map((it, idx) => (
          <Tag key={idx} style={{ fontSize: 10 }}>{it.name}</Tag>
        ))}
      </div>
    )
  }
];

export default function PayrollRunDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: runData, isLoading: isRunLoading } = useGetPayrollRunQuery(id);
  const run = runData as any;
  const { data: payslips, isLoading: isPayslipsLoading } = useGetPayslipsByRunQuery(id);
  const { data: summary, isLoading: isSummaryLoading } = useGetPayrollSummaryQuery(id);
  
  // Previous run comparison (hardcoded ID for demo, in real app would be from a list)
  const { data: comparison } = useGetPayrollComparisonQuery({ id, previousRunId: 'previous-id' }, { skip: !run });
  
  const [processRun, { isLoading: isProcessing }] = useProcessPayrollRunMutation();
  const [approveRun, { isLoading: isApproving }] = useApprovePayrollRunMutation();
  const [finalizeRun, { isLoading: isFinalizing }] = useFinalizePayrollRunMutation();
  const [publishPayslips, { isLoading: isPublishing }] = usePublishPayslipsMutation();

  const handleProcess = async () => {
    try {
      await processRun(id).unwrap();
      message.success("Payroll computation completed");
    } catch (err: any) {
      message.error(err.data?.message || "Failed to process payroll");
    }
  };

  const handleApprove = async () => {
    try {
      await approveRun(id).unwrap();
      message.success("Payroll run approved");
    } catch (err: any) {
      message.error(err.data?.message || "Failed to approve payroll");
    }
  };

  const handleFinalize = async () => {
    try {
      await finalizeRun(id).unwrap();
      message.success("Payroll run finalized and journal entries posted");
    } catch (err: any) {
      message.error(err.data?.message || "Failed to finalize payroll");
    }
  };

  const handlePublish = async () => {
    try {
      await publishPayslips(id).unwrap();
      message.success("Payslips published to employee portal and emailed");
    } catch (err: any) {
      message.error(err.data?.message || "Failed to publish payslips");
    }
  };

  const getStep = (status: string) => {
    switch (status) {
      case "DRAFT": return 0;
      case "REVIEW": return 2;
      case "APPROVED": return 3;
      case "PROCESSED": return 4;
      default: return 0;
    }
  };

  if (isRunLoading) return <div style={{ padding: 100, textAlign: 'center' }}><Spin size="large" /></div>;
  if (!run) return <div>Run not found</div>;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={`Payroll Run — ${run.period}`}
        subtitle={`Run ID: ${run.runId}`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Payroll", href: "/payroll" },
          { label: "Runs", href: "/payroll/runs" },
          { label: run.period },
        ]}
        extra={
          <Space wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/payroll/runs")}>Back</Button>
            
            {run.status === 'DRAFT' && (
              <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleProcess} loading={isProcessing}>
                Compute Payroll
              </Button>
            )}
            
            {run.status === 'REVIEW' && (
              <Button type="primary" icon={<CheckOutlined />} onClick={handleApprove} loading={isApproving}>
                Approve Run
              </Button>
            )}

            {run.status === 'APPROVED' && (
              <Button type="primary" icon={<FileDoneOutlined />} onClick={handleFinalize} loading={isFinalizing}>
                Finalize & Post
              </Button>
            )}

            {run.status === 'PROCESSED' && (
              <>
                <Button icon={<DownloadOutlined />} onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/payroll/runs/${id}/beftn`, '_blank')}>
                  BEFTN Export
                </Button>
                <Button icon={<DownloadOutlined />} onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/payroll/runs/${id}/bank-transfer`, '_blank')}>
                  Bank Transfer
                </Button>
                <Button type="primary" icon={<SendOutlined />} onClick={handlePublish} loading={isPublishing}>
                  Publish Payslips
                </Button>
              </>
            )}
          </Space>
        }
      />

      {/* Progress Steps */}
      <Card style={{ background: "var(--color-surface)", border: "1px solid var(--ghost-border)", borderRadius: 4, marginBottom: 24 }} styles={{ body: { padding: 24 } }}>
        <Steps
          current={getStep(run.status)}
          size="small"
          items={[
            { title: "Draft", description: "Created" },
            { title: "Processing", description: "Calculating" },
            { title: "Review", description: "Manager review" },
            { title: "Approved", description: "Finalized" },
            { title: "Processed", description: "Posted to GL" },
          ]}
        />
      </Card>

      {/* KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}><KpiCard title="Employees" value={`${run.employeeCount || 0}`} /></Col>
        <Col xs={12} sm={6}><KpiCard title="Total Gross" value={formatCurrency(run.totalGross || 0)} /></Col>
        <Col xs={12} sm={6}><KpiCard title="Total Deductions" value={formatCurrency(run.totalDeductions || 0)} /></Col>
        <Col xs={12} sm={6}><KpiCard title="Total Net Pay" value={formatCurrency(run.totalNet || 0)} /></Col>
      </Row>

      <Tabs
        defaultActiveKey="payslips"
        items={[
          {
            key: "payslips",
            label: "Employee Payslips",
            children: (
              <Card style={{ background: "var(--color-surface)", border: "1px solid var(--ghost-border)", borderRadius: 4 }} styles={{ body: { padding: 0 } }}>
                <Table
                  columns={columns}
                  dataSource={payslips || []}
                  rowKey="id"
                  loading={isPayslipsLoading}
                  pagination={false}
                  size="middle"
                  style={{ background: "transparent" }}
                />
              </Card>
            ),
          },
          {
            key: "summary",
            label: "Department Summary",
            children: (
              <Card style={{ background: "var(--color-surface)", border: "1px solid var(--ghost-border)", borderRadius: 4 }} styles={{ body: { padding: 0 } }}>
                <Table
                  loading={isSummaryLoading}
                  dataSource={summary ? Object.entries(summary).map(([name, data]: any) => ({ name, ...data })) : []}
                  rowKey="name"
                  pagination={false}
                  columns={[
                    { title: 'Department', dataIndex: 'name', key: 'name' },
                    { title: 'Employees', dataIndex: 'count', key: 'count' },
                    { title: 'Gross', dataIndex: 'gross', key: 'gross', render: v => formatCurrency(v) },
                    { title: 'Deductions', dataIndex: 'deductions', key: 'deductions', render: v => formatCurrency(v) },
                    { title: 'Net Pay', dataIndex: 'net', key: 'net', render: v => formatCurrency(v) },
                  ]}
                />
              </Card>
            )
          },
          {
            key: "comparison",
            label: "MoM Comparison",
            children: (
              <Card style={{ background: "var(--color-surface)", border: "1px solid var(--ghost-border)", borderRadius: 4 }} styles={{ body: { padding: 0 } }}>
                <Table
                  dataSource={comparison || []}
                  rowKey="employeeName"
                  pagination={false}
                  columns={[
                    { title: 'Employee', dataIndex: 'employeeName', key: 'name' },
                    { title: 'Previous Net', dataIndex: 'previousNet', key: 'prev', render: v => formatCurrency(v) },
                    { title: 'Current Net', dataIndex: 'currentNet', key: 'curr', render: v => formatCurrency(v) },
                    { 
                      title: 'Variance', 
                      dataIndex: 'variance', 
                      key: 'var', 
                      render: v => (
                        <span style={{ color: v > 0 ? '#6dd58c' : v < 0 ? '#ffb4ab' : 'inherit' }}>
                          {v > 0 ? '+' : ''}{formatCurrency(v)}
                        </span>
                      ) 
                    },
                  ]}
                />
              </Card>
            )
          }
        ]}
      />
    </div>
  );
}
