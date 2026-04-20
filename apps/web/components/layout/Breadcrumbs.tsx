"use client";

import React from "react";
import { Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Auto-generated breadcrumbs from URL path segments.
 * Converts "/hr/employees/new" → Home > HR > Employees > New
 */

const LABEL_MAP: Record<string, string> = {
  dashboard: "Dashboard",
  hr: "HR",
  payroll: "Payroll",
  finance: "Finance",
  inventory: "Inventory",
  sales: "Sales & CRM",
  projects: "Projects",
  settings: "Settings",
  employees: "Employees",
  departments: "Departments",
  designations: "Designations",
  performance: "Performance",
  runs: "Payroll Runs",
  "salary-structures": "Salary Structures",
  payslips: "Payslips",
  "chart-of-accounts": "Chart of Accounts",
  journals: "Journals",
  invoices: "Invoices",
  bills: "Bills",
  banking: "Banking",
  products: "Products",
  warehouses: "Warehouses",
  movements: "Movements",
  "stock-count": "Stock Count",
  deals: "Deals",
  customers: "Customers",
  leads: "Leads",
  tasks: "Tasks",
  attendance: "Attendance",
  leave: "Leave",
  recruitment: "Recruitment",
  procurement: "Procurement",
  assets: "Assets",
  documents: "Documents",
  reports: "Reports",
  new: "New",
  edit: "Edit",
};

function formatSegment(segment: string): string {
  return (
    LABEL_MAP[segment] ??
    segment.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const items = [
    {
      title: (
        <Link href="/dashboard">
          <HomeOutlined style={{ fontSize: 14 }} />
        </Link>
      ),
    },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const isLast = index === segments.length - 1;
      const label = formatSegment(segment);

      return {
        title: isLast ? (
          <span style={{ color: "var(--color-on-surface)" }}>{label}</span>
        ) : (
          <Link
            href={href}
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            {label}
          </Link>
        ),
      };
    }),
  ];

  return (
    <Breadcrumb
      items={items}
      style={{ marginBottom: 0, fontSize: 13 }}
      separator={
        <span
          style={{ color: "var(--color-on-surface-variant)", opacity: 0.5 }}
        >
          /
        </span>
      }
    />
  );
}
