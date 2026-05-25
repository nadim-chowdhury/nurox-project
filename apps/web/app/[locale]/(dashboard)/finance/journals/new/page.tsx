"use client";

import React, { useMemo } from "react";
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
  Typography,
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
import { useForm, Controller, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { journalEntrySchema, type JournalEntryDto } from "@repo/shared-schemas";
import { useGetAccountsQuery, useCreateJournalMutation } from "@/store/api/financeApi";
import { RichTextEditor } from "@/components/common/RichTextEditor";
import dayjs from "dayjs";

const { Text } = Typography;
const labelStyle = { color: "var(--color-on-surface-variant)", fontSize: 13 };

export default function NewJournalPage() {
  const router = useRouter();
  const { data: accountsData } = useGetAccountsQuery();
  const [createJournal, { isLoading: isSubmitting }] = useCreateJournalMutation();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<JournalEntryDto>({
    resolver: zodResolver(journalEntrySchema) as any,
    defaultValues: {
      entryDate: dayjs().toISOString(),
      lines: [
        { accountId: "", debit: 0, credit: 0 },
        { accountId: "", debit: 0, credit: 0 },
      ],
    } as any,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const lines = watch("lines");
  const totalDebit = useMemo(() => lines?.reduce((a, l) => a + (l.debit || 0), 0) || 0, [lines]);
  const totalCredit = useMemo(() => lines?.reduce((a, l) => a + (l.credit || 0), 0) || 0, [lines]);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const onSubmit: SubmitHandler<JournalEntryDto> = async (data) => {
    try {
      await createJournal(data).unwrap();
      message.success("Journal entry posted successfully");
      router.push("/finance/journals");
    } catch (error: any) {
      message.error(error.data?.message || "Failed to post journal entry");
    }
  };

  const accountOptions = useMemo(
    () =>
      accountsData?.map((acc) => ({
        value: acc.id,
        label: `${acc.code} — ${acc.name}`,
      })) || [],
    [accountsData]
  );

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
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Form.Item label={<span style={labelStyle}>Date</span>} required>
              <Controller
                name="entryDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    style={{ width: "100%" }}
                    size="large"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(date) => field.onChange(date?.toISOString())}
                  />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={16}>
            <Form.Item label={<span style={labelStyle}>Reference</span>}>
              <Controller
                name="reference"
                control={control}
                render={({ field }) => (
                  <Input {...field} value={field.value || ""} placeholder="JV-2026-001" size="large" />
                )}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label={<span style={labelStyle}>Narration / Memo</span>}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Provide a detailed explanation for this entry..."
                    height={150}
                  />
                )}
              />
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
          dataSource={fields}
          rowKey="id"
          pagination={false}
          size="middle"
          columns={[
            {
              title: "Account",
              key: "accountId",
              width: 300,
              render: (_: any, __: any, index: number) => (
                <Controller
                  name={`lines.${index}.accountId`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      showSearch
                      style={{ width: "100%" }}
                      options={accountOptions}
                      placeholder="Select account"
                      optionFilterProp="label"
                    />
                  )}
                />
              ),
            },
            {
              title: "Description",
              key: "description",
              width: 300,
              render: (_: any, __: any, index: number) => (
                <Controller
                  name={`lines.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <Input {...field} value={field.value || ""} placeholder="Line description" />
                  )}
                />
              ),
            },
            {
              title: "Debit",
              key: "debit",
              width: 150,
              render: (_: any, __: any, index: number) => (
                <Controller
                  name={`lines.${index}.debit`}
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: "100%" }}
                      min={0}
                      formatter={(v) =>
                        `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(v) => Number(v!.replace(/\$\s?|(,*)/g, ""))}
                    />
                  )}
                />
              ),
            },
            {
              title: "Credit",
              key: "credit",
              width: 150,
              render: (_: any, __: any, index: number) => (
                <Controller
                  name={`lines.${index}.credit`}
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      style={{ width: "100%" }}
                      min={0}
                      formatter={(v) =>
                        `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(v) => Number(v!.replace(/\$\s?|(,*)/g, ""))}
                    />
                  )}
                />
              ),
            },
            {
              title: "",
              key: "actions",
              width: 50,
              render: (_: any, __: any, index: number) =>
                fields.length > 2 ? (
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => remove(index)}
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
                padding: "8px 16px"
              }}
            >
              <Button type="dashed" icon={<PlusOutlined />} onClick={() => append({ accountId: "", debit: 0, credit: 0 })}>
                Add Line
              </Button>
              <Space size={32}>
                <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
                  Total Debit:{" "}
                  <strong style={{ color: "#6dd58c", fontFamily: "var(--font-display)" }}>
                    {formatCurrency(totalDebit)}
                  </strong>
                </span>
                <span style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}>
                  Total Credit:{" "}
                  <strong style={{ color: "#c3f5ff", fontFamily: "var(--font-display)" }}>
                    {formatCurrency(totalCredit)}
                  </strong>
                </span>
                {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
                  <Text type="danger" strong>
                    ⚠ Unbalanced (Diff: {formatCurrency(Math.abs(totalDebit - totalCredit))})
                  </Text>
                )}
                {isBalanced && (
                  <Text type="success" strong>✓ Balanced</Text>
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
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
          disabled={!isBalanced}
        >
          Post Journal Entry
        </Button>
      </div>
      {Object.keys(errors).length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text type="danger">Please fix the errors before posting: {JSON.stringify(errors)}</Text>
        </div>
      )}
    </div>
  );
}
