"use client";

import React, { useState } from "react";
import { Card, Tag, Button, Tree, Row, Col, Space, Typography } from "antd";
import { PlusOutlined, FolderOutlined, FileTextOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";

const { Text } = Typography;

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  balance: number;
  parentId: string | null;
}

const mockAccounts: Account[] = [
  { id: "1", code: "1000", name: "Current Assets", type: "ASSET", balance: 1237400, parentId: null },
  { id: "2", code: "1010", name: "Cash on Hand", type: "ASSET", balance: 892400, parentId: "1" },
  { id: "3", code: "1020", name: "Accounts Receivable", type: "ASSET", balance: 345000, parentId: "1" },
  { id: "4", code: "2000", name: "Liabilities", type: "LIABILITY", balance: 187000, parentId: null },
  { id: "5", code: "2100", name: "Accounts Payable", type: "LIABILITY", balance: 187000, parentId: "4" },
];

const buildTree = (data: Account[], parentId: string | null = null): any[] => {
  return data
    .filter((item) => item.parentId === parentId)
    .map((item) => ({
      key: item.id,
      title: (
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <span>
            <Text strong>{item.code}</Text> - {item.name}
          </span>
          <Space>
            <Tag color={item.type === "ASSET" ? "cyan" : "orange"}>{item.type}</Tag>
            <Text type={item.balance >= 0 ? "success" : "danger"}>
              ${Math.abs(item.balance).toLocaleString()}
            </Text>
          </Space>
        </Space>
      ),
      icon: item.parentId === null ? <FolderOutlined /> : <FileTextOutlined />,
      children: buildTree(data, item.id),
    }));
};

export default function ChartOfAccountsPage() {
  const treeData = buildTree(mockAccounts);

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Chart of Accounts"
        subtitle="General ledger account structure"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Chart of Accounts" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Account
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <Tree
          showIcon
          defaultExpandAll
          treeData={treeData}
          style={{ background: "transparent" }}
        />
      </Card>
    </div>
  );
}
