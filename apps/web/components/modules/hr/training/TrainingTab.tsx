"use client";

import React, { useState } from "react";
import { List, Card, Button, Tag, Space, Modal, Select, message, Typography } from "antd";
import { PlusOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { 
  useGetTrainingsQuery, 
  useGetTrainingCoursesQuery, 
  useEnrollInTrainingMutation 
} from "@/store/api/hrApi";
import { formatDate } from "@/lib/utils";

const { Text } = Typography;

interface Props {
  employeeId: string;
}

export function TrainingTab({ employeeId }: Props) {
  const { data: userTrainings, isLoading: isTrainingsLoading } = useGetTrainingsQuery(); // This should be scoped by employeeId in real app
  const { data: allCourses } = useGetTrainingCoursesQuery();
  const [enroll, { isLoading: isEnrolling }] = useEnrollInTrainingMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const handleEnroll = async () => {
    if (!selectedCourse) return;
    try {
      await enroll({ id: employeeId, courseId: selectedCourse }).unwrap();
      message.success("Employee enrolled successfully");
      setIsModalOpen(false);
      setSelectedCourse(null);
    } catch {
      message.error("Enrollment failed");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "success";
      case "IN_PROGRESS": return "processing";
      case "ENROLLED": return "default";
      case "FAILED": return "error";
      default: return "default";
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsModalOpen(true)}
        >
          Enroll in Course
        </Button>
      </div>

      <List
        loading={isTrainingsLoading}
        dataSource={userTrainings?.filter(t => t.employeeId === employeeId)}
        renderItem={(item) => (
          <Card 
            size="small" 
            style={{ marginBottom: 12, background: 'var(--color-surface-container-low)', border: '1px solid var(--ghost-border)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Space>
                <div style={{ padding: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                  <BookOutlined style={{ color: 'var(--color-primary)' }} />
                </div>
                <div>
                  <Text strong>{item.title}</Text>
                  <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                    {item.provider} · {item.durationHours} hours
                  </div>
                </div>
              </Space>
              <Tag color={getStatusColor(item.status)}>{item.status}</Tag>
            </div>
            {item.completionDate && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--color-success)' }}>
                <CheckCircleOutlined /> Completed on {formatDate(item.completionDate)}
              </div>
            )}
          </Card>
        )}
      />

      <Modal
        title="Enroll Employee in Training"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleEnroll}
        confirmLoading={isEnrolling}
      >
        <div style={{ marginTop: 16 }}>
          <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>Select a course from the catalog</Text>
          <Select
            placeholder="Search courses..."
            style={{ width: '100%' }}
            onChange={setSelectedCourse}
            options={allCourses?.map(c => ({ label: `${c.title} (${c.category})`, value: c.id }))}
            showSearch
            filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
          />
        </div>
      </Modal>
    </div>
  );
}
