"use client";

import React from "react";
import { Card, Table, Tag, Typography } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Text } = Typography;

export function OverdueInvoicesWidget() {
  const invoices = [
    { id: '1', invoiceNumber: 'INV-1001', customer: 'Global Tech', amount: 15000, dueDate: '2024-04-20', delay: 12 },
    { id: '2', invoiceNumber: 'INV-1005', customer: 'Apex Solutions', amount: 8200, dueDate: '2024-04-25', delay: 7 },
    { id: '3', invoiceNumber: 'INV-1012', customer: 'Nexus Ltd', amount: 4500, dueDate: '2024-04-28', delay: 4 },
  ];

  const columns = [
    { title: 'Invoice', dataIndex: 'invoiceNumber', key: 'invoiceNumber', render: (text: string) => <Text strong>{text}</Text> },
    { title: 'Customer', dataIndex: 'customer', key: 'customer' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', render: (val: number) => `$${val.toLocaleString()}` },
    { title: 'Days Late', dataIndex: 'delay', key: 'delay', render: (val: number) => <Tag color="error">{val} days</Tag> },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <WarningOutlined style={{ color: 'var(--color-error)' }} />
          <span>Overdue Invoices</span>
        </div>
      }
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
      bodyStyle={{ padding: 0 }}
    >
      <Table dataSource={invoices} columns={columns} pagination={false} size="small" rowKey="id" />
    </Card>
  );
}
