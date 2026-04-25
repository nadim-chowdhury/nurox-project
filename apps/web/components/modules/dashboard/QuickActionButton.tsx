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
import { usePermission } from "@/hooks/usePermission";

export function QuickActionButton() {
  const router = useRouter();
  const { canPerform, Permission } = usePermission();

  const actions = [
    {
      icon: <TeamOutlined />,
      tooltip: "New Employee",
      onClick: () => router.push('/hr/employees/new'),
      visible: canPerform(Permission.HR_UPDATE_EMPLOYEE),
    },
    {
      icon: <FileTextOutlined />,
      tooltip: "Create Invoice",
      onClick: () => router.push('/finance/invoices'),
      visible: canPerform(Permission.FINANCE_UPDATE_INVOICES),
    },
    {
      icon: <CalendarOutlined />,
      tooltip: "Apply Leave",
      onClick: () => router.push('/leave/apply'),
      visible: true, // Everyone can apply leave
    },
    {
      icon: <ProjectOutlined />,
      tooltip: "Add Task",
      onClick: () => router.push('/projects/tasks'),
      visible: canPerform(Permission.PROJECTS_UPDATE),
    },
  ];

  const visibleActions = actions.filter(a => a.visible);

  if (visibleActions.length === 0) return null;

  return (
    <FloatButton.Group
      trigger="click"
      type="primary"
      style={{ right: 24, bottom: 24 }}
      icon={<PlusOutlined />}
    >
      {visibleActions.map((action, index) => (
        <FloatButton 
          key={index}
          icon={action.icon} 
          tooltip={action.tooltip} 
          onClick={action.onClick} 
        />
      ))}
    </FloatButton.Group>
  );
}
