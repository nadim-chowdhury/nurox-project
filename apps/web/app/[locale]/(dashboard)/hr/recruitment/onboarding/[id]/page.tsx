"use client";

import React, { useState } from "react";
import {
  Card,
  Button,
  Row,
  Col,
  Progress,
  List,
  Checkbox,
  Upload,
  message,
  Typography,
} from "antd";
import {
  UploadOutlined,
  FileTextOutlined,
  IdcardOutlined,
  BankOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { SignaturePad } from "@/components/common/SignaturePad";

const { Title, Text, Paragraph } = Typography;

export default function OnboardingPortalPage() {
  const [tasks, setTasks] = useState([
    { title: "Personal Information", completed: true, icon: <IdcardOutlined /> },
    { title: "Bank Details", completed: false, icon: <BankOutlined /> },
    { title: "Educational Certificates", completed: false, icon: <FileTextOutlined /> },
    { title: "Work Experience", completed: false, icon: <FileTextOutlined /> },
    { title: "E-Signature", completed: false, icon: <EditOutlined /> },
  ]);

  const progress = Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);

  const handleTaskToggle = (index: number) => {
    const newTasks = [...tasks];
    if (newTasks[index]) {
      newTasks[index].completed = !newTasks[index].completed;
      setTasks(newTasks);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="New Hire Onboarding"
        subtitle="Complete your onboarding tasks to join the team"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Onboarding" },
        ]}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card title="Onboarding Checklist" style={{ marginBottom: 24 }}>
            <List
              dataSource={tasks}
              renderItem={(item, index) => (
                <List.Item
                  actions={[
                    <Checkbox
                      key="completed-checkbox"
                      checked={item.completed}
                      onChange={() => handleTaskToggle(index)}
                    >
                      {item.completed ? "Completed" : "Mark as Done"}
                    </Checkbox>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={item.icon}
                    title={item.title}
                    description={item.completed ? "Verified" : "Pending action"}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card title="Document Upload">
            <Paragraph>
              Please upload clear copies of the following documents for verification.
            </Paragraph>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Upload style={{ width: "100%" }}>
                  <Button icon={<UploadOutlined />} style={{ width: "100%" }}>
                    Upload NID/Passport
                  </Button>
                </Upload>
              </Col>
              <Col span={12}>
                <Upload style={{ width: "100%" }}>
                  <Button icon={<UploadOutlined />} style={{ width: "100%" }}>
                    Upload TIN Certificate
                  </Button>
                </Upload>
              </Col>
            </Row>
          </Card>
          <Card title="E-Signature" style={{ marginTop: 24 }}>
            <Paragraph>
              Please sign below to confirm your acceptance of the offer and terms.
            </Paragraph>
            <SignaturePad onSave={(_url) => {
              message.success("Signature saved successfully");
              handleTaskToggle(4); // Mark E-Signature as done
            }} />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Your Progress" style={{ textAlign: "center", marginBottom: 24 }}>
            <Progress type="circle" percent={progress} />
            <Title level={4} style={{ marginTop: 24 }}>
              {progress === 100 ? "Ready to Join!" : "Almost There"}
            </Title>
            <Text type="secondary">
              {tasks.filter((t) => !t.completed).length} tasks remaining
            </Text>
          </Card>

          <Card title="Need Help?">
            <Paragraph>
              If you have any questions regarding your onboarding, please contact our HR support.
            </Paragraph>
            <Button block type="primary" ghost>
              Contact Support
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
