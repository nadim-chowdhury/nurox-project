"use client";

import React, { useState } from "react";
import { List, Card, Button, Radio, Space, Modal, Typography, Tag, Progress, Form, Input, message, Row, Col } from "antd";
import { SmileOutlined, SendOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { 
  useGetENPSSurveysQuery,
  useSubmitENPSResponseMutation,
  useGetENPSAnalyticsQuery
} from "@/store/api/hrApi";
import { useAppSelector } from "@/hooks/useRedux";

const { Text, Title, Paragraph } = Typography;

interface Props {
  employeeId: string;
}

export function EngagementTab({ employeeId }: Props) {
  const { data: surveys, isLoading } = useGetENPSSurveysQuery();
  const [submitResponse, { isLoading: isSubmitting }] = useSubmitENPSResponseMutation();
  const [selectedSurvey, setSelectedSurvey] = useState<any>(null);
  const [form] = Form.useForm();
  const user = useAppSelector(state => state.auth.user);

  const handleSubmit = async (values: any) => {
    try {
      await submitResponse({
        surveyId: selectedSurvey.id,
        score: values.score,
        comment: values.comment,
        departmentId: user?.departmentId, // Need to ensure departmentId is in user object
      }).unwrap();
      message.success("Survey submitted. Thank you for your feedback!");
      setSelectedSurvey(null);
      form.resetFields();
    } catch {
      message.error("Failed to submit survey");
    }
  };

  return (
    <div>
      <Row gutter={24}>
        <Col span={24}>
          <Title level={5} style={{ marginBottom: 16 }}>Active Pulse Surveys</Title>
          <List
            loading={isLoading}
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
            dataSource={surveys?.filter(s => s.isActive)}
            renderItem={(item) => (
              <List.Item>
                <Card 
                  size="small" 
                  title={item.title}
                  extra={<Tag color="green">Open</Tag>}
                  style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--ghost-border)' }}
                >
                  <Paragraph style={{ fontSize: 12 }}>
                    How likely are you to recommend Nurox as a place to work?
                  </Paragraph>
                  <Button 
                    type="primary" 
                    block 
                    icon={<SendOutlined />} 
                    onClick={() => setSelectedSurvey(item)}
                  >
                    Take Survey
                  </Button>
                </Card>
              </List.Item>
            )}
          />
        </Col>
      </Row>

      <Modal
        title={`Pulse Survey: ${selectedSurvey?.title}`}
        open={!!selectedSurvey}
        onCancel={() => setSelectedSurvey(null)}
        onOk={() => form.submit()}
        confirmLoading={isSubmitting}
        okText="Submit Anonymous Feedback"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} style={{ marginTop: 16 }}>
          <Form.Item 
            name="score" 
            label="How likely are you to recommend Nurox as a place to work?" 
            extra="0 = Not at all likely, 10 = Extremely likely"
            rules={[{ required: true }]}
          >
            <Radio.Group style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
              {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                <Radio.Button key={n} value={n} style={{ flex: 1, textAlign: 'center' }}>{n}</Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item name="comment" label="Reason for your score? (Optional)">
            <Input.TextArea rows={3} placeholder="Tell us more about your experience..." />
          </Form.Item>
          <Text type="secondary" style={{ fontSize: 11 }}>
            <SmileOutlined /> Your response is anonymous and will be used to improve our workplace.
          </Text>
        </Form>
      </Modal>
    </div>
  );
}
