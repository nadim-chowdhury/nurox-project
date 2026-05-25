"use client";

import React, { useState } from "react";
import {
  Table,
  Button,
  Card,
  Typography,
  Tag,
  Space,
  Select,
  Modal,
} from "antd";
import {
  useGetAuditLogsQuery,
  useExportGdprDataMutation,
} from "@/store/api/auditApi";
import { DownloadOutlined, SafetyCertificateOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [module, setModule] = useState<string | undefined>(undefined);

  const { data, isLoading } = useGetAuditLogsQuery({ page, limit, module });
  const [exportGdpr, { isLoading: isExporting }] = useExportGdprDataMutation();

  const handleGdprExport = async () => {
    // In a real scenario, this would export for a selected user,
    // for this admin demo, we'll just mock a user ID or prompt for one
    Modal.info({
      title: "GDPR Export",
      content:
        "This feature will download a ZIP archive containing all personal data associated with a specific User ID, complying with the Right of Access.",
      onOk() {
        // e.g., exportGdpr('user-id')
      },
    });
  };

  const columns = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      render: (action: string) => {
        const color =
          action === "CREATE"
            ? "green"
            : action === "UPDATE"
              ? "blue"
              : action === "DELETE"
                ? "red"
                : "default";
        return <Tag color={color}>{action}</Tag>;
      },
    },
    {
      title: "Module",
      dataIndex: "module",
      key: "module",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Entity ID",
      dataIndex: "entityId",
      key: "entityId",
      render: (id: string) => (
        <Text copyable style={{ width: 100 }} ellipsis={{ tooltip: id }}>
          {id}
        </Text>
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      key: "userId",
      render: (id: string) => (
        <Text copyable style={{ width: 100 }} ellipsis={{ tooltip: id }}>
          {id}
        </Text>
      ),
    },
    {
      title: "IP Address",
      dataIndex: "ipAddress",
      key: "ipAddress",
    },
    {
      title: "Duration (ms)",
      dataIndex: "durationMs",
      key: "durationMs",
      render: (ms: number) => (ms ? `${ms}ms` : "-"),
    },
    {
      title: "Timestamp",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Audit Logs & Compliance
          </Title>
          <Text type="secondary">
            Immutable record of all system activities and GDPR compliance
            actions.
          </Text>
        </div>
        <Space>
          <Button
            icon={<SafetyCertificateOutlined />}
            onClick={handleGdprExport}
            loading={isExporting}
          >
            GDPR Export
          </Button>
          <Button icon={<DownloadOutlined />}>Export to XLSX</Button>
        </Space>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Select
            placeholder="Filter by Module"
            allowClear
            style={{ width: 200 }}
            onChange={setModule}
            options={[
              { label: "HR", value: "HR" },
              { label: "Finance", value: "FINANCE" },
              { label: "Payroll", value: "PAYROLL" },
              { label: "System", value: "SYSTEM" },
            ]}
          />
        </div>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          rowKey="id"
          loading={isLoading}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ display: "flex", gap: 24 }}>
                {record.oldValue && (
                  <div style={{ flex: 1 }}>
                    <Text strong>Old Value:</Text>
                    <pre
                      style={{
                        background: "#f5f5f5",
                        padding: 8,
                        borderRadius: 4,
                        marginTop: 8,
                      }}
                    >
                      {JSON.stringify(record.oldValue, null, 2)}
                    </pre>
                  </div>
                )}
                {record.newValue && (
                  <div style={{ flex: 1 }}>
                    <Text strong>New Value:</Text>
                    <pre
                      style={{
                        background: "#e6f7ff",
                        padding: 8,
                        borderRadius: 4,
                        marginTop: 8,
                      }}
                    >
                      {JSON.stringify(record.newValue, null, 2)}
                    </pre>
                  </div>
                )}
                {record.correlationId && (
                  <div style={{ flex: 1 }}>
                    <Text strong>Request Trace (Correlation ID):</Text>
                    <pre
                      style={{
                        background: "#f6ffed",
                        padding: 8,
                        borderRadius: 4,
                        marginTop: 8,
                      }}
                    >
                      {record.correlationId}
                    </pre>
                  </div>
                )}
              </div>
            ),
            rowExpandable: (record) =>
              !!record.oldValue || !!record.newValue || !!record.correlationId,
          }}
          pagination={{
            current: page,
            pageSize: limit,
            total: data?.meta.total || 0,
            onChange: (p, l) => {
              setPage(p);
              setLimit(l);
            },
          }}
        />
      </Card>
    </div>
  );
}
