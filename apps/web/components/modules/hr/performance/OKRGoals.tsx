"use client";

import React, { useState } from "react";
import { Card, Progress, List, Typography, Button, Space, Modal, Form, InputNumber, Input, message, Divider } from "antd";
import { CheckOutlined, PlusOutlined, HistoryOutlined, LineChartOutlined } from "@ant-design/icons";
import { useGetPerformanceReviewsQuery, useAddOKRCheckInMutation } from "@/store/api/hrApi";
import { useAppSelector } from "@/hooks/useRedux";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import dayjs from "dayjs";

const { Text, Title } = Typography;

interface Props {
  employeeId: string;
}

export function OKRGoals({ employeeId }: Props) {
  const { data: okrs, isLoading: _isLoading } = useGetPerformanceReviewsQuery({ employeeId, type: "OKR" });
  const [addCheckIn, { isLoading: isCheckingIn }] = useAddOKRCheckInMutation();
  const [checkInModal, setCheckInModal] = useState<{ open: boolean, keyResult: any }>({ open: false, keyResult: null });
  const [historyVisible, setHistoryVisible] = useState<string | null>(null);
  const [form] = Form.useForm();
  const currentUser = useAppSelector(state => state.auth.user);

  // Mock progress history if not provided by API
  const getHistoryData = (okr: any) => {
    if (okr.history) return okr.history;
    return [
      { date: dayjs(okr.createdAt).format("MMM DD"), progress: 0 },
      { date: dayjs(okr.createdAt).add(1, "week").format("MMM DD"), progress: Math.round(okr.progress * 0.3) },
      { date: dayjs(okr.createdAt).add(2, "week").format("MMM DD"), progress: Math.round(okr.progress * 0.6) },
      { date: dayjs().format("MMM DD"), progress: okr.progress },
    ];
  };

  const handleCheckIn = async (values: any) => {
    try {
      await addCheckIn({
        keyResultId: checkInModal.keyResult.id,
        value: values.value,
        comment: values.comment,
        checkedById: currentUser?.id || "",
      }).unwrap();
      message.success("Check-in successful");
      setCheckInModal({ open: false, keyResult: null });
      form.resetFields();
    } catch {
      message.error("Failed to submit check-in");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {okrs?.map((okr: any) => (
        <Card 
          key={okr.id} 
          title={
            <Space direction="vertical" size={0}>
              <Text strong style={{ color: 'var(--color-primary)' }}>{okr.period}</Text>
              <Title level={5} style={{ margin: 0 }}>{okr.objective}</Title>
            </Space>
          }
          extra={
            <Space size={16}>
              <Button 
                size="small" 
                icon={<LineChartOutlined />} 
                onClick={() => setHistoryVisible(historyVisible === okr.id ? null : okr.id)}
              >
                {historyVisible === okr.id ? "Hide Chart" : "Trend"}
              </Button>
              <Progress type="circle" percent={okr.progress} size={40} />
            </Space>
          }
          style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--ghost-border)' }}
        >
          {historyVisible === okr.id && (
            <div style={{ height: 200, marginBottom: 24, padding: "0 20px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getHistoryData(okr)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 10 }} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--color-surface-container-high)', border: '1px solid var(--ghost-border)', borderRadius: 4 }}
                  />
                  <Line type="monotone" dataKey="progress" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-primary)" }} />
                </LineChart>
              </ResponsiveContainer>
              <Divider style={{ margin: "12px 0" }} />
            </div>
          )}

          <List
            dataSource={okr.keyResults}
            renderItem={(kr: any) => (
              <List.Item
                actions={[
                  <Button 
                    key="checkin" 
                    size="small" 
                    icon={<CheckOutlined />} 
                    onClick={() => setCheckInModal({ open: true, keyResult: kr })}
                  >
                    Check-in
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={<Text strong>{kr.description}</Text>}
                  description={
                    <div style={{ marginTop: 8 }}>
                      <Progress 
                        percent={Math.round((kr.currentValue / kr.targetValue) * 100)} 
                        size="small" 
                        strokeColor="var(--color-primary)"
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 4 }}>
                        <Text type="secondary">Current: {kr.currentValue}</Text>
                        <Text strong>Target: {kr.targetValue}</Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      ))}

      <Modal
        title={`Check-in: ${checkInModal.keyResult?.description}`}
        open={checkInModal.open}
        onCancel={() => setCheckInModal({ open: false, keyResult: null })}
        onOk={() => form.submit()}
        confirmLoading={isCheckingIn}
      >
        <Form form={form} layout="vertical" onFinish={handleCheckIn} style={{ marginTop: 16 }}>
          <Form.Item 
            name="value" 
            label="Current Progress Value" 
            rules={[{ required: true }]}
            initialValue={checkInModal.keyResult?.currentValue}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="comment" label="Status Update / Comment">
            <Input.TextArea rows={3} placeholder="What has been achieved since last update?" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
