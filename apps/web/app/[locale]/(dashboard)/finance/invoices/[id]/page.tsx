"use client";

import React from "react";
import {
  Card,
  Descriptions,
  Table,
  Button,
  Space,
  Row,
  Col,
  Tag,
  Divider,
} from "antd";
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  DownloadOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

const mockInvoice = {
  id: "INV-2026-0042",
  customer: "Acme Corp",
  email: "billing@acmecorp.com",
  status: "unpaid",
  issueDate: "2026-04-01",
  dueDate: "2026-04-30",
  subtotal: 12500,
  tax: 1250,
  total: 13750,
  notes:
    "Payment due within 30 days. Late payments subject to 1.5% monthly interest.",
};

const mockItems: InvoiceItem[] = [
  {
    id: "1",
    description: "ERP Implementation — Phase 1",
    qty: 1,
    rate: 5000,
    amount: 5000,
  },
  {
    id: "2",
    description: "Custom Module Development",
    qty: 40,
    rate: 125,
    amount: 5000,
  },
  {
    id: "3",
    description: "Training & Onboarding (hours)",
    qty: 20,
    rate: 100,
    amount: 2000,
  },
  {
    id: "4",
    description: "Support Package (monthly)",
    qty: 1,
    rate: 500,
    amount: 500,
  },
];

const columns: ColumnsType<InvoiceItem> = [
  {
    title: "#",
    key: "num",
    width: 50,
    render: (_, __, i) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {i + 1}
      </span>
    ),
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "desc",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)", fontSize: 13 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Qty",
    dataIndex: "qty",
    key: "qty",
    width: 80,
    align: "right" as const,
    render: (v: number) => (
      <span
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          fontWeight: 600,
        }}
      >
        {v}
      </span>
    ),
  },
  {
    title: "Rate",
    dataIndex: "rate",
    key: "rate",
    width: 120,
    align: "right" as const,
    render: (v: number) => (
      <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
        {formatCurrency(v)}
      </span>
    ),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    width: 130,
    align: "right" as const,
    render: (v: number) => (
      <span
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-primary)",
          fontWeight: 600,
        }}
      >
        {formatCurrency(v)}
      </span>
    ),
  },
];

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={mockInvoice.id}
        subtitle={`Invoice for ${mockInvoice.customer}`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Invoices", href: "/finance/invoices" },
          { label: mockInvoice.id },
        ]}
        extra={
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/finance/invoices")}
            >
              Back
            </Button>
            <Button icon={<PrinterOutlined />}>Print</Button>
            <Button icon={<DownloadOutlined />}>PDF</Button>
            <Button type="primary" icon={<SendOutlined />}>
              Send to Customer
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Subtotal"
            value={formatCurrency(mockInvoice.subtotal)}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Tax (10%)" value={formatCurrency(mockInvoice.tax)} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Total" value={formatCurrency(mockInvoice.total)} />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard title="Status" value={mockInvoice.status.toUpperCase()} />
        </Col>
      </Row>

      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          marginBottom: 24,
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Descriptions
          column={{ xs: 1, sm: 2 }}
          labelStyle={{
            color: "var(--color-on-surface-variant)",
            fontSize: 13,
          }}
          contentStyle={{ color: "var(--color-on-surface)", fontSize: 13 }}
        >
          <Descriptions.Item label="Customer">
            {mockInvoice.customer}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {mockInvoice.email}
          </Descriptions.Item>
          <Descriptions.Item label="Issue Date">
            {formatDate(mockInvoice.issueDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Due Date">
            {formatDate(mockInvoice.dueDate)}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <StatusTag status={mockInvoice.status} />
          </Descriptions.Item>
          <Descriptions.Item label="Invoice No">
            {mockInvoice.id}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title={
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-on-surface)",
              fontWeight: 600,
            }}
          >
            Line Items
          </span>
        }
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          marginBottom: 24,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={mockItems}
          rowKey="id"
          pagination={false}
          size="middle"
          summary={() => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <span
                    style={{
                      color: "var(--color-on-surface-variant)",
                      fontSize: 13,
                    }}
                  >
                    Subtotal
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(mockInvoice.subtotal)}
                  </span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <span
                    style={{
                      color: "var(--color-on-surface-variant)",
                      fontSize: 13,
                    }}
                  >
                    Tax (10%)
                  </span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <span
                    style={{
                      color: "#ffb347",
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                    }}
                  >
                    {formatCurrency(mockInvoice.tax)}
                  </span>
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={4} align="right">
                  <strong
                    style={{ color: "var(--color-on-surface)", fontSize: 14 }}
                  >
                    Total
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong
                    style={{
                      color: "var(--color-primary)",
                      fontFamily: "var(--font-display)",
                      fontSize: 16,
                    }}
                  >
                    {formatCurrency(mockInvoice.total)}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {mockInvoice.notes && (
        <Card
          style={{
            background: "var(--color-surface)",
            border: "1px solid var(--ghost-border)",
            borderRadius: 4,
          }}
          styles={{ body: { padding: 24 } }}
        >
          <h4
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-on-surface)",
              marginBottom: 8,
            }}
          >
            Notes
          </h4>
          <p style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
            {mockInvoice.notes}
          </p>
        </Card>
      )}
    </div>
  );
}
