"use client";

import React from "react";
import { Form, Button, Space, message, Typography } from "antd";

const { Title } = Typography;
import {
  useScheduleInterviewMutation,
  useSubmitInterviewFeedbackMutation,
} from "@/store/api/recruitmentApi";
import { useGetUsersQuery } from "@/store/api/usersApi";
import { useForm, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  interviewFormSchema,
  interviewFeedbackSchema,
  type InterviewFormDto,
  type InterviewFeedbackDto,
} from "@repo/shared-schemas";
import { RhfSelect } from "@/components/common/forms/RhfSelect";
import { RhfInput } from "@/components/common/forms/RhfInput";
import { RhfRangePicker } from "@/components/common/forms/RhfRangePicker";
import { RhfRate } from "@/components/common/forms/RhfRate";
import { RhfTextArea } from "@/components/common/forms/RhfTextArea";

export function InterviewForm({
  applicationId,
  onSuccess,
}: {
  applicationId: string;
  onSuccess?: () => void;
}) {
  const [scheduleInterview, { isLoading }] = useScheduleInterviewMutation();
  const { data: usersResponse } = useGetUsersQuery({
    page: 1,
    limit: 100,
    sortBy: "firstName",
    sortOrder: "ASC",
  });
  const users = usersResponse?.data;

  const { control, handleSubmit, reset } = useForm<InterviewFormDto>({
    resolver: zodResolver(interviewFormSchema) as Resolver<InterviewFormDto>,
    defaultValues: {
      applicationId,
      interviewerIds: [],
      location: "",
    } as any,
  });

  const onFinish = async (values: InterviewFormDto) => {
    try {
      const { timeRange, ...rest } = values;
      await scheduleInterview({
        ...rest,
        startTime: timeRange[0],
        endTime: timeRange[1],
      }).unwrap();
      message.success("Interview scheduled successfully");
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      message.error("Failed to schedule interview");
    }
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onFinish)}>
      <RhfSelect
        name="interviewerIds"
        control={control}
        label="Interviewers"
        required
        mode="multiple"
        placeholder="Select interviewers"
        options={users?.map((user: any) => ({
          value: user.id,
          label: `${user.firstName} ${user.lastName}`,
        }))}
      />

      <RhfSelect
        name="status"
        control={control}
        label="Status"
        required
        defaultValue="SCHEDULED"
        options={[
          { value: "SCHEDULED", label: "Scheduled" },
          { value: "COMPLETED", label: "Completed" },
          { value: "CANCELLED", label: "Cancelled" },
          { value: "NO_SHOW", label: "No Show" },
        ]}
      />

      <RhfRangePicker
        name="timeRange"
        control={control}
        label="Time Range"
        required
        showTime
      />

      <RhfInput
        name="location"
        control={control}
        label="Location / Meeting Link"
        placeholder="e.g. Google Meet, Zoom link, or Room 302"
      />

      <div style={{ marginTop: 24 }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={isLoading}>
            Schedule Interview
          </Button>
          <Button onClick={() => reset()}>Reset</Button>
        </Space>
      </div>
    </Form>
  );
}

const DIMENSIONS = [
  "Technical Skills",
  "Soft Skills",
  "Culture Fit",
  "Experience Match",
];

export function InterviewFeedbackForm({
  interviewId,
  onSuccess,
}: {
  interviewId: string;
  onSuccess?: () => void;
}) {
  const [submitFeedback, { isLoading }] = useSubmitInterviewFeedbackMutation();

  const { control, handleSubmit, reset } = useForm<InterviewFeedbackDto>({
    resolver: zodResolver(
      interviewFeedbackSchema,
    ) as Resolver<InterviewFeedbackDto>,
    defaultValues: {
      rating: 0,
      feedback: "",
      scorecard: {
        "Technical Skills": 0,
        "Soft Skills": 0,
        "Culture Fit": 0,
        "Experience Match": 0,
      },
    },
  });

  const onFinish = async (values: InterviewFeedbackDto) => {
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
    <Form layout="vertical" onFinish={handleSubmit(onFinish)}>
      <div
        style={{
          backgroundColor: "#fafafa",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <Title level={5} style={{ marginTop: 0 }}>
          Scorecard
        </Title>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {DIMENSIONS.map((dim) => (
            <RhfRate
              key={dim}
              name={`scorecard.${dim}` as any}
              control={control}
              label={dim}
              style={{ fontSize: 16 }}
            />
          ))}
        </div>
      </div>

      <RhfRate
        name="rating"
        control={control}
        label="Overall Rating"
        required
      />

      <RhfTextArea
        name="feedback"
        control={control}
        label="Detailed Feedback"
        required
        rows={4}
        placeholder="Summarize candidate's performance, strengths, and weaknesses..."
      />

      <div style={{ marginTop: 24 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={isLoading}
          block
          size="large"
        >
          Submit Feedback
        </Button>
      </div>
    </Form>
  );
}
