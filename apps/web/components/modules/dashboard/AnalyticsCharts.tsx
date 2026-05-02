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
  ScatterChart,
  Scatter,
  ZAxis,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";
import { Card, Row, Col, Spin, Empty } from "antd";
import { useGetDashboardQuery, useGetDepartmentKPIsQuery } from "@/store/api/analyticsApi";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

interface Props {
  dateRange: [dayjs.Dayjs, dayjs.Dayjs];
}

const COLORS = ["#c3f5ff", "#80d8ff", "#6dd58c", "#ffb347", "#ffb4ab", "#9aa5be"];

export function AnalyticsCharts({ dateRange }: Props) {
  const router = useRouter();
  const { data, isLoading } = useGetDashboardQuery({
    startDate: dateRange[0].toISOString(),
    endDate: dateRange[1].toISOString(),
  });
  
  const { data: deptData } = useGetDepartmentKPIsQuery();

  if (isLoading) return <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin size="large" /></div>;
  if (!data) return <Empty description="No data available for this period" />;

  const handleBarClick = (payload: any) => {
    if (payload && payload.status) {
      router.push(`/projects/tasks?status=${payload.status}`);
    }
  };

  const handlePieClick = (payload: any) => {
    if (payload && payload.stage) {
      router.push(`/sales/deals?stage=${payload.stage}`);
    }
  };

  const tooltipStyle = { 
    background: 'var(--color-surface-container-high)', 
    border: '1px solid var(--ghost-border)',
    borderRadius: 4,
    color: 'var(--color-on-surface)'
  };

  const radarData = deptData?.map(d => ({
    subject: d.name,
    A: d.tasks,
    B: d.employees * 10,
    fullMark: 150,
  })) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Row gutter={[16, 16]}>
        {/* Area Chart: Revenue Growth */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Revenue Growth (Area)</span>}
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
            title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Daily Productivity (Line)</span>}
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
        {/* Stacked Bar Chart: Expenses */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Expense Breakdown (Stacked Bar)</span>}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
          >
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={(data as any).expenseBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="Salaries" stackId="a" fill="var(--color-primary)" />
                  <Bar dataKey="Marketing" stackId="a" fill="var(--color-success)" />
                  <Bar dataKey="Operations" stackId="a" fill="var(--color-warning)" />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Donut Chart: Pipeline Mix */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Pipeline Mix (Donut)</span>}
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
                    onClick={(e) => handlePieClick(e.payload)}
                    style={{ cursor: 'pointer' }}
                  >
                    {data.pipelineStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Scatter Chart: Lead Performance */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Sales Performance (Scatter)</span>}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
          >
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" dataKey="x" name="Lead Score" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
                  <YAxis type="number" dataKey="y" name="Conversion Probability" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
                  <ZAxis type="number" dataKey="z" range={[60, 400]} name="Value" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={tooltipStyle} />
                  <Scatter name="Leads" data={(data as any).salesPerformance} fill="var(--color-primary)" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        {/* Radar Chart: Dept Performance */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Department Activity (Radar)</span>}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
          >
            <div style={{ width: "100%", height: 250 }}>
              <ResponsiveContainer>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar name="Activity" dataKey="A" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.6} />
                  <Radar name="Capacity" dataKey="B" stroke="var(--color-success)" fill="var(--color-success)" fillOpacity={0.6} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Bar Chart: Task Stats */}
        <Col xs={24}>
          <Card
            title={<span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Task Status Distribution (Bar)</span>}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
          >
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart 
                  data={data.taskStats} 
                  onClick={(e: any) => e && handleBarClick(e.activePayload?.[0]?.payload)}
                  style={{ cursor: 'pointer' }}
                >
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
      </Row>
    </div>
  );
}
