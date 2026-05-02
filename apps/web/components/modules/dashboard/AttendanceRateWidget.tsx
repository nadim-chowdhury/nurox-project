"use client";

import React from "react";
import { Card, Progress, Typography } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export function AttendanceRateWidget() {
  const rate = 94.5;

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircleOutlined style={{ color: 'var(--color-success)' }} />
          <span>Attendance Rate</span>
        </div>
      }
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
    >
      <div style={{ textAlign: 'center', padding: '10px 0' }}>
        <Progress 
          type="dashboard" 
          percent={rate} 
          strokeColor={{ '0%': 'var(--color-primary)', '100%': 'var(--color-success)' }} 
        />
        <div style={{ marginTop: 10 }}>
          <Title level={4} style={{ margin: 0 }}>{rate}%</Title>
          <Text type="secondary">Average for this month</Text>
        </div>
      </div>
    </Card>
  );
}
