"use client";

import React from "react";
import { Card, Row, Col, Statistic, Spin } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useGetComparisonQuery } from "@/store/api/analyticsApi";
import dayjs from "dayjs";

interface Props {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

export function ComparisonMode({ dateRange }: Props) {
  const currentStart = dateRange[0].toISOString();
  const currentEnd = dateRange[1].toISOString();
  
  // Calculate previous period of same duration
  const diff = dateRange[1].diff(dateRange[0], 'day');
  const prevStart = dateRange[0].subtract(diff, 'day').toISOString();
  const prevEnd = dateRange[0].subtract(1, 'day').toISOString();

  const { data, isLoading } = useGetComparisonQuery({
    currentStart,
    currentEnd,
    prevStart,
    prevEnd
  });

  if (isLoading) return <Spin />;

  const items = [
    { title: "Headcount", current: data.current.totalEmployees, previous: data.previous.totalEmployees, delta: data.delta.totalEmployees },
    { title: "Revenue", current: data.current.revenueMTD, previous: data.previous.revenueMTD, delta: data.delta.totalEmployees, prefix: "$" },
    { title: "Pipeline", current: data.current.pipelineValue, previous: data.previous.pipelineValue, delta: data.delta.pipelineValue, prefix: "$" },
    { title: "Invoices", current: data.current.pendingInvoices, previous: data.previous.pendingInvoices, delta: data.delta.pendingInvoices },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ color: 'var(--color-on-surface)', marginBottom: 16, fontFamily: 'var(--font-display)' }}>Period Comparison</h3>
      <Row gutter={[16, 16]}>
        {items.map(item => (
          <Col xs={24} sm={12} lg={6} key={item.title}>
            <Card style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--ghost-border)' }}>
              <Statistic
                title={item.title}
                value={item.current}
                prefix={item.prefix}
                valueStyle={{ color: 'var(--color-primary)' }}
              />
              <div style={{ marginTop: 8, fontSize: 12 }}>
                <span style={{ color: 'var(--color-on-surface-variant)' }}>Prev: {item.prefix}{item.previous}</span>
                <span style={{ marginLeft: 8, color: item.delta >= 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {item.delta >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  {Math.abs(item.delta)}
                </span>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
