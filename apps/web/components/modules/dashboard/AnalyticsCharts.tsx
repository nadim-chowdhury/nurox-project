"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Card, Row, Col, Typography } from "antd";

const { Title } = Typography;

const revenueData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
];

const pipelineData = [
  { name: "Qualified", value: 320000, color: "#9aa5be" },
  { name: "Proposal", value: 475000, color: "#ffb347" },
  { name: "Negotiation", value: 280000, color: "#80d8ff" },
  { name: "Won", value: 185000, color: "#6dd58c" },
];

export function AnalyticsCharts() {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}>
        <Card
          title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Revenue Growth</span>}
          style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
        >
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--color-surface-container-high)', 
                    border: '1px solid var(--ghost-border)',
                    borderRadius: 4,
                    color: 'var(--color-on-surface)'
                  }} 
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-primary)"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card
          title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Pipeline Mix</span>}
          style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
        >
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pipelineData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pipelineData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    background: 'var(--color-surface-container-high)', 
                    border: '1px solid var(--ghost-border)',
                    borderRadius: 4
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
