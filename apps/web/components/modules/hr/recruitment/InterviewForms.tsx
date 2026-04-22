"use client";

import React from "react";
import { Form, DatePicker, Select, Input, Button, Space, message, Rate } from "antd";
import { useScheduleInterviewMutation, useSubmitInterviewFeedbackMutation } from "@/store/api/recruitmentApi";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export function InterviewForm({ applicationId, onSuccess }: { applicationId: string; onSuccess?: () => void }) {
  const [form] = Form.useForm();
  const [scheduleInterview, { isLoading }] = useScheduleInterviewMutation();
  const { data: users } = useGetUsersQuery();

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
  rating: z.number().min(1, "Rating is required").max(5),
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
});

type FeedbackValues = z.infer<typeof feedbackSchema>;

export function InterviewFeedbackForm({ interviewId, onSuccess }: { interviewId: string; onSuccess?: () => void }) {
  const [submitFeedback, { isLoading }] = useSubmitInterviewFeedbackMutation();
  
  const { control, handleSubmit, formState: { errors }, reset } = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      feedback: "",
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
    <form onSubmit={handleSubmit(onFinish)} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>Rating (1-5)</label>
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
        <Button type="primary" htmlType="submit" loading={isLoading} block>
          Submit Feedback
        </Button>
      </div>
    </form>
  );
}
