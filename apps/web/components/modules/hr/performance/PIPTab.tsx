"use client";

import React, { useState } from "react";
import { List, Card, Button, Checkbox, Space, Modal, Typography, Tag, Progress, Form, Input, DatePicker, message, Row, Col, Divider } from "antd";
import { PlusOutlined, WarningOutlined, CalendarOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { 
  useGetPerformanceReviewsQuery,
  useGetPIPActionsQuery,
  useCreatePIPActionMutation,
  useUpdatePIPActionMutation
} from "@/store/api/hrApi";
import { formatDate } from "@/lib/utils";

const { Text, Title, Paragraph } = Typography;

interface Props {
  employeeId: string;
}

export function PIPTab({ employeeId }: Props) {
  const { data: pips, isLoading } = useGetPerformanceReviewsQuery({ employeeId, type: "PIP" });
  const [selectedPip, setSelectedReview] = useState<any>(null);
  const { data: actions, isLoading: isActionsLoading } = useGetPIPActionsQuery(selectedPip?.id, {
    skip: !selectedPip
  });
  
  const [createAction] = useCreatePIPActionMutation();
  const [updateAction] = useUpdatePIPActionMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleAddAction = async (values: any) => {
    try {
      await createAction({
        performanceReviewId: selectedPip.id,
        ...values,
        reviewDate: values.reviewDate.toISOString(),
      }).unwrap();
      message.success("PIP action item added");
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      message.error("Failed to add action item");
    }
  };

  const handleToggleAchieved = async (id: string, isAchieved: boolean) => {
    try {
      await updateAction({ id, isAchieved }).unwrap();
      message.success("Action status updated");
    } catch {
      message.error("Failed to update status");
    }
  };

  return (
    <div>
      <Row gutter={24}>
        <Col span={8}>
          <Title level={5} style={{ marginBottom: 16 }}>PIP Records</Title>
          <List
            loading={isLoading}
            dataSource={pips}
            renderItem={(item) => (
              <Card 
                size="small" 
                hoverable
                onClick={() => setSelectedReview(item)}
                style={{ 
                  marginBottom: 12, 
                  background: selectedPip?.id === item.id ? 'rgba(255, 180, 171, 0.05)' : 'var(--color-surface-container-low)',
                  borderColor: selectedPip?.id === item.id ? 'var(--color-error)' : 'var(--ghost-border)'
                }}
              >
                <Space>
                  <WarningOutlined style={{ color: 'var(--color-error)' }} />
                  <Text strong>{item.period}</Text>
                </Space>
                <Paragraph ellipsis={{ rows: 2 }} style={{ fontSize: 12, marginTop: 8, marginBottom: 0 }}>
                  {item.objective}
                </Paragraph>
              </Card>
            )}
          />
        </Col>

        <Col span={16}>
          {selectedPip ? (
            <Card style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--ghost-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <Title level={4} style={{ margin: 0 }}>{selectedPip.period} Action Plan</Title>
                  <Text type="secondary">{selectedPip.objective}</Text>
                </div>
                <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Add Target</Button>
              </div>

              <Divider />

              <List
                loading={isActionsLoading}
                dataSource={actions}
                renderItem={(action: any) => (
                  <List.Item
                    actions={[
                      <Checkbox 
                        key="status" 
                        checked={action.isAchieved} 
                        onChange={(e) => handleToggleAchieved(action.id, e.target.checked)}
                      >
                        Achieved
                      </Checkbox>
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space>
                          <Text strong>{action.targetArea}</Text>
                          {action.isAchieved && <Tag color="success" icon={<CheckCircleOutlined />}>Done</Tag>}
                        </Space>
                      }
                      description={
                        <div style={{ marginTop: 4 }}>
                          <div style={{ fontSize: 13, color: 'var(--color-on-surface)' }}>{action.expectedOutcome}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
                            <CalendarOutlined /> Review Date: {formatDate(action.reviewDate)}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          ) : (
            <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)' }}>
              <Text type="secondary">Select a PIP record to see the action plan</Text>
            </Card>
          )}
        </Col>
      </Row>

      <Modal
        title="Add PIP Target"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleAddAction} style={{ marginTop: 16 }}>
          <Form.Item name="targetArea" label="Target Area / Skill" rules={[{ required: true }]}>
            <Input placeholder="e.g. Code Quality, Punctuality..." />
          </Form.Item>
          <Form.Item name="expectedOutcome" label="Expected Outcome" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Describe what success looks like..." />
          </Form.Item>
          <Form.Item name="reviewDate" label="Review Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
