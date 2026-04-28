"use client";

import React, { useState } from "react";
import { Card, Descriptions, Badge, Space, Button, List, Typography, Divider, Modal, Tag, Rate } from "antd";
import { CalendarOutlined, FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useGetApplicationQuery, useUpdateApplicationStatusMutation } from "@/store/api/recruitmentApi";
import { InterviewForm, InterviewFeedbackForm } from "./InterviewForms";
import { OfferForm } from "./OfferForm";
import { formatDate } from "@/lib/utils";

const { Title, Text, Paragraph } = Typography;

export function ApplicationDetails({ id, onSuccess }: { id: string; onSuccess?: () => void }) {
  const { data: application, isLoading } = useGetApplicationQuery(id);
  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [modalType, setModalType] = useState<"interview" | "feedback" | "offer" | null>(null);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(null);

  if (isLoading) return <div>Loading application...</div>;
  if (!application) return <div>Application not found</div>;

  const handleStatusUpdate = async (status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      if (onSuccess) onSuccess();
    } catch (_err) {
      // Error handled by middleware
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ marginBottom: 4 }}>
            {application.candidate.firstName} {application.candidate.lastName}
          </Title>
          <Space>
            <Tag color="blue">{application.job.title}</Tag>
            <Tag color={application.status === "REJECTED" ? "error" : "processing"}>{application.status}</Tag>
          </Space>
        </div>
        <Space>
          {application.status !== "REJECTED" && (
            <Button danger icon={<CloseCircleOutlined />} onClick={() => handleStatusUpdate("REJECTED")}>
              Reject
            </Button>
          )}
          <Button type="primary" icon={<CalendarOutlined />} onClick={() => setModalType("interview")}>
            Schedule Interview
          </Button>
          {(application.status === "INTERVIEW" || application.status === "SCREENED") && (
            <Button type="primary" style={{ backgroundColor: "#00b96b" }} icon={<CheckCircleOutlined />} onClick={() => setModalType("offer")}>
              Extend Offer
            </Button>
          )}
        </Space>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Descriptions title="Candidate Information" column={2}>
          <Descriptions.Item label="Email">{application.candidate.email}</Descriptions.Item>
          <Descriptions.Item label="Phone">{application.candidate.phone || "N/A"}</Descriptions.Item>
          <Descriptions.Item label="Applied Date">{formatDate(application.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Resume">
            {application.candidate.resumeUrl ? (
                <a href={application.candidate.resumeUrl} target="_blank" rel="noreferrer">
                <FileTextOutlined /> View Resume
                </a>
            ) : "No resume uploaded"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Title level={4}>Interviews</Title>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={application.interviews}
        renderItem={(interview: any) => (
          <List.Item>
            <Card 
              size="small" 
              title={formatDate(interview.startTime)}
              extra={<Tag color={interview.status === "COMPLETED" ? "success" : "warning"}>{interview.status}</Tag>}
            >
              <div style={{ marginBottom: 8 }}>
                <Text type="secondary">Location:</Text> {interview.location || "N/A"}
              </div>
              {interview.feedback ? (
                <div>
                  <Divider style={{ margin: "8px 0" }} />
                  <Rate disabled defaultValue={interview.rating} style={{ fontSize: 14, marginBottom: 8 }} />
                  <Paragraph ellipsis={{ rows: 2, expandable: true }}>{interview.feedback}</Paragraph>
                </div>
              ) : (
                <Button 
                    type="link" 
                    onClick={() => {
                        setSelectedInterviewId(interview.id);
                        setModalType("feedback");
                    }}
                >
                  Add Feedback
                </Button>
              )}
            </Card>
          </List.Item>
        )}
      />

      <Modal
        open={!!modalType}
        title={
          modalType === "interview" ? "Schedule Interview" : 
          modalType === "feedback" ? "Interview Feedback" : 
          "Create Offer Letter"
        }
        onCancel={() => {
            setModalType(null);
            setSelectedInterviewId(null);
        }}
        footer={null}
        destroyOnClose
      >
        {modalType === "interview" && (
          <InterviewForm applicationId={id} onSuccess={() => setModalType(null)} />
        )}
        {modalType === "feedback" && selectedInterviewId && (
          <InterviewFeedbackForm interviewId={selectedInterviewId} onSuccess={() => setModalType(null)} />
        )}
        {modalType === "offer" && (
            <OfferForm applicationId={id} onSuccess={() => {
                setModalType(null);
                if (onSuccess) onSuccess();
            }} />
        )}
      </Modal>
    </div>

  );
}
