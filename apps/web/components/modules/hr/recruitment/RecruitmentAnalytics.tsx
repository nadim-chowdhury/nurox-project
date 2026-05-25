"use client";

import React from "react";
import { Row, Col, Card, Statistic, Table, Progress, Typography } from "antd";
import { 
  UserOutlined, 
  HourglassOutlined, 
  CheckCircleOutlined, 
  ArrowUpOutlined 
} from "@ant-design/icons";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { useGetAnalyticsQuery } from "@/store/api/recruitmentApi";

const { Title, Text } = Typography;

const COLORS = ["#1677ff", "#00b96b", "#faad14", "#ff4d4f", "#722ed1"];

export function RecruitmentAnalytics() {
  const { data: analytics, isLoading } = useGetAnalyticsQuery();

  if (isLoading) return <div>Loading analytics...</div>;

  const funnelData = analytics?.funnel || [];
  const sourceData = analytics?.sources || [];

  // Transform interviewer load for the table
  const interviewerLoad = Object.entries(analytics?.interviewerLoad || {}).map(([name, count]) => ({
    name,
    interviews: count,
    rating: 4.5, // Mocked
  }));

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered={false} className="analytics-card">
            <Statistic
              title="Avg. Time to Hire"
              value={analytics?.avgTimeToHire || 0}
              precision={0}
              suffix="days"
              valueStyle={{ color: "#1677ff" }}
              prefix={<HourglassOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="analytics-card">
            <Statistic
              title="Total Applicants"
              value={analytics?.totalApplicants || 0}
              valueStyle={{ color: "#1677ff" }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="analytics-card">
            <Statistic
              title="Hiring Velocity"
              value={analytics?.hiringVelocity || 0}
              precision={1}
              valueStyle={{ color: "#00b96b" }}
              prefix={<ArrowUpOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="analytics-card">
            <Statistic
              title="Success Rate"
              value={((analytics?.funnel?.find((f: any) => f.name === 'HIRED')?.value || 0) / (analytics?.totalApplicants || 1)) * 100}
              precision={1}
              valueStyle={{ color: "#1677ff" }}
              prefix={<CheckCircleOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="Recruitment Funnel" bordered={false}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1677ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Source of Hire" bordered={false}>
            <div style={{ height: 300, display: "flex", alignItems: "center" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ minWidth: 150 }}>
                {sourceData.map((s: any, i: number) => (
                  <div key={s.name} style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: COLORS[i % COLORS.length], marginRight: 8 }} />
                    <Text type="secondary">{s.name}: {s.value}</Text>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="Interviewer Performance & Load" bordered={false}>
            <Table 
              dataSource={interviewerLoad} 
              pagination={false}
              size="small"
              columns={[
                { title: "Interviewer", dataIndex: "name", key: "name" },
                { title: "Total Interviews", dataIndex: "interviews", key: "interviews" },
                { 
                  title: "Load", 
                  key: "load",
                  render: (_, record: any) => (
                    <Progress percent={(record.interviews / 20) * 100} showInfo={false} strokeColor="#1677ff" />
                  )
                },
                { 
                  title: "Avg. Rating", 
                  dataIndex: "rating", 
                  key: "rating",
                  render: (v) => <Text strong color="#faad14">{v} / 5.0</Text>
                }
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
