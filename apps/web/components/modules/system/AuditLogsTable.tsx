"use client";

import React from "react";
import { Table } from "antd";

export function AuditLogsTable() {
  return (
    <Table
      dataSource={[]}
      columns={[
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Action", dataIndex: "action", key: "action" },
        { title: "User", dataIndex: "user", key: "user" },
      ]}
    />
  );
}
