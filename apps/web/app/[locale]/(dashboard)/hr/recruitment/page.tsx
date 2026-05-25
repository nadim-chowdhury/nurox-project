"use client";

import React, { useState } from "react";
import { Button, Space, Row, Col, Tabs, Modal, message, Dropdown, MenuProps, Tag } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  UserAddOutlined,
  FileSearchOutlined,
  CheckSquareOutlined,
  MoreOutlined,
  SendOutlined,
  UnlockOutlined,
  StopOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";
import { AtsKanban } from "@/components/modules/hr/recruitment/AtsKanban";
import { RecruitmentAnalytics } from "@/components/modules/hr/recruitment/RecruitmentAnalytics";
import { JobRequisitionForm } from "@/components/modules/hr/recruitment/JobRequisitionForm";
import { CandidateForm } from "@/components/modules/hr/recruitment/CandidateForm";
import { OnboardingTemplateBuilder } from "@/components/modules/hr/recruitment/OnboardingTemplateBuilder";
import { 
  useGetJobsQuery, 
  useGetApplicationsQuery, 
  useGetCandidatesQuery,
  useSubmitJobForApprovalMutation,
  useOpenJobMutation,
  useUpdateJobStatusMutation,
  useGetOnboardingTemplatesQuery,
  useCreateOnboardingTemplateMutation,
  useUpdateOnboardingTemplateMutation
} from "@/store/api/recruitmentApi";

export default function RecruitmentPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [modalType, setModalType] = useState<"job" | "candidate" | "template" | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const { data: jobs, isLoading: isJobsLoading } = useGetJobsQuery();
  const { data: applications, isLoading: isAppsLoading } = useGetApplicationsQuery();
  const { data: candidates, isLoading: isCandidatesLoading } = useGetCandidatesQuery();
  const { data: templates, isLoading: isTemplatesLoading } = useGetOnboardingTemplatesQuery();
  
  const [submitForApproval] = useSubmitJobForApprovalMutation();
  const [openJob] = useOpenJobMutation();
  const [updateJobStatus] = useUpdateJobStatusMutation();
  const [createTemplate] = useCreateOnboardingTemplateMutation();
  const [updateTemplate] = useUpdateOnboardingTemplateMutation();

  const filteredJobs = jobs?.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()),
  ) || [];

  const filteredCandidates = candidates?.filter((c) =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const activeJobs = jobs?.filter((j) => j.status === "OPEN").length || 0;
  const totalApplicants = applications?.length || 0;
  const interviewsScheduled = applications?.filter(a => a.status === "INTERVIEW").length || 0;
  const offersMade = applications?.filter(a => a.status === "OFFER").length || 0;

  const handleJobAction = async (id: string, action: string) => {
    try {
      if (action === "submit") {
        await submitForApproval({ id }).unwrap();
        message.success("Job submitted for approval");
      } else if (action === "open") {
        await openJob(id).unwrap();
        message.success("Job is now OPEN");
      } else if (action === "close") {
        await updateJobStatus({ id, status: "CLOSED" }).unwrap();
        message.success("Job is now CLOSED");
      }
    } catch (_err) {
      message.error("Failed to perform action");
    }
  };

  const jobColumns: ColumnsType<any> = [
    {
      title: "Position",
      dataIndex: "title",
      key: "title",
      width: 200,
      render: (v: string, record) => (
        <Space direction="vertical" size={0}>
          <span style={{ fontWeight: 600 }}>{v}</span>
          <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>
            {record.designation?.title || "No Designation"}
          </span>
        </Space>
      ),
    },
    {
      title: "Department",
      dataIndex: ["department", "name"],
      key: "dept",
      width: 150,
    },
    {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 120,
        render: (s: string) => <StatusTag status={s?.toLowerCase() || "unknown"} />,
    },
    {
      title: "Applicants",
      key: "applicants",
      width: 100,
      render: (_, record) => (
        <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>
          {record.applications?.length || 0}
        </span>
      ),
    },
    {
      title: "Posted",
      dataIndex: "createdAt",
      key: "posted",
      width: 120,
      render: (d: string) => formatDate(d),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_, record) => {
        const items: MenuProps['items'] = [];
        
        if (record.status === 'DRAFT') {
            items.push({
                key: 'submit',
                label: 'Submit for Approval',
                icon: <SendOutlined />,
                onClick: () => handleJobAction(record.id, 'submit')
            });
        }
        
        if (record.status === 'APPROVED') {
            items.push({
                key: 'open',
                label: 'Open Job',
                icon: <UnlockOutlined />,
                onClick: () => handleJobAction(record.id, 'open')
            });
        }

        if (record.status === 'OPEN') {
            items.push({
                key: 'close',
                label: 'Close Job',
                icon: <StopOutlined />,
                onClick: () => handleJobAction(record.id, 'close')
            });
        }

        items.push({
            key: 'view',
            label: 'View Details',
            icon: <EyeOutlined />
        });

        return (
            <Dropdown menu={{ items }} trigger={['click']}>
                <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
        );
      },
    },
  ];

  const candidateColumns: ColumnsType<any> = [
    {
        title: "Name",
        key: "name",
        render: (_, r) => `${r.firstName} ${r.lastName}`,
    },
    {
        title: "Email",
        dataIndex: "email",
    },
    {
        title: "Applications",
        key: "apps",
        render: (_, r) => (r.applications?.length || 0),
    },
    {
        title: "Skills",
        dataIndex: "skills",
        render: (skills: string[]) => (
            <Space size={[0, 4]} wrap>
                {skills?.map(s => <Tag key={s}>{s}</Tag>)}
            </Space>
        )
    },
    {
        title: "Resume",
        dataIndex: "resumeUrl",
        render: (url) => url ? <a href={url} target="_blank" rel="noreferrer">View</a> : "N/A",
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Recruitment"
        subtitle="Job openings & applicant tracking"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Recruitment" },
        ]}
        extra={
          <Space>
            <Button icon={<UserAddOutlined />} onClick={() => setModalType("candidate")}>
                Add Candidate
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalType("job")}>
                Post Job
            </Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Active Jobs"
            value={`${activeJobs}`}
            prefix={<FileSearchOutlined style={{ color: "#6dd58c" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Total Applicants"
            value={`${totalApplicants}`}
            prefix={<UserAddOutlined style={{ color: "#c3f5ff" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Interviews"
            value={`${interviewsScheduled}`}
            prefix={<CheckSquareOutlined style={{ color: "#ffb347" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Offers"
            value={`${offersMade}`}
            prefix={<UserAddOutlined style={{ color: "#80d8ff" }} />}
          />
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "1",
            label: "Job Openings",
            children: (
              <>
                <TableToolbar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search positions..."
                />
                <DataTable
                  columns={jobColumns}
                  dataSource={filteredJobs}
                  rowKey="id"
                  loading={isJobsLoading}
                />
              </>
            ),
          },
          {
            key: "2",
            label: "ATS Kanban",
            children: (
                <div style={{ marginTop: 16 }}>
                    {isAppsLoading ? (
                        <div>Loading Kanban...</div>
                    ) : (
                        <AtsKanban initialApplications={applications || []} />
                    )}
                </div>
            ),
          },
          {
            key: "3",
            label: "Candidates",
            children: (
                <>
                <TableToolbar
                  searchValue={search}
                  onSearchChange={setSearch}
                  searchPlaceholder="Search candidates..."
                />
                <DataTable
                  columns={candidateColumns}
                  dataSource={filteredCandidates}
                  rowKey="id"
                  loading={isCandidatesLoading}
                />
              </>
            )
          },
          {
            key: "4",
            label: "Analytics",
            children: <RecruitmentAnalytics />,
          },
          {
            key: "5",
            label: "Onboarding Templates",
            children: (
              <div style={{ padding: "16px 0" }}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => {
                      setSelectedTemplate(null);
                      setModalType("template");
                    }}
                  >
                    New Template
                  </Button>
                </div>
                <DataTable
                  columns={[
                    { title: "Template Name", dataIndex: "name", key: "name" },
                    { title: "Employment Type", dataIndex: "employmentType", key: "type" },
                    { title: "Tasks", dataIndex: "tasks", key: "tasks", render: (tasks) => tasks?.length || 0 },
                    { 
                      title: "Action", 
                      key: "action", 
                      render: (_, record) => (
                        <Button 
                          type="link" 
                          onClick={() => {
                            setSelectedTemplate(record);
                            setModalType("template");
                          }}
                        >
                          Edit
                        </Button>
                      ) 
                    },
                  ]}
                  dataSource={templates}
                  rowKey="id"
                  loading={isTemplatesLoading}
                />
              </div>
            )
          }
        ]}
      />

      <Modal
        open={!!modalType}
        onCancel={() => setModalType(null)}
        footer={null}
        width={modalType === "template" ? 1000 : 800}
        destroyOnClose
        title={
          modalType === "job" 
            ? "New Job Requisition" 
            : modalType === "candidate" 
            ? "Add New Candidate" 
            : "Onboarding Template"
        }
      >
        {modalType === "job" && <JobRequisitionForm onSuccess={() => setModalType(null)} />}
        {modalType === "candidate" && <CandidateForm onSuccess={() => setModalType(null)} />}
        {modalType === "template" && (
          <OnboardingTemplateBuilder 
            initialData={selectedTemplate} 
            onSave={async (data) => {
              if (selectedTemplate) {
                await updateTemplate({ id: selectedTemplate.id, ...data }).unwrap();
              } else {
                await createTemplate(data).unwrap();
              }
              setModalType(null);
            }} 
          />
        )}
      </Modal>
    </div>
  );
}
