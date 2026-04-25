"use client";

import React from "react";
import { Row, Col, Card, Statistic, Spin, Typography, Space } from "antd";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { 
  TeamOutlined, UserSwitchOutlined, ClockCircleOutlined, 
  LineChartOutlined, PieChartOutlined 
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { useGetHRAnalyticsQuery } from "@/store/api/analyticsApi";

const { Title, Text } = Typography;
const COLORS = ["#c3f5ff", "#80d8ff", "#6dd58c", "#ffb347", "#ffb4ab"];

export default function HRAnalyticsPage() {
  const { data, isLoading } = useGetHRAnalyticsQuery();

  if (isLoading) return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" /></div>;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="HR Analytics"
        subtitle="Data-driven insights into your workforce"
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "HR", href: "/hr" }, { label: "Analytics" }]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <KpiCard 
            title="Total Headcount" 
            value={data.totalEmployees} 
            icon={<TeamOutlined />}
            color="var(--color-primary)"
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard 
            title="Turnover Rate" 
            value={`${data.turnoverRate}%`} 
            icon={<UserSwitchOutlined />}
            color="var(--color-error)"
          />
        </Col>
        <Col xs={24} sm={8}>
          <KpiCard 
            title="Avg. Tenure (Years)" 
            value={data.averageTenure} 
            icon={<ClockCircleOutlined />}
            color="var(--color-success)"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Headcount Trend */}
        <Col xs={24} lg={16}>
          <Card 
            title={<Space><LineChartOutlined /> Headcount Trend</Space>}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)', height: 400 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.headcountTrend}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ background: 'var(--color-surface-container-high)', border: '1px solid var(--ghost-border)', borderRadius: 4 }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Gender Diversity */}
        <Col xs={24} lg={8}>
          <Card 
            title={<Space><PieChartOutlined /> Gender Diversity</Space>}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)', height: 400 }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.genderDiversity}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  nameKey="type"
                >
                  {data.genderDiversity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ background: 'var(--color-surface-container-high)', border: '1px solid var(--ghost-border)', borderRadius: 4 }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Department Distribution */}
        <Col span={24}>
          <Card 
            title="Headcount by Department"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--ghost-border)' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.departmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} />
                <Tooltip 
                   contentStyle={{ background: 'var(--color-surface-container-high)', border: '1px solid var(--ghost-border)', borderRadius: 4 }}
                />
                <Bar dataKey="employees" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
