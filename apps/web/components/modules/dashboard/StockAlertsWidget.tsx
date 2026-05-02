"use client";

import React from "react";
import { Card, Table, Tag, Typography, Empty } from "antd";
import { WarningOutlined } from "@ant-design/icons";
import { useGetDashboardQuery } from "@/store/api/analyticsApi";
import dayjs from "dayjs";

const { Text } = Typography;

interface Props {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export function StockAlertsWidget({ dateRange }: Props) {
  const { data, isLoading } = useGetDashboardQuery({
    startDate: dateRange[0].toISOString(),
    endDate: dateRange[1].toISOString(),
  });

  const columns = [
    {
      title: "Product",
      dataKey: "name",
      key: "name",
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>{record.sku}</Text>
        </div>
      ),
    },
    {
      title: "Stock",
      dataIndex: "currentStock",
      key: "currentStock",
      render: (val: number) => <Text type="danger">{val}</Text>,
    },
    {
      title: "Min",
      dataIndex: "reorderPoint",
      key: "reorderPoint",
    },
    {
      title: "Action",
      key: "action",
      render: () => <Tag color="orange">Reorder</Tag>,
    },
  ];

  const stockAlerts = (data as any)?.stockAlerts || [];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <WarningOutlined style={{ color: 'var(--color-warning)' }} />
          <span>Stock Alerts</span>
        </div>
      }
      loading={isLoading}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
      bodyStyle={{ padding: 0 }}
    >
      {stockAlerts.length > 0 ? (
        <Table
          dataSource={stockAlerts}
          columns={columns}
          pagination={false}
          size="small"
          rowKey="productId"
        />
      ) : (
        <Empty description="No stock alerts" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: 20 }} />
      )}
    </Card>
  );
}
