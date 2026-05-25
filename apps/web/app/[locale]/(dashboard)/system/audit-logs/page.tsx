import React from "react";
import { AuditLogsTable } from "@/components/modules/system/AuditLogsTable";
import { Typography } from "antd";

const { Title, Paragraph } = Typography;

export default function AuditLogsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={3} className="!mb-1">
          Audit Logs & Compliance
        </Title>
        <Paragraph className="text-gray-500">
          View system-wide audit logs, track entity changes, and export data for
          compliance reporting.
        </Paragraph>
      </div>

      <AuditLogsTable />
    </div>
  );
}
