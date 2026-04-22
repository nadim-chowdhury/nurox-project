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
  Cell,
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { Card, Row, Col, Spin, Empty } from "antd";
import { useGetDashboardQuery } from "@/store/api/analyticsApi";
import dayjs from "dayjs";

interface Props {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

const COLORS = ["#c3f5ff", "#80d8ff", "#6dd58c", "#ffb347", "#ffb4ab", "#9aa5be"];

export function AnalyticsCharts({ dateRange }: Props) {
  const { data, isLoading } = useGetDashboardQuery({
    startDate: dateRange[0].toISOString(),
    endDate: dateRange[1].toISOString(),
  });

  if (isLoading) return <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" /></div>;
  if (!data) return <Empty description="No data available for this period" />;

  const tooltipStyle = { 
    background: 'var(--color-surface-container-high)', 
    border: '1px solid var(--ghost-border)',
    borderRadius: 4,
    color: 'var(--color-on-surface)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row gutter={[16, 16]}>
        {/* Area Chart: Revenue Growth */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Revenue Growth</span>}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
          >
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <AreaChart data={data.revenueGrowth}>
                  <defs>
                    <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorArea)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Line Chart: Productivity */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Daily Productivity</span>}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
          >
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <LineChart data={(data as any).productivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="value" stroke="var(--color-success)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-success)" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Bar Chart: Task Distribution */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Task Stats</span>}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
          >
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={data.taskStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.taskStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Pie Chart: Pipeline Mix */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Pipeline Mix</span>}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
          >
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.pipelineStats}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="stage"
                  >
                    {data.pipelineStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
