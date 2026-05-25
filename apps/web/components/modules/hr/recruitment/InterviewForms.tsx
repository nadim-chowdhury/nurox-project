"use client";

import React from "react";
import { Form, DatePicker, Select, Input, Button, Space, message, Rate, Typography } from "antd";

const { Title } = Typography;
import { useScheduleInterviewMutation, useSubmitInterviewFeedbackMutation } from "@/store/api/recruitmentApi";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export function InterviewForm({ applicationId, onSuccess }: { applicationId: string; onSuccess?: () => void }) {
  const [form] = Form.useForm();
  const [scheduleInterview, { isLoading }] = useScheduleInterviewMutation();
  const { data: usersResponse } = useGetUsersQuery({ page: 1, limit: 100, sortBy: "firstName", sortOrder: "ASC" });
  const users = usersResponse?.data;

  const onFinish = async (values: any) => {
    try {
      const { timeRange, ...rest } = values;
      await scheduleInterview({
        applicationId,
        startTime: timeRange[0].toISOString(),
        endTime: timeRange[1].toISOString(),
        ...rest,
      }).unwrap();
      message.success("Interview scheduled successfully");
      if (onSuccess) onSuccess();
    } catch (err) {
      message.error("Failed to schedule interview");
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="interviewerIds"
        label="Interviewers"
        rules={[{ required: true, message: "Please select interviewers" }]}
      >
        <Select mode="multiple" placeholder="Select interviewers">
          {users?.map((user: any) => (
            <Select.Option key={user.id} value={user.id}>
              {user.firstName} {user.lastName}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="stage"
        label="Interview Stage"
        rules={[{ required: true, message: "Please select stage" }]}
      >
        <Select placeholder="Select stage">
          <Select.Option value="PHONE_SCREEN">Phone Screen</Select.Option>
          <Select.Option value="INTERVIEW_1">Interview 1</Select.Option>
          <Select.Option value="INTERVIEW_2">Interview 2</Select.Option>
          <Select.Option value="TECHNICAL_TEST">Technical Test</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="timeRange"
        label="Time Range"
        rules={[{ required: true, message: "Please select interview time" }]}
      >
        <DatePicker.RangePicker showTime style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item name="location" label="Location / Meeting Link">
        <Input placeholder="e.g. Google Meet, Zoom link, or Room 302" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Schedule Interview
          </Button>
          <Button onClick={() => form.resetFields()}>Reset</Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

const feedbackSchema = z.object({
  rating: z.number().min(1, "Overall rating is required").max(5),
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
  scorecard: z.record(z.string(), z.number()).optional(),
});

const DIMENSIONS = ["Technical Skills", "Soft Skills", "Culture Fit", "Experience Match"];

type FeedbackValues = z.infer<typeof feedbackSchema>;

export function InterviewFeedbackForm({ interviewId, onSuccess }: { interviewId: string; onSuccess?: () => void }) {
  const [submitFeedback, { isLoading }] = useSubmitInterviewFeedbackMutation();
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      feedback: "",
      scorecard: {
        "Technical Skills": 0,
        "Soft Skills": 0,
        "Culture Fit": 0,
        "Experience Match": 0,
      },
    }
  });

  const onFinish = async (values: FeedbackValues) => {
    try {
      await submitFeedback({ id: interviewId, ...values }).unwrap();
      message.success("Feedback submitted");
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      message.error("Failed to submit feedback");
    }
  };

  return (
    <form onSubmit={handleSubmit(onFinish)} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ backgroundColor: "#fafafa", padding: 16, borderRadius: 8 }}>
        <Title level={5} style={{ marginTop: 0 }}>Scorecard</Title>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {DIMENSIONS.map((dim) => (
            <div key={dim}>
              <label style={{ display: "block", marginBottom: 4, fontSize: 13, color: "#666" }}>{dim}</label>
              <Controller
                name={`scorecard.${dim}` as any}
                control={control}
                render={({ field }) => <Rate {...field} style={{ fontSize: 16 }} />}
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Overall Rating</label>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => <Rate {...field} />}
        />
        {errors.rating && <div style={{ color: "var(--color-error)", fontSize: 12, marginTop: 4 }}>{errors.rating.message}</div>}
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Detailed Feedback</label>
        <Controller
          name="feedback"
          control={control}
          render={({ field }) => (
            <Input.TextArea 
              {...field} 
              rows={4} 
              placeholder="Summarize candidate's performance, strengths, and weaknesses..." 
              status={errors.feedback ? "error" : ""}
            />
          )}
        />
        {errors.feedback && <div style={{ color: "var(--color-error)", fontSize: 12, marginTop: 4 }}>{errors.feedback.message}</div>}
      </div>

      <div>
        <Button type="primary" htmlType="submit" loading={isLoading} block size="large">
          Submit Feedback
        </Button>
      </div>
    </form>
  );
}
