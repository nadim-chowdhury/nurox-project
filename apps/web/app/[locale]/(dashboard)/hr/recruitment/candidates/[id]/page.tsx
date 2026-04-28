"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  Row,
  Col,
  Space,
  Button,
  Descriptions,
  Tag,
  Upload,
  message,
  Timeline,
  Typography,
  Divider,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  FilePdfOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusTag } from "@/components/common/StatusTag";
import { Avatar } from "@/components/common/Avatar";

const { Title, Text } = Typography;

export default function CandidateProfilePage() {
  const { id } = useParams();
  const [candidate] = useState({
    id: id as string,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 234 567 890",
    status: "INTERVIEW",
    appliedDate: "2026-04-15",
    resumeUrl: "https://example.com/resume.pdf",
    source: "LinkedIn",
    skills: ["React", "Node.js", "TypeScript", "NestJS"],
  });

  const timelineItems = [
    {
      children: "Applied for Senior Backend Developer",
      label: "2026-04-15",
    },
    {
      children: "Screening call completed",
      label: "2026-04-17",
      color: "green",
    },
    {
      children: "Technical Interview scheduled",
      label: "2026-04-20",
      color: "blue",
    },
  ];

  const handleUpload = (info: any) => {
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={`${candidate.firstName} ${candidate.lastName}`}
        subtitle="Candidate Profile"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Recruitment", href: "/hr/recruitment" },
          { label: "Candidate Profile" },
        ]}
        extra={
          <Space>
            <Button icon={<CalendarOutlined />}>Schedule Interview</Button>
            <Button type="primary">Make Offer</Button>
          </Space>
        }
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: "center", marginBottom: 24 }}>
            <Avatar name={`${candidate.firstName} ${candidate.lastName}`} size={120} />
            <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
              {candidate.firstName} {candidate.lastName}
            </Title>
            <StatusTag status={candidate.status} />
            <Divider />
            <div style={{ textAlign: "left" }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                <Space>
                  <MailOutlined /> <Text>{candidate.email}</Text>
                </Space>
                <Space>
                  <PhoneOutlined /> <Text>{candidate.phone}</Text>
                </Space>
                <Space>
                  <UserOutlined /> <Text>Source: {candidate.source}</Text>
                </Space>
              </Space>
            </div>
          </Card>

          <Card title="Skills">
            <Space wrap>
              {candidate.skills.map((skill) => (
                <Tag key={skill} color="blue">
                  {skill}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Application Details" style={{ marginBottom: 24 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Position">Senior Backend Developer</Descriptions.Item>
              <Descriptions.Item label="Applied Date">{candidate.appliedDate}</Descriptions.Item>
              <Descriptions.Item label="Resume">
                <Space>
                  <FilePdfOutlined style={{ color: "red" }} />
                  <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
                    resume.pdf
                  </a>
                  <Upload showUploadList={false} onChange={handleUpload}>
                    <Button size="small" icon={<UploadOutlined />}>
                      Update
                    </Button>
                  </Upload>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Recruitment Timeline">
            <Timeline mode="left" items={timelineItems} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
