"use client";

import React from "react";
import { Card, Table, Tag, Typography, Empty } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { useGetDashboardQuery } from "@/store/api/analyticsApi";
import dayjs from "dayjs";

const { Text } = Typography;

interface Props {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export function OpenPOsWidget({ dateRange }: Props) {
  const { data, isLoading } = useGetDashboardQuery({
    startDate: dateRange[0].toISOString(),
    endDate: dateRange[1].toISOString(),
  });

  const columns = [
    {
      title: "PO #",
      dataIndex: "poNumber",
      key: "poNumber",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Vendor",
      dataIndex: "vendor",
      key: "vendor",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val: number) => `$${val.toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === 'SENT' ? 'blue' : 'default'}>{status}</Tag>
      ),
    },
  ];

  const openPos = (data as any)?.openPos || [];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShoppingCartOutlined style={{ color: 'var(--color-info)' }} />
          <span>Open Purchase Orders</span>
        </div>
      }
      loading={isLoading}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
      bodyStyle={{ padding: 0 }}
    >
      {openPos.length > 0 ? (
        <Table
          dataSource={openPos}
          columns={columns}
          pagination={false}
          size="small"
          rowKey="id"
        />
      ) : (
        <Empty description="No open POs" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />
      )}
    </Card>
  );
}
