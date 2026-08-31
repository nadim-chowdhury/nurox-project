"use client";

import React, { useState, useEffect } from "react";
import { Row, Col, Card, Table, Select, Button, Space, Tag } from "antd";
import {
  BankOutlined,
  SwapOutlined,
  DollarOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  useGetBankAccountsQuery,
  useGetBankTransactionsQuery,
} from "@/store/api/financeApi";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

export default function BankingPage() {
  const { data: bankAccounts, isLoading: accountsLoading } =
    useGetBankAccountsQuery();
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<
    string | null
  >(null);
  const { data: transactions, isLoading: transactionsLoading } =
    useGetBankTransactionsQuery(selectedBankAccountId!, {
      skip: !selectedBankAccountId,
    });

  useEffect(() => {
    if (bankAccounts && bankAccounts.length > 0 && !selectedBankAccountId) {
      setSelectedBankAccountId(bankAccounts[0].id);
    }
  }, [bankAccounts, selectedBankAccountId]);

  const columns: ColumnsType<any> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (d: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "desc",
      render: (v: string) => (
        <span style={{ color: "var(--color-on-surface)", fontSize: 13 }}>
          {v}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: string) => (
        <Tag color={s === "RECONCILED" ? "green" : "orange"}>{s}</Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 140,
      align: "right" as const,
      render: (v: number) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: v >= 0 ? "#6dd58c" : "#ffb4ab",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {v >= 0 ? "+" : ""}
          {formatCurrency(v)}
        </span>
      ),
    },
  ];

  const selectedAccount = bankAccounts?.find(
    (a) => a.id === selectedBankAccountId,
  );

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Banking"
        subtitle="Bank account overview & transactions"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Banking" },
        ]}
        extra={
          <Space>
            <Select
              loading={accountsLoading}
              value={selectedBankAccountId}
              onChange={setSelectedBankAccountId}
              style={{ width: 250 }}
              placeholder="Select Bank Account"
            >
              {bankAccounts?.map((acc) => (
                <Option key={acc.id} value={acc.id}>
                  {acc.bankName} - {acc.accountNumber}
                </Option>
              ))}
            </Select>
            <Button icon={<UploadOutlined />}>Import Statement</Button>
          </Space>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <KpiCard
            title="Current Balance"
            value={formatCurrency(selectedAccount?.balance || 0)}
            prefix={<BankOutlined style={{ color: "#c3f5ff" }} />}
          />
        </Col>
        <Col xs={12} sm={8}>
          <KpiCard
            title="Account Number"
            value={selectedAccount?.accountNumber || "N/A"}
            prefix={<DollarOutlined style={{ color: "#6dd58c" }} />}
          />
        </Col>
        <Col xs={12} sm={8}>
          <KpiCard
            title="Bank Name"
            value={selectedAccount?.bankName || "N/A"}
            prefix={<SwapOutlined style={{ color: "#ffb4ab" }} />}
          />
        </Col>
      </Row>

      <Card
        title={
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-on-surface)",
              fontWeight: 600,
            }}
          >
            Recent Transactions
          </span>
        }
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey="id"
          loading={transactionsLoading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>
    </div>
  );
}
