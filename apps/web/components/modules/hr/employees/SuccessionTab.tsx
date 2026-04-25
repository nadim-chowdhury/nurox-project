"use client";

import React from "react";
import { List, Card, Typography, Tag, Space, Progress } from "antd";
import { RocketOutlined, ArrowRightOutlined, StarOutlined } from "@ant-design/icons";
import { 
  useGetSuccessionPlansQuery 
} from "@/store/api/hrApi";

const { Text, Title, Paragraph } = Typography;

interface Props {
  employeeId: string;
}

export function SuccessionTab({ employeeId }: Props) {
  const { data: plans, isLoading } = useGetSuccessionPlansQuery({ employeeId });

  const getReadinessColor = (readiness: string) => {
    switch (readiness) {
      case "READY_NOW": return "green";
      case "READY_IN_1_YEAR": return "blue";
      case "READY_IN_2_YEARS": return "orange";
      default: return "default";
    }
  };

  const getReadinessPercent = (readiness: string) => {
    switch (readiness) {
      case "READY_NOW": return 100;
      case "READY_IN_1_YEAR": return 75;
      case "READY_IN_2_YEARS": return 50;
      default: return 25;
    }
  };

  return (
    <div>
      <Title level={5} style={{ marginBottom: 16 }}>Career Progression & Succession Path</Title>
      
      <List
        loading={isLoading}
        dataSource={plans}
        renderItem={(item) => (
          <Card 
            size="small" 
            style={{ marginBottom: 12, background: 'var(--color-surface-container-low)', border: '1px solid var(--ghost-border)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Space direction="vertical" size={4}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RocketOutlined style={{ color: 'var(--color-primary)' }} />
                  <Text strong>Target Role: {item.designation?.title}</Text>
                </div>
                <Tag color={getReadinessColor(item.readiness)}>{item.readiness.replace(/_/g, ' ')}</Tag>
              </Space>
              <div style={{ width: 150, textAlign: 'right' }}>
                <Text type="secondary" style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>Readiness Score</Text>
                <Progress percent={getReadinessPercent(item.readiness)} size="small" strokeColor="var(--color-primary)" />
              </div>
            </div>
            
            {item.developmentPlan && (
              <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 4 }}>
                <Text strong style={{ fontSize: 12 }}><StarOutlined /> Development Focus:</Text>
                <Paragraph style={{ fontSize: 12, marginTop: 4, marginBottom: 0 }}>
                  {item.developmentPlan}
                </Paragraph>
              </div>
            )}
          </Card>
        )}
      />
    </div>
  );
}
