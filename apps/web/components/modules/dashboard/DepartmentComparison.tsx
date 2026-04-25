"use client";

import React from "react";
import { Card, Table, Typography, Progress } from "antd";
import { ApartmentOutlined } from "@ant-design/icons";
import { useGetDepartmentKPIsQuery } from "@/store/api/analyticsApi";

const { Text } = Typography;

export function DepartmentComparison() {
  const { data, isLoading } = useGetDepartmentKPIsQuery();

  const columns = [
    {
      title: "Department",
      dataKey: "name",
      key: "name",
      render: (text: string) => (
        <Text strong style={{ color: "var(--color-on-surface)" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Team Size",
      dataIndex: "employees",
      key: "employees",
      align: "center" as const,
    },
    {
      title: "Budget Utilization",
      key: "utilization",
      render: (_: any, record: any) => {
        const percent = Math.round((record.spend / record.budget) * 100);
        return (
          <div style={{ width: 120 }}>
            <Progress 
              percent={percent} 
              size="small" 
              status={percent > 100 ? "exception" : "active"}
              strokeColor={percent > 100 ? "var(--color-error)" : "var(--color-primary)"}
              trailColor="rgba(255,255,255,0.05)"
            />
          </div>
        );
      },
    },
    {
      title: "Tasks",
      dataIndex: "tasks",
      key: "tasks",
      align: "center" as const,
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ApartmentOutlined style={{ color: 'var(--color-primary)' }} />
          <span style={{ color: 'var(--color-on-surface)', fontFamily: 'var(--font-display)' }}>Department Performance</span>
        </div>
      }
      style={{ 
        background: 'var(--color-surface)', 
        border: '1px solid var(--ghost-border)',
      }}
      loading={isLoading}
    >
      <Table
        dataSource={data}
        columns={columns}
        rowKey="name"
        pagination={false}
        size="middle"
        className="nurox-table-transparent"
      />
    </Card>
  );
}
