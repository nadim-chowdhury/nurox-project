"use client";

import React from "react";
import { Row, Col, Card, Spin, Typography, Space } from "antd";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { 
  BarChartOutlined, DashboardOutlined
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetPerformanceCalibrationQuery } from "@/store/api/analyticsApi";

const { Title, Text, Paragraph } = Typography;
const COLORS = ["#ffb4ab", "#ffb347", "#c3f5ff", "#80d8ff", "#6dd58c"];

export default function PerformanceCalibrationPage() {
  const { data, isLoading } = useGetPerformanceCalibrationQuery();

  if (isLoading) return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Performance Calibration"
        subtitle="Review rating distributions and ensure fair evaluations"
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "HR", href: "/hr" }, { label: "Performance", href: "/hr/performance" }, { label: "Calibration" }]}
      />

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card 
            title={<Space><BarChartOutlined /> Rating Distribution (Bell Curve)</Space>}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)', minHeight: 500 }}
          >
            <Paragraph style={{ marginBottom: 32, color: 'var(--color-on-surface-variant)' }}>
              This chart shows the distribution of employee performance ratings. Ideally, it should resemble a normal distribution (bell curve).
            </Paragraph>
            
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="rating" 
                  label={{ value: 'Performance Rating (1-5)', position: 'insideBottom', offset: -10, fill: 'var(--color-on-surface-variant)' }}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 14 }} 
                />
                <YAxis 
                  label={{ value: 'Number of Employees', angle: -90, position: 'insideLeft', fill: 'var(--color-on-surface-variant)' }}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} 
                />
                <Tooltip 
                   contentStyle={{ background: 'var(--color-surface-container-high)', border: '1px solid var(--ghost-border)', borderRadius: 4 }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={80}>
                  {data?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
