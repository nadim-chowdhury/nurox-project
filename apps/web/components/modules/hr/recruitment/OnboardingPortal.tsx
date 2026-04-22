"use client";

import React, { useState } from "react";
import { Card, Steps, Button, Upload, List, Checkbox, message, Typography, Space, Divider } from "antd";
import { UploadOutlined, CheckCircleFilled, FilePdfOutlined, EditOutlined } from "@ant-design/icons";
import { SignatureCanvas } from "./SignatureCanvas";
import { useGetOnboardingQuery, useUpdateOnboardingTaskMutation, useSignOfferMutation } from "@/store/api/recruitmentApi";

const { Title, Text, Paragraph } = Typography;

export function OnboardingPortal({ candidateId }: { candidateId: string }) {
  const { data: onboarding, isLoading } = useGetOnboardingQuery(candidateId);
  const [updateTask] = useUpdateOnboardingTaskMutation();
  const [signOffer] = useSignOfferMutation();
  const [showSignature, setShowSignature] = useState(false);

  if (isLoading) return <div>Loading onboarding...</div>;
  if (!onboarding) return <div>No onboarding found for this candidate.</div>;

  const currentStep = onboarding.status === "COMPLETED" ? 5 : onboarding.tasks.filter((t: any) => t.isCompleted).length;

  const handleUpload = async (taskTitle: string) => {
    // In a real app, we'd get a presigned URL and upload to S3/MinIO
    message.loading(`Uploading document for ${taskTitle}...`);
    setTimeout(async () => {
        await updateTask({ id: onboarding.id, taskTitle, isCompleted: true });
        message.success(`${taskTitle} uploaded successfully`);
    }, 1000);
  };

  const handleSignature = async (base64: string) => {
    try {
        await signOffer({ id: onboarding.candidateId, signature: base64 }).unwrap();
        await updateTask({ id: onboarding.id, taskTitle: "E-Signature", isCompleted: true });
        setShowSignature(false);
        message.success("Offer letter signed and onboarding updated");
    } catch (err) {
        message.error("Failed to sign offer letter");
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px" }}>
      <Card bordered={false} style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: 16 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Title level={2}>Welcome to Nurox ERP!</Title>
          <Paragraph>We are excited to have you on board. Please complete the following steps to finalize your onboarding.</Paragraph>
        </div>

        <Steps
          current={currentStep}
          status={onboarding.status === "COMPLETED" ? "finish" : "process"}
          items={[
            { title: "Personal Info" },
            { title: "Bank Details" },
            { title: "Education" },
            { title: "Experience" },
            { title: "E-Signature" },
          ]}
          style={{ marginBottom: 40 }}
        />

        <Divider />

        <List
          itemLayout="horizontal"
          dataSource={onboarding.tasks}
          renderItem={(task: any) => (
            <List.Item
              extra={
                task.isCompleted ? (
                  <CheckCircleFilled style={{ color: "#00b96b", fontSize: 24 }} />
                ) : task.title === "E-Signature" ? (
                  <Button type="primary" icon={<EditOutlined />} onClick={() => setShowSignature(true)}>Sign Now</Button>
                ) : (
                  <Upload 
                    showUploadList={false} 
                    customRequest={() => handleUpload(task.title)}
                  >
                    <Button icon={<UploadOutlined />}>Upload Document</Button>
                  </Upload>
                )
              }
            >
              <List.Item.Meta
                title={<Text strong style={{ fontSize: 16 }}>{task.title}</Text>}
                description={task.description}
              />
            </List.Item>
          )}
        />

        {onboarding.status === "COMPLETED" && (
            <div style={{ marginTop: 32, textAlign: "center", padding: 24, backgroundColor: "#f6ffed", borderRadius: 8, border: "1px solid #b7eb8f" }}>
                <CheckCircleFilled style={{ color: "#52c41a", fontSize: 48, marginBottom: 16 }} />
                <Title level={3}>Onboarding Complete!</Title>
                <Paragraph>Your documents have been verified. You will receive an email shortly with your login credentials.</Paragraph>
                <Button type="primary" size="large">Go to Dashboard</Button>
            </div>
        )}

        {showSignature && (
            <div style={{ marginTop: 40, textAlign: "center", padding: 32, backgroundColor: "var(--color-surface-variant)", borderRadius: 12 }}>
                <Title level={4} style={{ marginBottom: 24 }}>Sign your Offer Letter</Title>
                <Paragraph>Use your mouse or touch screen to draw your signature below.</Paragraph>
                <SignatureCanvas onSave={handleSignature} />
                <Button type="link" onClick={() => setShowSignature(false)} style={{ marginTop: 16 }}>Cancel</Button>
            </div>
        )}
      </Card>
    </div>
  );
}
