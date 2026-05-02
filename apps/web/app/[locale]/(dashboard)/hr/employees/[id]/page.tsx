"use client";

import React, { useState } from "react";
import {
  Card,
  Descriptions,
  Tabs,
  Timeline,
  Spin,
  Button,
  Space,
  Row,
  Col,
  Divider,
} from "antd";
import {
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EditOutlined,
  RocketOutlined,
  HistoryOutlined,
  ArrowLeftOutlined,
  SwapOutlined,
  StopOutlined,
  LogoutOutlined,
  FileSearchOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { Avatar } from "@/components/common/Avatar";
import { StatusTag } from "@/components/common/StatusTag";
import { KpiCard } from "@/components/common/KpiCard";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
    useGetEmployeeQuery,
    useGetSalaryHistoryQuery,
} from "@/store/api/hrApi";
import { EmployeeHistoryTimeline } from "@/components/modules/hr/EmployeeHistoryTimeline";
import { EmployeeClearance } from "@/components/modules/hr/employees/EmployeeClearance";
import { OKRGoals } from "@/components/modules/hr/performance/OKRGoals";
import { TrainingTab } from "@/components/modules/hr/training/TrainingTab";
import { SkillsTab } from "@/components/modules/hr/employees/SkillsTab";
import { PerformanceTab } from "@/components/modules/hr/performance/PerformanceTab";
import { PIPTab } from "@/components/modules/hr/performance/PIPTab";
import { EngagementTab } from "@/components/modules/hr/engagement/EngagementTab";
import { HandbookTab } from "@/components/modules/hr/handbook/HandbookTab";
import { SuccessionTab } from "@/components/modules/hr/employees/SuccessionTab";
import { TransferEmployeeModal } from "@/components/modules/hr/employees/TransferEmployeeModal";
import { TerminationModal } from "@/components/modules/hr/employees/TerminationModal";
import { ResignationModal } from "@/components/modules/hr/employees/ResignationModal";
import { ExitInterviewModal } from "@/components/modules/hr/employees/ExitInterviewModal";
import { UpdateSalaryModal } from "@/components/modules/hr/employees/UpdateSalaryModal";
import { PromotionWizardModal } from "@/components/modules/hr/employees/PromotionWizardModal";
import { ProbationActionModal } from "@/components/modules/hr/employees/ProbationActionModal";
import { RehireEmployeeModal } from "@/components/modules/hr/employees/RehireEmployeeModal";

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [transferVisible, setTransferVisible] = useState(false);
  const [terminateVisible, setTerminateVisible] = useState(false);
  const [salaryVisible, setSalaryVisible] = useState(false);
  const [promotionVisible, setPromotionVisible] = useState(false);
  const [probationVisible, setProbationVisible] = useState(false);
  const [resignationVisible, setResignationVisible] = useState(false);
  const [exitInterviewVisible, setExitInterviewVisible] = useState(false);
  const [rehireVisible, setRehireVisible] = useState(false);
  const [probationMode, setProbationMode] = useState<"extend" | "complete">("extend");

  const { data: emp, isLoading: isEmpLoading } = useGetEmployeeQuery(id);
  const { data: salaryHistory, isLoading: isSalaryLoading } = useGetSalaryHistoryQuery(id);

  if (isEmpLoading || isSalaryLoading) {
      return (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <Spin size="large" />
          </div>
      );
  }

  if (!emp) return <div>Employee not found</div>;

  const isInactive = emp.status === 'TERMINATED' || emp.status === 'RESIGNED' || emp.status === 'RETIRED';

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={`${emp.firstName} ${emp.lastName}`}
        subtitle={emp.employeeCode}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "HR", href: "/hr" },
          { label: "Employees", href: "/hr/employees" },
          { label: `${emp.firstName} ${emp.lastName}` },
        ]}
        extra={
          <Space wrap>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/hr/employees")}
            >
              Back
            </Button>
            
            {isInactive ? (
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={() => setRehireVisible(true)}
              >
                Re-hire Employee
              </Button>
            ) : (
              <>
                <Button
                  icon={<RocketOutlined />}
                  onClick={() => setPromotionVisible(true)}
                >
                  Promotion
                </Button>
                <Button
                  icon={<SwapOutlined />}
                  onClick={() => setTransferVisible(true)}
                >
                  Transfer
                </Button>
                <Button
                  icon={<LogoutOutlined />}
                  onClick={() => setResignationVisible(true)}
                >
                  Resign
                </Button>
                <Button
                  icon={<FileSearchOutlined />}
                  onClick={() => setExitInterviewVisible(true)}
                >
                  Exit Interview
                </Button>
                <Button
                  icon={<DollarCircleOutlined />}
                  onClick={() => setSalaryVisible(true)}
                >
                  Revise Salary
                </Button>
                <Button
                  danger
                  icon={<StopOutlined />}
                  onClick={() => setTerminateVisible(true)}
                >
                  Terminate
                </Button>
              </>
            )}
          </Space>
        }
      />

      {/* KPI Cards */}
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <KpiCard
            title="Current Salary"
            value={formatCurrency(emp.salary || 0)}
            icon={<DollarCircleOutlined />}
            color="var(--color-primary)"
          />
        </Col>
        <Col span={6}>
          <KpiCard
            title="Join Date"
            value={formatDate(emp.joinDate)}
            icon={<CalendarOutlined />}
            color="var(--color-success)"
          />
        </Col>
        <Col span={6}>
          <KpiCard
            title="Department"
            value={emp.department?.name || "N/A"}
            icon={<EditOutlined />}
            color="var(--color-warning)"
          />
        </Col>
        <Col span={6}>
          <KpiCard
            title="Probation End"
            value={emp.probationEndDate ? formatDate(emp.probationEndDate) : "N/A"}
            icon={<HistoryOutlined />}
            color="var(--color-error)"
            extra={emp.probationEndDate && !isInactive && (
              <Space style={{ marginTop: 8 }}>
                <Button size="small" type="link" onClick={() => { setProbationMode("extend"); setProbationVisible(true); }}>Extend</Button>
                <Button size="small" type="link" onClick={() => { setProbationMode("complete"); setProbationVisible(true); }}>Complete</Button>
              </Space>
            )}
          />
        </Col>
      </Row>

      <Row gutter={24}>
        <Col span={8}>
          <Card
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--ghost-border)",
              borderRadius: 4,
              height: '100%'
            }}
            styles={{ body: { padding: 24 } }}
          >
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar
                src={emp.avatarUrl}
                name={`${emp.firstName} ${emp.lastName}`}
                size={100}
                style={{ marginBottom: 16 }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  marginBottom: 4,
                }}
              >
                <h2
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--color-on-surface)",
                    fontSize: 24,
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  {emp.firstName} {emp.lastName}
                </h2>
                <StatusTag status={emp.status} />
              </div>
              <p
                style={{
                  color: "var(--color-on-surface-variant)",
                  fontSize: 14,
                  margin: 0,
                }}
              >
                {emp.designation?.title} · {emp.department?.name}
              </p>
            </div>

            <Divider />

            <Descriptions column={1} size="small">
              <Descriptions.Item label={<span style={{ color: 'var(--color-on-surface-variant)' }}><MailOutlined /> Email</span>}>
                {emp.email}
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: 'var(--color-on-surface-variant)' }}><PhoneOutlined /> Phone</span>}>
                {emp.phone}
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: 'var(--color-on-surface-variant)' }}>Manager</span>}>
                {(emp as any).manager ? `${(emp as any).manager.firstName} ${(emp as any).manager.lastName}` : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label={<span style={{ color: 'var(--color-on-surface-variant)' }}>Employment</span>}>
                {emp.employmentType}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={16}>
          <Tabs
            defaultActiveKey="details"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--ghost-border)",
              borderRadius: 4,
              padding: "0 24px 24px",
            }}
            items={[
              {
                key: "details",
                label: "Employment Details",
                children: (
                  <Descriptions bordered column={2} size="small" style={{ marginTop: 16 }}>
                    <Descriptions.Item label="Employee ID">{emp.employeeCode}</Descriptions.Item>
                    <Descriptions.Item label="Join Date">{formatDate(emp.joinDate)}</Descriptions.Item>
                    <Descriptions.Item label="Gender">{emp.gender}</Descriptions.Item>
                    <Descriptions.Item label="Date of Birth">{emp.dateOfBirth ? formatDate(emp.dateOfBirth) : "N/A"}</Descriptions.Item>
                    <Descriptions.Item label="Address" span={2}>{emp.address}</Descriptions.Item>
                    <Descriptions.Item label="Contract Expiry">{emp.contractExpiryDate ? formatDate(emp.contractExpiryDate) : "N/A"}</Descriptions.Item>
                    <Descriptions.Item label="Probation End">{emp.probationEndDate ? formatDate(emp.probationEndDate) : "N/A"}</Descriptions.Item>
                  </Descriptions>
                ),
              },
              {
                key: "compensation",
                label: "Compensation History",
                children: (
                  <div style={{ marginTop: 16 }}>
                    <Timeline
                      items={salaryHistory?.map((s: any) => ({
                        color: "purple",
                        children: (
                          <div>
                            <div style={{ color: "var(--color-on-surface)", fontWeight: 600 }}>
                              {formatCurrency(s.newSalary)} ({s.reason})
                            </div>
                            <div style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}>
                              {formatDate(s.effectiveDate)} · {s.comments}
                            </div>
                          </div>
                        ),
                      }))}
                    />
                  </div>
                ),
              },
              {
                key: "timeline",
                label: "History & Timeline",
                children: <div style={{ marginTop: 16 }}><EmployeeHistoryTimeline employeeId={id} /></div>,
              },
              {
                key: "clearance",
                label: "Exit Clearance",
                children: <div style={{ marginTop: 16 }}><EmployeeClearance employeeId={id} /></div>,
              },
              {
                key: "okrs",
                label: "OKR & Goals",
                children: <div style={{ marginTop: 16 }}><OKRGoals employeeId={id} /></div>,
              },
              {
                key: "training",
                label: "Training",
                children: <div style={{ marginTop: 16 }}><TrainingTab employeeId={id} /></div>,
              },
              {
                key: "skills",
                label: "Skills",
                children: <div style={{ marginTop: 16 }}><SkillsTab employeeId={id} /></div>,
              },
              {
                key: "performance",
                label: "Performance",
                children: <div style={{ marginTop: 16 }}><PerformanceTab employeeId={id} /></div>,
              },
              {
                key: "pip",
                label: "PIP",
                children: <div style={{ marginTop: 16 }}><PIPTab employeeId={id} /></div>,
              },
              {
                key: "engagement",
                label: "Engagement",
                children: <div style={{ marginTop: 16 }}><EngagementTab employeeId={id} /></div>,
              },
              {
                key: "handbook",
                label: "Handbook",
                children: <div style={{ marginTop: 16 }}><HandbookTab employeeId={id} /></div>,
              },
              {
                key: "succession",
                label: "Succession",
                children: <div style={{ marginTop: 16 }}><SuccessionTab employeeId={id} /></div>,
              },
            ]}
          />
        </Col>
      </Row>

      <TransferEmployeeModal
        employee={emp}
        open={transferVisible}
        onClose={() => setTransferVisible(false)}
      />
      <TerminationModal
        employee={emp}
        open={terminateVisible}
        onClose={() => setTerminateVisible(false)}
      />
      <UpdateSalaryModal
        employee={emp}
        open={salaryVisible}
        onClose={() => setSalaryVisible(false)}
      />
      <PromotionWizardModal
        employee={emp}
        open={promotionVisible}
        onClose={() => setPromotionVisible(false)}
      />
      <ProbationActionModal
        employee={emp}
        open={probationVisible}
        onClose={() => setProbationVisible(false)}
        mode={probationMode}
      />
      <ResignationModal
        employee={emp}
        open={resignationVisible}
        onClose={() => setResignationVisible(false)}
      />
      <ExitInterviewModal
        employee={emp}
        open={exitInterviewVisible}
        onClose={() => setExitInterviewVisible(false)}
      />
      <RehireEmployeeModal
        employee={emp}
        open={rehireVisible}
        onClose={() => setRehireVisible(false)}
      />
    </div>
  );
}
