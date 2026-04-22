"use client";

import React from "react";
import Image from "next/image";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  BankOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  ProjectOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  ShoppingOutlined,
  FileOutlined,
  AuditOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { usePermission } from "@/hooks/usePermission";

const { Sider } = Layout;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const { canPerform, Permission, isAdmin } = usePermission();

  const menuItems = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "hr-menu",
      icon: <TeamOutlined />,
      label: "HR",
      hidden: !canPerform(Permission.HR_VIEW_EMPLOYEES),
      children: [
        { key: "/hr/employees", label: "Employees" },
        { key: "/hr/departments", label: "Departments", hidden: !canPerform(Permission.HR_VIEW_DEPARTMENTS) },
        { key: "/hr/designations", label: "Designations" },
        { key: "/hr/recruitment", label: "Recruitment" },
        { key: "/hr/performance", label: "Performance", hidden: !canPerform(Permission.HR_MANAGE_PERFORMANCE) },
      ],
    },
    {
      key: "attendance-menu",
      icon: <ClockCircleOutlined />,
      label: "Attendance",
      children: [
        { key: "/attendance", label: "Overview" },
        { key: "/attendance/shifts", label: "Shifts" },
        { key: "/attendance/reports", label: "Reports" },
      ],
    },
    {
      key: "leave-menu",
      icon: <CalendarOutlined />,
      label: "Leave",
      children: [
        { key: "/leave", label: "Overview" },
        { key: "/leave/apply", label: "Apply" },
        { key: "/leave/approvals", label: "Approvals", hidden: !canPerform(Permission.HR_UPDATE_EMPLOYEE) },
        { key: "/leave/balances", label: "Balances" },
      ],
    },
    {
      key: "payroll-menu",
      icon: <DollarOutlined />,
      label: "Payroll",
      hidden: !canPerform(Permission.FINANCE_VIEW_ACCOUNTS),
      children: [
        { key: "/payroll/runs", label: "Payroll Runs" },
        { key: "/payroll/salary-structures", label: "Salary Structures" },
        { key: "/payroll/payslips", label: "Payslips" },
      ],
    },
    {
      key: "finance-menu",
      icon: <BankOutlined />,
      label: "Finance",
      hidden: !canPerform(Permission.FINANCE_VIEW_ACCOUNTS),
      children: [
        { key: "/finance/chart-of-accounts", label: "Chart of Accounts" },
        { key: "/finance/journals", label: "Journals" },
        { key: "/finance/invoices", label: "Invoices", hidden: !canPerform(Permission.FINANCE_VIEW_INVOICES) },
        { key: "/finance/bills", label: "Bills" },
        { key: "/finance/banking", label: "Banking" },
        { key: "/finance/reports", label: "Reports" },
      ],
    },
    {
      key: "procurement-menu",
      icon: <ShoppingOutlined />,
      label: "Procurement",
      children: [
        { key: "/procurement/requisitions", label: "Requisitions" },
        { key: "/procurement/purchase-orders", label: "Purchase Orders" },
        { key: "/procurement/vendors", label: "Vendors" },
      ],
    },
    {
      key: "inventory-menu",
      icon: <InboxOutlined />,
      label: "Inventory",
      hidden: !canPerform(Permission.INVENTORY_VIEW),
      children: [
        { key: "/inventory/products", label: "Products" },
        { key: "/inventory/warehouses", label: "Warehouses" },
        { key: "/inventory/movements", label: "Movements" },
      ],
    },
    {
      key: "sales-menu",
      icon: <ShoppingCartOutlined />,
      label: "Sales & CRM",
      hidden: !canPerform(Permission.SALES_VIEW_LEADS),
      children: [
        { key: "/sales/deals", label: "Deals" },
        { key: "/sales/leads", label: "Leads" },
        { key: "/sales/opportunities", label: "Opportunities" },
        { key: "/sales/customers", label: "Customers" },
        { key: "/sales/contacts", label: "Contacts" },
        { key: "/sales/quotations", label: "Quotations" },
        { key: "/sales/orders", label: "Orders" },
        { key: "/sales/analytics", label: "Analytics" },
      ],
    },
    {
      key: "projects-menu",
      icon: <ProjectOutlined />,
      label: "Projects",
      hidden: !canPerform(Permission.PROJECTS_VIEW),
      children: [
        { key: "/projects", label: "Overview" },
        { key: "/projects/tasks", label: "Tasks" },
      ],
    },
    {
      key: "system-menu",
      icon: <SettingOutlined />,
      label: "System",
      hidden: !isAdmin,
      children: [
        { key: "/system/users", label: "Users & Invites" },
        { key: "/settings", label: "Global Settings" },
      ],
    },
    {
      key: "/documents",
      icon: <FileOutlined />,
      label: "Documents",
    },
    {
      key: "/assets",
      icon: <AuditOutlined />,
      label: "Assets",
    },
    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: "Reports",
    },
    {
      type: "divider" as const,
    },
    {
      key: "/settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
  ];

  // Recursively filter hidden items
  const filterMenuItems = (items: any[]) => {
    return items
      .filter(item => !item.hidden)
      .map(item => {
        if (item.children) {
          return { ...item, children: filterMenuItems(item.children) };
        }
        return item;
      });
  };

  const filteredMenuItems = filterMenuItems(menuItems);

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={() => dispatch(toggleSidebar())}
      width={256}
      collapsedWidth={64}
      style={{
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
        overflow: "auto",
        zIndex: 100,
      }}
      theme="dark"
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "0" : "0 20px",
          gap: 10,
          borderBottom: "1px solid rgba(61, 74, 99, 0.15)",
        }}
      >
        <Image
          src="/logo.png"
          alt="Nurox"
          width={collapsed ? 28 : 32}
          height={collapsed ? 28 : 32}
          style={{ transition: "all 0.2s ease" }}
        />
        {!collapsed && (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              fontWeight: 600,
              color: "#c3f5ff",
              letterSpacing: "-0.01em",
            }}
          >
            nurox
          </span>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        defaultOpenKeys={[]}
        items={filteredMenuItems}
        onClick={({ key }) => {
          if (key.startsWith("/")) {
            router.push(key);
          }
        }}
        style={{ border: "none", marginTop: 8 }}
      />
    </Sider>
  );
}
