"use client";

import React, { useState } from "react";
import { 
    Card, 
    Table, 
    Tag, 
    Button, 
    Space, 
    Modal, 
    Form, 
    Input, 
    Select, 
    InputNumber,
    message,
    Typography,
    Tabs,
    Divider,
    Row,
    Col
} from "antd";
import { PlusOutlined, FilePdfOutlined, BookOutlined, UserOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { 
    useGetTrainingsQuery, 
    useAddTrainingMutation, 
    useGetEmployeesQuery,
    useGetTrainingCoursesQuery,
    useCreateTrainingCourseMutation,
    useEnrollInTrainingMutation
} from "@/store/api/hrApi";
import { formatDate, formatCurrency } from "@/lib/utils";

const { Text } = Typography;

export default function TrainingCatalogPage() {
  const [activeTab, setActiveTab] = useState("records");
  const { data: trainings, isLoading: isTrainingsLoading } = useGetTrainingsQuery();
  const { data: courses, isLoading: isCoursesLoading } = useGetTrainingCoursesQuery();
  const { data: employees } = useGetEmployeesQuery({});
  
  const [addTraining, { isLoading: isAdding }] = useAddTrainingMutation();
  const [createCourse, { isLoading: isCreatingCourse }] = useCreateTrainingCourseMutation();
  const [enrollEmployee, { isLoading: isEnrolling }] = useEnrollInTrainingMutation();
  
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState<{ open: boolean, course: any }>({ open: false, course: null });
  
  const [form] = Form.useForm();
  const [courseForm] = Form.useForm();
  const [enrollForm] = Form.useForm();

  const handleAddRecord = async (values: any) => {
    try {
      await addTraining({ id: values.employeeId, data: values }).unwrap();
      message.success("Training record added successfully");
      setRecordModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to add training");
    }
  };

  const handleCreateCourse = async (values: any) => {
    try {
      await createCourse(values).unwrap();
      message.success("Course library updated");
      setCourseModalOpen(false);
      courseForm.resetFields();
    } catch {
      message.error("Failed to create course");
    }
  };

  const handleEnroll = async (values: any) => {
    try {
      await enrollEmployee({ id: values.employeeId, courseId: enrollModalOpen.course.id }).unwrap();
      message.success("Employee enrolled successfully");
      setEnrollModalOpen({ open: false, course: null });
      enrollForm.resetFields();
      setActiveTab("records");
    } catch {
      message.error("Failed to enroll employee");
    }
  };

  const recordColumns = [
    {
      title: "Training Title",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Employee",
      dataIndex: "employee",
      key: "employee",
      render: (emp: any) => `${emp?.firstName} ${emp?.lastName}`,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (cat: string) => <Tag color="blue">{cat || "General"}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "COMPLETED" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Completion",
      dataIndex: "completionDate",
      key: "completionDate",
      render: (date: string) => date ? formatDate(date) : "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          {record.status === "COMPLETED" && (
            <Button 
                size="small" 
                icon={<FilePdfOutlined />}
                onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/hr/trainings/${record.id}/certificate`, "_blank")}
            >
                Certificate
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const courseColumns = [
      { title: "Course Title", dataIndex: "title", key: "title", render: (t: string) => <Text strong>{t}</Text> },
      { title: "Provider", dataIndex: "provider", key: "provider" },
      { title: "Category", dataIndex: "category", key: "category", render: (c: string) => <Tag>{c}</Tag> },
      { title: "Duration", dataIndex: "durationHours", key: "duration", render: (h: number) => `${h} hrs` },
      { title: "Cost", dataIndex: "cost", key: "cost", render: (c: number) => formatCurrency(c) },
      { 
          title: "Actions", 
          key: "actions", 
          render: (_: any, record: any) => (
              <Button size="small" icon={<PlusOutlined />} onClick={() => setEnrollModalOpen({ open: true, course: record })}>Enroll</Button>
          )
      },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Training & Development"
        subtitle="Employee professional development and library"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Training" },
        ]}
        extra={
          activeTab === "records" ? (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setRecordModalOpen(true)}>
                Record Training
            </Button>
          ) : (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCourseModalOpen(true)}>
                Add Course to Library
            </Button>
          )
        }
      />

      <Card className="shadow-sm" styles={{ body: { padding: 0 } }}>
        <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            style={{ padding: '0 24px' }}
            items={[
                {
                    key: "records",
                    label: <Space><UserOutlined /> Enrollment Records</Space>,
                    children: <div style={{ padding: '0 0 24px' }}><Table dataSource={trainings} columns={recordColumns} loading={isTrainingsLoading} rowKey="id" size="small" /></div>
                },
                {
                    key: "library",
                    label: <Space><BookOutlined /> Course Library</Space>,
                    children: <div style={{ padding: '0 0 24px' }}><Table dataSource={courses} columns={courseColumns} loading={isCoursesLoading} rowKey="id" size="small" /></div>
                },
            ]}
        />
      </Card>

      {/* Record Training Modal */}
      <Modal
        title="Add Training Record"
        open={recordModalOpen}
        onCancel={() => setRecordModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isAdding}
      >
        <Form form={form} layout="vertical" onFinish={handleAddRecord} style={{ marginTop: 16 }}>
          <Form.Item name="employeeId" label="Employee" rules={[{ required: true }]}>
            <Select 
                showSearch
                placeholder="Select employee"
                options={employees?.data.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="title" label="Training Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Advanced Project Management" />
          </Form.Item>
          <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="category" label="Category">
                    <Select options={[
                        { value: "Technical", label: "Technical" },
                        { value: "Soft Skills", label: "Soft Skills" },
                        { value: "Compliance", label: "Compliance" },
                        { value: "Leadership", label: "Leadership" },
                    ]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="Status" initialValue="ENROLLED">
                    <Select options={[
                        { value: "ENROLLED", label: "Enrolled" },
                        { value: "IN_PROGRESS", label: "In Progress" },
                        { value: "COMPLETED", label: "Completed" },
                    ]} />
                </Form.Item>
              </Col>
          </Row>
        </Form>
      </Modal>

      {/* Library Course Modal */}
      <Modal
        title="Add Course to Library"
        open={courseModalOpen}
        onCancel={() => setCourseModalOpen(false)}
        onOk={() => courseForm.submit()}
        confirmLoading={isCreatingCourse}
      >
        <Form form={courseForm} layout="vertical" onFinish={handleCreateCourse} style={{ marginTop: 16 }}>
            <Form.Item name="title" label="Course Title" rules={[{ required: true }]}>
                <Input placeholder="e.g. Six Sigma Green Belt" />
            </Form.Item>
            <Form.Item name="provider" label="Provider">
                <Input placeholder="e.g. Udemy, LinkedIn Learning" />
            </Form.Item>
            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                        <Input placeholder="Tech" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="durationHours" label="Duration (Hrs)">
                        <InputNumber style={{ width: '100%' }} />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="cost" label="Cost">
                        <InputNumber style={{ width: '100%' }} prefix="$" />
                    </Form.Item>
                </Col>
            </Row>
            <Form.Item name="link" label="Course URL">
                <Input placeholder="https://..." />
            </Form.Item>
        </Form>
      </Modal>

      {/* Enroll Modal */}
      <Modal
        title={`Enroll Employee in ${enrollModalOpen.course?.title}`}
        open={enrollModalOpen.open}
        onCancel={() => setEnrollModalOpen({ open: false, course: null })}
        onOk={() => enrollForm.submit()}
        confirmLoading={isEnrolling}
      >
        <Form form={enrollForm} layout="vertical" onFinish={handleEnroll} style={{ marginTop: 16 }}>
            <Form.Item name="employeeId" label="Select Employee" rules={[{ required: true }]}>
                <Select 
                    showSearch
                    placeholder="Search by name"
                    options={employees?.data.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))}
                />
            </Form.Item>
            <Divider />
            <Text type="secondary" style={{ fontSize: 12 }}>
                Enrolling an employee will create a training record and notify them via email.
            </Text>
        </Form>
      </Modal>
    </div>
  );
}
