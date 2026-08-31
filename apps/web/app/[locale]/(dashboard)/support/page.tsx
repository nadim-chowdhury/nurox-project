"use client";

import React, { useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  Drawer,
  message,
  Popconfirm,
  Avatar,
  Divider,
} from "antd";
import {
  PlusOutlined,
  CustomerServiceOutlined,
  BookOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  SendOutlined,
  UserOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { DataTable } from "@/components/tables/DataTable";
import { formatDate } from "@/lib/utils";
import {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useAddTicketMessageMutation,
  useResolveTicketMutation,
  useAnalyzeTicketMutation,
  useGetSupportAnalyticsQuery,
} from "@/store/api/supportApi";

export default function SupportPage() {
  const router = useRouter();

  // Queries
  const { data: rawTickets, isLoading: isLoadingTickets } =
    useGetTicketsQuery();
  const { data: rawAnalytics } = useGetSupportAnalyticsQuery();

  // Mutations
  const [createTicket, { isLoading: isCreatingTicket }] =
    useCreateTicketMutation();
  const [addMessage, { isLoading: isSendingMsg }] =
    useAddTicketMessageMutation();
  const [resolveTicket, { isLoading: isResolving }] =
    useResolveTicketMutation();
  const [analyzeTicket, { isLoading: isAnalyzing }] =
    useAnalyzeTicketMutation();

  // UI States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [form] = Form.useForm();

  // Safe data arrays
  const tickets: any[] = Array.isArray((rawTickets as any)?.data)
    ? (rawTickets as any).data
    : Array.isArray(rawTickets)
      ? rawTickets
      : [];

  const handleCreateTicket = async () => {
    try {
      const values = await form.validateFields();
      await createTicket(values).unwrap();
      message.success("Support ticket created successfully");
      setIsCreateModalOpen(false);
      form.resetFields();
    } catch {
      message.error("Failed to create ticket");
    }
  };

  const handleSendReply = async () => {
    if (!activeTicket || !replyContent.trim()) return;
    try {
      await addMessage({
        id: activeTicket.id,
        content: replyContent.trim(),
      }).unwrap();
      message.success("Reply posted");
      setReplyContent("");
      // Update local view
      setActiveTicket((prev: any) => ({
        ...prev,
        messages: [
          ...(prev.messages || []),
          {
            id: `temp-${Date.now()}`,
            content: replyContent.trim(),
            senderType: "AGENT",
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    } catch {
      message.error("Failed to send reply");
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveTicket(id).unwrap();
      message.success("Ticket marked as resolved");
      if (activeTicket?.id === id) {
        setActiveTicket((prev: any) => ({ ...prev, status: "RESOLVED" }));
      }
    } catch {
      message.error("Failed to resolve ticket");
    }
  };

  const handleAiAnalysis = async (id: string) => {
    try {
      const analysis = await analyzeTicket(id).unwrap();
      message.success("AI analysis completed");
      if (analysis?.suggestedReply) {
        setReplyContent(analysis.suggestedReply);
      }
    } catch {
      message.error("AI analysis unavailable");
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "Ticket #",
      dataIndex: "ticketNumber",
      key: "ticketNumber",
      width: 130,
      render: (v: string, r) => (
        <span
          onClick={() => setActiveTicket(r)}
          style={{
            color: "var(--color-primary)",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {v || `TICK-${r.id?.slice(0, 6).toUpperCase()}`}
        </span>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (v: string, r) => (
        <div>
          <div
            onClick={() => setActiveTicket(r)}
            style={{
              fontWeight: 500,
              color: "var(--color-on-surface)",
              cursor: "pointer",
            }}
          >
            {v}
          </div>
          <div
            style={{ fontSize: 11, color: "var(--color-on-surface-variant)" }}
          >
            Category: {r.category || "General"} • Requester:{" "}
            {r.requesterEmail || "Customer"}
          </div>
        </div>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 110,
      render: (p: string) => {
        const colors: Record<string, string> = {
          CRITICAL: "#ffb4ab",
          HIGH: "#ffb347",
          MEDIUM: "#80d8ff",
          LOW: "#9aa5be",
        };
        return (
          <Tag
            style={{
              background: `${colors[p] || "#9aa5be"}18`,
              color: colors[p] || "#9aa5be",
              border: `1px solid ${colors[p] || "#9aa5be"}40`,
              borderRadius: 4,
            }}
          >
            {p}
          </Tag>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => {
        const colors: Record<string, string> = {
          OPEN: "#80d8ff",
          IN_PROGRESS: "#ffb347",
          RESOLVED: "#6dd58c",
          CLOSED: "#9aa5be",
        };
        return (
          <Tag
            style={{
              background: `${colors[status] || "#9aa5be"}18`,
              color: colors[status] || "#9aa5be",
              border: `1px solid ${colors[status] || "#9aa5be"}40`,
              borderRadius: 4,
            }}
          >
            {status || "OPEN"}
          </Tag>
        );
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (d: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}
        >
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      align: "right" as const,
      render: (_, r) => (
        <Space size={6}>
          <Button size="small" onClick={() => setActiveTicket(r)}>
            View
          </Button>
          {r.status !== "RESOLVED" && r.status !== "CLOSED" && (
            <Popconfirm
              title="Resolve Ticket?"
              description="Mark this support ticket as solved."
              onConfirm={() => handleResolve(r.id)}
            >
              <Button
                size="small"
                type="text"
                icon={<CheckCircleOutlined />}
                style={{ color: "#6dd58c" }}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Customer Support & Help Desk"
        subtitle="Omnichannel Ticket Management, AI Sentiment & SLA Monitoring"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Support" },
        ]}
        extra={
          <Space>
            <Button
              icon={<BookOutlined />}
              onClick={() => router.push("/support/kb")}
            >
              Knowledge Base
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              New Ticket
            </Button>
          </Space>
        }
      />

      {/* KPI Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Total Tickets"
            value={`${(rawAnalytics as any)?.totalTickets ?? tickets.length}`}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Open Tickets"
            value={`${
              (rawAnalytics as any)?.openTickets ??
              tickets.filter((t) => t.status === "OPEN" || !t.status).length
            }`}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Resolved Tickets"
            value={`${
              (rawAnalytics as any)?.resolvedTickets ??
              tickets.filter(
                (t) => t.status === "RESOLVED" || t.status === "CLOSED",
              ).length
            }`}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Avg Response Time"
            value={`${(rawAnalytics as any)?.avgResponseHours ?? 1.8} hrs`}
          />
        </Col>
      </Row>

      {/* Ticket Table */}
      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
        }}
      >
        <DataTable<any>
          columns={columns}
          dataSource={tickets}
          rowKey="id"
          loading={isLoadingTickets}
        />
      </Card>

      {/* Create Ticket Modal */}
      <Modal
        title="Create Support Ticket"
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onOk={handleCreateTicket}
        confirmLoading={isCreatingTicket}
        okText="Create Ticket"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="subject"
            label="Subject"
            rules={[{ required: true, message: "Enter ticket subject" }]}
          >
            <Input placeholder="e.g. Cannot access payroll structure / payment gateway error" />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Select category" }]}
            initialValue="TECHNICAL"
          >
            <Select
              options={[
                { label: "Technical Support", value: "TECHNICAL" },
                { label: "Billing & Invoicing", value: "BILLING" },
                { label: "Feature Request", value: "FEATURE" },
                { label: "HR / Payroll Inquiry", value: "HR_PAYROLL" },
                { label: "General", value: "GENERAL" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: "Select priority" }]}
            initialValue="MEDIUM"
          >
            <Select
              options={[
                { label: "Low", value: "LOW" },
                { label: "Medium", value: "MEDIUM" },
                { label: "High", value: "HIGH" },
                { label: "Critical", value: "CRITICAL" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description / Issue Details"
            rules={[{ required: true, message: "Enter issue details" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Describe the issue in detail..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Ticket Drawer Thread */}
      <Drawer
        title={
          activeTicket ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span>
                {activeTicket.ticketNumber ||
                  `TICK-${activeTicket.id?.slice(0, 6)}`}{" "}
                — {activeTicket.subject}
              </span>
              <Tag
                color={activeTicket.status === "RESOLVED" ? "green" : "blue"}
              >
                {activeTicket.status || "OPEN"}
              </Tag>
            </div>
          ) : (
            "Ticket Details"
          )
        }
        open={!!activeTicket}
        onClose={() => setActiveTicket(null)}
        width={600}
      >
        {activeTicket && (
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            {/* Header info */}
            <div
              style={{
                padding: 12,
                background: "rgba(255,255,255,0.02)",
                borderRadius: 4,
                marginBottom: 16,
                border: "1px solid var(--ghost-border)",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "var(--color-on-surface-variant)",
                }}
              >
                <strong>Requester:</strong>{" "}
                {activeTicket.requesterEmail || "Customer"} |{" "}
                <strong>Priority:</strong> {activeTicket.priority || "MEDIUM"}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  color: "var(--color-on-surface)",
                }}
              >
                {activeTicket.description}
              </div>
            </div>

            {/* AI Assistant Toolbar */}
            <div
              style={{
                padding: 12,
                background: "rgba(195,245,255,0.05)",
                border: "1px solid rgba(195,245,255,0.2)",
                borderRadius: 4,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <RobotOutlined
                  style={{ color: "var(--color-primary)", fontSize: 18 }}
                />
                <span
                  style={{ fontSize: 12, color: "var(--color-on-surface)" }}
                >
                  AI Copilot & Smart Reply
                </span>
              </div>
              <Button
                size="small"
                type="dashed"
                loading={isAnalyzing}
                icon={<RobotOutlined />}
                onClick={() => handleAiAnalysis(activeTicket.id)}
              >
                Generate Suggested Reply
              </Button>
            </div>

            {/* Message Thread */}
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
              {(activeTicket.messages || []).map((msg: any, idx: number) => (
                <div
                  key={msg.id || idx}
                  style={{
                    display: "flex",
                    gap: 12,
                    marginBottom: 16,
                    flexDirection:
                      msg.senderType === "AGENT" ? "row-reverse" : "row",
                  }}
                >
                  <Avatar
                    icon={<UserOutlined />}
                    style={{
                      background:
                        msg.senderType === "AGENT" ? "#003c4a" : "#222c42",
                    }}
                  />
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "10px 14px",
                      borderRadius: 8,
                      background:
                        msg.senderType === "AGENT"
                          ? "rgba(195,245,255,0.12)"
                          : "rgba(255,255,255,0.04)",
                      border: "1px solid var(--ghost-border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--color-on-surface-variant)",
                        marginBottom: 4,
                      }}
                    >
                      {msg.senderType === "AGENT"
                        ? "Support Agent"
                        : "Customer"}{" "}
                      • {formatDate(msg.createdAt)}
                    </div>
                    <div
                      style={{ fontSize: 13, color: "var(--color-on-surface)" }}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div style={{ marginTop: "auto" }}>
              <Input.TextArea
                rows={3}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Type your response to the customer..."
                style={{ marginBottom: 8 }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {activeTicket.status !== "RESOLVED" ? (
                  <Button
                    danger
                    icon={<CheckCircleOutlined />}
                    loading={isResolving}
                    onClick={() => handleResolve(activeTicket.id)}
                  >
                    Mark Resolved
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  loading={isSendingMsg}
                  disabled={!replyContent.trim()}
                  onClick={handleSendReply}
                >
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
