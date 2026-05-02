"use client";

import React from "react";
import { Card, Table, Typography } from "antd";
import { RocketOutlined } from "@ant-design/icons";

const { Text } = Typography;

export function ProcurementLeadTimeWidget() {
  const data = [
    { category: 'Raw Materials', leadTime: 12, target: 10 },
    { category: 'Electronics', leadTime: 45, target: 30 },
    { category: 'Packaging', leadTime: 5, target: 7 },
    { category: 'Office Supplies', leadTime: 3, target: 3 },
  ];

  const columns = [
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Avg Lead Time (Days)', dataIndex: 'leadTime', key: 'leadTime', render: (val: number, record: any) => (
      <Text type={val > record.target ? 'danger' : 'success'}>{val} days</Text>
    )},
    { title: 'Target', dataIndex: 'target', key: 'target', render: (val: number) => `${val} days` },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RocketOutlined style={{ color: 'var(--color-primary)' }} />
          <span>Procurement Lead Times</span>
        </div>
      }
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
      bodyStyle={{ padding: 0 }}
    >
      <Table dataSource={data} columns={columns} pagination={false} size="small" rowKey="category" />
    </Card>
  );
}
