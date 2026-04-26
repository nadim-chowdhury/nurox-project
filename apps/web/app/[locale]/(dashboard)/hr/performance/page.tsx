"use client";

import React, { useState } from "react";
import { 
    Card, 
    Tag, 
    Button, 
    Space, 
    Progress, 
    Tabs, 
    Table, 
    Typography
} from "antd";
import { PlusOutlined, UserOutlined, WarningOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { AddOkrModal } from "@/components/modules/hr/performance/AddOkrModal";
import { AddThreeSixtyReviewModal } from "@/components/modules/hr/performance/AddThreeSixtyReviewModal";
import { InitiatePipModal } from "@/components/modules/hr/performance/InitiatePipModal";

const { Text, Title } = Typography;

export default function PerformancePage() {
  const [okrVisible, setOkrVisible] = useState(false);
  const [threeSixtyVisible, setThreeSixtyVisible] = useState(false);
  const [pipVisible, setPipVisible] = useState(false);

  const okrColumns = [
    {
      title: "Employee",
      dataIndex: "employee",
      key: "employee",
      render: (emp: any) => emp ? `${emp.firstName} ${emp.lastName}` : "N/A",
    },
    {
      title: "Objective",
      dataIndex: "objective",
      key: "objective",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Period",
      dataIndex: "period",
      key: "period",
    },
    {
      title: "Progress",
      dataIndex: "progress",
      key: "progress",
      render: (p: number) => <Progress percent={p} size="small" />,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (s: string) => <Tag color={s === "COMPLETED" ? "green" : "blue"}>{s}</Tag>,
    },
  ];

  const items = [
    {
      key: "okrs",
      label: "OKRs & Goals",
      children: (
        <Card className="shadow-sm">
          <Table columns={okrColumns} dataSource={[]} rowKey="id" />
        </Card>
      ),
    },
    {
      key: "360",
      label: "360° Reviews",
      children: (
        <Card className="shadow-sm">
           <div style={{ textAlign: 'center', padding: '40px 0' }}>
               <UserOutlined style={{ fontSize: 48, color: 'var(--color-on-surface-variant)', marginBottom: 16 }} />
               <Title level={4}>360° Feedback Cycles</Title>
               <Text type="secondary">Implement multi-rater feedback for comprehensive employee evaluation.</Text>
               <div style={{ marginTop: 24 }}>
                   <Button type="primary" onClick={() => setThreeSixtyVisible(true)}>Start Feedback Cycle</Button>
               </div>
           </div>
        </Card>
      ),
    },
    {
      key: "pip",
      label: "PIP (Performance Improvement)",
      children: (
        <Card className="shadow-sm">
           <div style={{ padding: 24 }}>
               <Space direction="vertical" style={{ width: '100%' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                       <WarningOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
                       <Title level={4} style={{ margin: 0 }}>Active PIPs</Title>
                   </div>
                   <Table columns={[]} dataSource={[]} />
                   <Button type="primary" danger ghost icon={<PlusOutlined />} onClick={() => setPipVisible(true)}>
                       Initiate PIP
                   </Button>
               </Space>
           </div>
        </Card>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Performance Management"
        subtitle="Manage OKRs, 360° reviews, and performance improvements"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Performance" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setOkrVisible(true)}>
            New OKR
          </Button>
        }
      />

      <Tabs items={items} />

      <AddOkrModal visible={okrVisible} onClose={() => setOkrVisible(false)} />
      <AddThreeSixtyReviewModal visible={threeSixtyVisible} onClose={() => setThreeSixtyVisible(false)} />
      <InitiatePipModal visible={pipVisible} onClose={() => setPipVisible(false)} />
    </div>
  );
}
