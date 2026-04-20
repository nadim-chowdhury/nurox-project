"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Card,
  Row,
  Col,
  Space,
  Table,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/common/PageHeader";
import { formatCurrency } from "@/lib/utils";

const labelStyle = { color: "var(--color-on-surface-variant)", fontSize: 13 };

interface JournalLine {
  key: string;
  account: string;
  description: string;
  debit: number;
  credit: number;
}

export default function NewJournalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lines, setLines] = useState<JournalLine[]>([
    { key: "1", account: "", description: "", debit: 0, credit: 0 },
    { key: "2", account: "", description: "", debit: 0, credit: 0 },
  ]);

  const addLine = () =>
    setLines((prev) => [
      ...prev,
      {
        key: Date.now().toString(),
        account: "",
        description: "",
        debit: 0,
        credit: 0,
      },
    ]);
  const removeLine = (key: string) =>
    setLines((prev) => prev.filter((l) => l.key !== key));
  const updateLine = (
    key: string,
    field: keyof JournalLine,
    value: string | number,
  ) =>
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, [field]: value } : l)),
    );

  const totalDebit = lines.reduce((a, l) => a + l.debit, 0);
  const totalCredit = lines.reduce((a, l) => a + l.credit, 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async () => {
    if (!isBalanced) {
      message.error("Debits and credits must be equal");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success("Journal entry created");
      router.push("/finance/journals");
    }, 1000);
  };

  const accounts = [
    { value: "1000", label: "1000 — Cash" },
    { value: "1100", label: "1100 — Accounts Receivable" },
    { value: "2000", label: "2000 — Accounts Payable" },
    { value: "3000", label: "3000 — Owner's Equity" },
    { value: "4000", label: "4000 — Revenue" },
    { value: "5000", label: "5000 — COGS" },
    { value: "6000", label: "6000 — Operating Expenses" },
    { value: "6100", label: "6100 — Salary Expense" },
    { value: "6200", label: "6200 — Rent Expense" },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="New Journal Entry"
        subtitle="Create a manual journal entry"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Journals", href: "/finance/journals" },
          { label: "New" },
        ]}
        extra={
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push("/finance/journals")}
          >
            Back
          </Button>
        }
      />

      <Card
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          marginBottom: 24,
        }}
        styles={{ body: { padding: 24 } }}
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} sm={8}>
            <Form.Item label={<span style={labelStyle}>Date</span>}>
              <DatePicker style={{ width: "100%" }} size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item label={<span style={labelStyle}>Reference</span>}>
              <Input placeholder="JV-2026-001" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item label={<span style={labelStyle}>Memo</span>}>
              <Input placeholder="Monthly salary allocation" size="large" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <span
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-on-surface)",
              fontWeight: 600,
            }}
          >
            Line Items
          </span>
        }
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--ghost-border)",
          borderRadius: 4,
          marginBottom: 24,
        }}
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={lines}
          rowKey="key"
          pagination={false}
          size="middle"
          columns={[
            {
              title: "Account",
              key: "account",
              width: 250,
              render: (_, r) => (
                <Select
                  style={{ width: "100%" }}
                  options={accounts}
                  placeholder="Select account"
                  value={r.account || undefined}
                  onChange={(v) => updateLine(r.key, "account", v)}
                />
              ),
            },
            {
              title: "Description",
              key: "desc",
              width: 250,
              render: (_, r) => (
                <Input
                  placeholder="Line description"
                  value={r.description}
                  onChange={(e) =>
                    updateLine(r.key, "description", e.target.value)
                  }
                />
              ),
            },
            {
              title: "Debit",
              key: "debit",
              width: 150,
              render: (_, r) => (
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  value={r.debit}
                  onChange={(v) => updateLine(r.key, "debit", v ?? 0)}
                  formatter={(v) =>
                    `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              ),
            },
            {
              title: "Credit",
              key: "credit",
              width: 150,
              render: (_, r) => (
                <InputNumber
                  style={{ width: "100%" }}
                  min={0}
                  value={r.credit}
                  onChange={(v) => updateLine(r.key, "credit", v ?? 0)}
                  formatter={(v) =>
                    `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                />
              ),
            },
            {
              title: "",
              key: "actions",
              width: 50,
              render: (_, r) =>
                lines.length > 2 ? (
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => removeLine(r.key)}
                  />
                ) : null,
            },
          ]}
          footer={() => (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button type="dashed" icon={<PlusOutlined />} onClick={addLine}>
                Add Line
              </Button>
              <Space size={32}>
                <span
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 13,
                  }}
                >
                  Total Debit:{" "}
                  <strong
                    style={{
                      color: "#6dd58c",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {formatCurrency(totalDebit)}
                  </strong>
                </span>
                <span
                  style={{
                    color: "var(--color-on-surface-variant)",
                    fontSize: 13,
                  }}
                >
                  Total Credit:{" "}
                  <strong
                    style={{
                      color: "#c3f5ff",
                      fontFamily: "var(--font-display)",
                    }}
                  >
                    {formatCurrency(totalCredit)}
                  </strong>
                </span>
                {!isBalanced && totalDebit + totalCredit > 0 && (
                  <span
                    style={{ color: "#ffb4ab", fontSize: 12, fontWeight: 600 }}
                  >
                    ⚠ Unbalanced
                  </span>
                )}
                {isBalanced && (
                  <span
                    style={{ color: "#6dd58c", fontSize: 12, fontWeight: 600 }}
                  >
                    ✓ Balanced
                  </span>
                )}
              </Space>
            </div>
          )}
        />
      </Card>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <Button onClick={() => router.push("/finance/journals")}>Cancel</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={handleSubmit}
          disabled={!isBalanced}
        >
          Post Journal Entry
        </Button>
      </div>
    </div>
  );
}
