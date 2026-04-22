"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Input, Button, Table, Space, DatePicker, Typography, Card, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { journalEntrySchema } from "@repo/shared-schemas";
import dayjs from "dayjs";

const { Text } = Typography;

export function JournalEntryForm() {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      entryDate: dayjs().toISOString(),
      description: "",
      status: "DRAFT",
      lines: [
        { accountId: "", debit: 0, credit: 0 },
        { accountId: "", debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const lines = watch("lines");
  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const onSubmit = (data: any) => {
    console.log("Submit Journal:", data);
    message.success("Journal entry submitted successfully");
  };

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Card title="New Journal Entry" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Entry Date" required>
              <DatePicker
                style={{ width: "100%" }}
                defaultValue={dayjs()}
                onChange={(date) => setValue("entryDate", date?.toISOString() || "")}
              />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item label="Description">
              <Input placeholder="Reference description..." />
            </Form.Item>
          </Col>
        </Row>

        <Table
          dataSource={fields}
          pagination={false}
          rowKey="id"
          columns={[
            {
              title: "Account",
              dataIndex: "accountId",
              render: (_, __, index) => (
                <Input placeholder="Select Account" />
              ),
            },
            {
              title: "Description",
              dataIndex: "description",
              render: (_, __, index) => <Input placeholder="Line memo" />,
            },
            {
              title: "Debit",
              dataIndex: "debit",
              width: 150,
              render: (_, __, index) => (
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              ),
            },
            {
              title: "Credit",
              dataIndex: "credit",
              width: 150,
              render: (_, __, index) => (
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                />
              ),
            },
            {
              title: "",
              width: 50,
              render: (_, __, index) => (
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => remove(index)}
                  disabled={fields.length <= 2}
                />
              ),
            },
          ]}
          footer={() => (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button type="dashed" icon={<PlusOutlined />} onClick={() => append({ accountId: "", debit: 0, credit: 0 })}>
                Add Line
              </Button>
              <Space size="large">
                <Text>Total Debit: <Text strong>${totalDebit.toFixed(2)}</Text></Text>
                <Text>Total Credit: <Text strong>${totalCredit.toFixed(2)}</Text></Text>
                {!isBalanced && <Text type="danger">Out of Balance</Text>}
              </Space>
            </div>
          )}
        />

        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
          <Space>
            <Button>Save Draft</Button>
            <Button type="primary" htmlType="submit" disabled={!isBalanced}>
              Post Journal
            </Button>
          </Space>
        </div>
      </Card>
    </Form>
  );
}

import { Row, Col } from "antd";
