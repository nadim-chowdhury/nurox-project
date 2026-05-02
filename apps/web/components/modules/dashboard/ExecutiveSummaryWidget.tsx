"use client";

import React from "react";
import { Card, Row, Col, Statistic, Divider } from "antd";
import { BankOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

export function ExecutiveSummaryWidget() {
  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BankOutlined style={{ color: 'var(--color-primary)' }} />
          <span>Executive Financial Summary</span>
        </div>
      }
      style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title="Total Revenue (YTD)"
            value={1250400}
            prefix="$"
            valueStyle={{ color: 'var(--color-primary)', fontSize: 20 }}
          />
          <div style={{ fontSize: 12, color: 'var(--color-success)' }}>
            <ArrowUpOutlined /> 15% vs Last Year
          </div>
        </Col>
        <Col span={12}>
          <Statistic
            title="Net Profit (YTD)"
            value={340200}
            prefix="$"
            valueStyle={{ color: 'var(--color-success)', fontSize: 20 }}
          />
          <div style={{ fontSize: 12, color: 'var(--color-success)' }}>
            <ArrowUpOutlined /> 8% vs Last Year
          </div>
        </Col>
      </Row>
      <Divider style={{ margin: '16px 0' }} />
      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title="Operating Expenses"
            value={850000}
            prefix="$"
            valueStyle={{ color: 'var(--color-error)', fontSize: 20 }}
          />
          <div style={{ fontSize: 12, color: 'var(--color-error)' }}>
            <ArrowUpOutlined /> 5% Increase
          </div>
        </Col>
        <Col span={12}>
          <Statistic
            title="Cash on Hand"
            value={450000}
            prefix="$"
            valueStyle={{ color: 'var(--color-info)', fontSize: 20 }}
          />
          <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
            Last updated 2h ago
          </div>
        </Col>
      </Row>
    </Card>
  );
}
