"use client";

import React from "react";
import { Card, List, Typography } from "antd";
import { ShopOutlined } from "@ant-design/icons";

const { Text } = Typography;

export function TopProductsWidget() {
  const products = [
    { name: "Industrial Pump X1", sales: 1250, revenue: 45000 },
    { name: "Safety Gear Set", sales: 850, revenue: 12000 },
    { name: "Heavy Duty Cable", sales: 600, revenue: 8500 },
    { name: "Welding Rods (Pack 50)", sales: 450, revenue: 2200 },
    { name: "Machine Lubricant", sales: 300, revenue: 5400 },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShopOutlined style={{ color: 'var(--color-primary)' }} />
          <span>Top Selling Products</span>
        </div>
      }
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
    >
      <List
        dataSource={products}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={item.name}
              description={`${item.sales} units sold`}
            />
            <div style={{ textAlign: 'right' }}>
              <Text strong>${item.revenue.toLocaleString()}</Text>
            </div>
          </List.Item>
        )}
      />
    </Card>
  );
}
