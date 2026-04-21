"use client";

import React from "react";
import { Card, Tag, Button, Tree, Space, Typography, Spin } from "antd";
import { PlusOutlined, FolderOutlined, FileTextOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetAccountsTreeQuery } from "@/store/api/financeApi";

const { Text } = Typography;

const formatTreeData = (data: any[]): any[] => {
  return data.map((item) => ({
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
    children: item.children ? formatTreeData(item.children) : [],
  }));
};

export default function ChartOfAccountsPage() {
  const { data, isLoading } = useGetAccountsTreeQuery();

  if (isLoading) return <Spin size="large" />;

  const treeData = data ? formatTreeData(data) : [];

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
