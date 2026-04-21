"use client";

import { ReactNode } from "react";
import { Tabs } from "antd";
import { useRouter, usePathname } from "next/navigation";
import { 
  BarChartOutlined, 
  BookOutlined, 
  FileTextOutlined, 
  WalletOutlined, 
  AppstoreOutlined,
  SwapOutlined,
  SettingOutlined
} from "@ant-design/icons";

interface FinanceLayoutProps {
  children: ReactNode;
}

export default function FinanceLayout({ children }: FinanceLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    {
      key: "dashboard",
      label: "Overview",
      icon: <AppstoreOutlined />,
    },
    {
      key: "accounts",
      label: "Chart of Accounts",
      icon: <BookOutlined />,
    },
    {
      key: "journals",
      label: "Journals",
      icon: <FileTextOutlined />,
    },
    {
      key: "invoices",
      label: "Invoices",
      icon: <FileTextOutlined />,
    },
    {
      key: "bills",
      label: "Bills",
      icon: <WalletOutlined />,
    },
    {
      key: "reports",
      label: "Reports",
      icon: <BarChartOutlined />,
    },
    {
      key: "reconciliation",
      label: "Reconciliation",
      icon: <SwapOutlined />,
    },
    {
      key: "settings",
      label: "Settings",
      icon: <SettingOutlined />,
    },
  ];

  const activeKey = pathname.split("/").pop() || "dashboard";

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Finance & Accounting</h1>
        <p className="text-gray-500">Manage your organization's financial health and compliance.</p>
      </div>

      <Tabs
        activeKey={activeKey}
        items={items}
        onChange={(key) => router.push(`/finance/${key}`)}
        className="mb-6"
      />

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {children}
      </div>
    </div>
  );
}
