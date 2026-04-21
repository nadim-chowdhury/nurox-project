"use client";

import React from "react";
import { FloatButton } from "antd";
import {
  PlusOutlined,
  TeamOutlined,
  FileTextOutlined,
  CalendarOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

export function QuickActionButton() {
  const router = useRouter();

  return (
    <FloatButton.Group
      trigger="click"
      type="primary"
      style={{ right: 24, bottom: 24 }}
      icon={<PlusOutlined />}
    >
      <FloatButton 
        icon={<TeamOutlined />} 
        tooltip="New Employee" 
        onClick={() => router.push('/hr/employees/new')} 
      />
      <FloatButton 
        icon={<FileTextOutlined />} 
        tooltip="Create Invoice" 
        onClick={() => router.push('/finance/invoices')} 
      />
      <FloatButton 
        icon={<CalendarOutlined />} 
        tooltip="Apply Leave" 
        onClick={() => router.push('/leave/apply')} 
      />
      <FloatButton 
        icon={<ProjectOutlined />} 
        tooltip="Add Task" 
        onClick={() => router.push('/projects/tasks')} 
      />
    </FloatButton.Group>
  );
}
