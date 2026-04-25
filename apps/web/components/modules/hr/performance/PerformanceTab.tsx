"use client";

import React, { useState } from "react";
import { List, Card, Button, Rate, Space, Modal, Typography, Tag, Progress, Divider, Row, Col } from "antd";
import { PlusOutlined, UserOutlined, MessageOutlined, BarChartOutlined } from "@ant-design/icons";
import { 
  useGetPerformanceReviewsQuery,
  useGetReviewSummaryQuery,
  useSubmitReviewFeedbackMutation
} from "@/store/api/hrApi";

const { Text, Title } = Typography;

interface Props {
  employeeId: string;
}

export function PerformanceTab({ employeeId }: Props) {
  const { data: reviews, isLoading } = useGetPerformanceReviewsQuery({ employeeId, type: "THREE_SIXTY" });
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const { data: summary, isLoading: isSummaryLoading } = useGetReviewSummaryQuery(selectedReview?.id, {
    skip: !selectedReview
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "success";
      case "ACTIVE": return "processing";
      default: return "default";
    }
  };

  return (
    <div>
      <Row gutter={24}>
        <Col span={8}>
          <Title level={5} style={{ marginBottom: 16 }}>Review Cycles</Title>
          <List
            loading={isLoading}
            dataSource={reviews}
            renderItem={(item) => (
              <Card 
                size="small" 
                hoverable
                onClick={() => setSelectedReview(item)}
                style={{ 
                  marginBottom: 12, 
                  background: selectedReview?.id === item.id ? 'rgba(195, 245, 255, 0.05)' : 'var(--color-surface-container-low)',
                  borderColor: selectedReview?.id === item.id ? 'var(--color-primary)' : 'var(--ghost-border)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>{item.period}</Text>
                  <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
                </div>
                <div style={{ fontSize: 12, marginTop: 4, color: 'var(--color-on-surface-variant)' }}>
                  Overall Progress: {item.progress}%
                </div>
              </Card>
            )}
          />
        </Col>

        <Col span={16}>
          {selectedReview ? (
            <Card style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--ghost-border)' }}>
              <Title level={4}>{selectedReview.period} Summary</Title>
              
              {isSummaryLoading ? <Progress percent={50} status="active" showInfo={false} /> : (
                <>
                  <Row gutter={16} style={{ marginTop: 24, textAlign: 'center' }}>
                    <Col span={6}>
                      <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                        <Title level={2} style={{ margin: 0, color: 'var(--color-primary)' }}>{summary?.averageRating || 0}</Title>
                        <Text type="secondary" style={{ fontSize: 11 }}>AVG RATING</Text>
                      </div>
                    </Col>
                    {['PEER', 'MANAGER', 'SUBORDINATE'].map(type => (
                      <Col span={6} key={type}>
                        <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
                          <Title level={3} style={{ margin: 0 }}>{summary?.breakdown[type]?.avg || 0}</Title>
                          <Text type="secondary" style={{ fontSize: 11 }}>{type}</Text>
                        </div>
                      </Col>
                    ))}
                  </Row>

                  <Divider />

                  <Title level={5}><MessageOutlined /> Feedback Comments</Title>
                  <List
                    dataSource={summary?.comments}
                    renderItem={(c: any) => (
                      <List.Item>
                        <List.Item.Meta
                          title={<Tag>{c.type}</Tag>}
                          description={
                            <div>
                              <Text italic>"{c.comment}"</Text>
                              <div style={{ fontSize: 11, marginTop: 4 }}>
                                {new Date(c.date).toLocaleDateString()}
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </>
              )}
            </Card>
          ) : (
            <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <Text type="secondary">Select a review cycle to see details</Text>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
