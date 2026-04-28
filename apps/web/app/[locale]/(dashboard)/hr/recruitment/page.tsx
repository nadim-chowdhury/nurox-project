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
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { KpiCard } from "@/components/common/KpiCard";
import { StatusTag } from "@/components/common/StatusTag";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";
import { AtsKanban } from "@/components/modules/hr/recruitment/AtsKanban";
import { JobRequisitionForm } from "@/components/modules/hr/recruitment/JobRequisitionForm";
import { CandidateForm } from "@/components/modules/hr/recruitment/CandidateForm";
import { 
  useGetJobsQuery, 
  useGetApplicationsQuery, 
  useGetCandidatesQuery,
  useSubmitJobForApprovalMutation,
  useOpenJobMutation,
  useUpdateJobStatusMutation
} from "@/store/api/recruitmentApi";

export default function RecruitmentPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("1");
  const [modalType, setModalType] = useState<"job" | "candidate" | null>(null);

  const { data: jobs, isLoading: isJobsLoading } = useGetJobsQuery();
  const { data: applications, isLoading: isAppsLoading } = useGetApplicationsQuery();
  const { data: candidates, isLoading: isCandidatesLoading } = useGetCandidatesQuery();
  
  const [submitForApproval] = useSubmitJobForApprovalMutation();
  const [openJob] = useOpenJobMutation();
  const [updateJobStatus] = useUpdateJobStatusMutation();

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
        await submitForApproval({ id, approverIds: [] }).unwrap();
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
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
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
          }
        ]}
      />

      <Modal
        open={!!modalType}
        onCancel={() => setModalType(null)}
        footer={null}
        width={modalType === "job" ? 800 : 500}
        destroyOnClose
        title={modalType === "job" ? "New Job Requisition" : "Add New Candidate"}
      >
        {modalType === "job" && <JobRequisitionForm onSuccess={() => setModalType(null)} />}
        {modalType === "candidate" && <CandidateForm onSuccess={() => setModalType(null)} />}
      </Modal>
    </div>
  );
}
