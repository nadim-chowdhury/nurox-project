"use client";

import React, { useState } from "react";
import { Card, Table, Tag, Button, Modal, Form, Input, InputNumber, Space, Switch, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useGetTaxConfigsQuery, useCreateTaxConfigMutation } from "@/store/api/payrollApi";

export default function TaxConfigPage() {
  const { data: configs, isLoading } = useGetTaxConfigsQuery();
  const [createConfig, { isLoading: isCreating }] = useCreateTaxConfigMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      await createConfig(values).unwrap();
      message.success("Tax configuration created!");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to create config");
    }
  };

  const columns = [
    {
      title: "Fiscal Year",
      dataIndex: "fiscalYear",
      key: "fiscalYear",
    },
    {
      title: "Exempt Threshold",
      dataIndex: "taxExemptThreshold",
      render: (v: number) => `$${Number(v).toLocaleString()}`,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (active: boolean) => <Tag color={active ? "green" : "default"}>{active ? "ACTIVE" : "INACTIVE"}</Tag>,
    },
    {
        title: "Brackets",
        dataIndex: "brackets",
        render: (brackets: any[]) => (
            <div className="text-xs">
                {brackets.map((b, i) => (
                    <div key={i}>Up to ${b.upperLimit?.toLocaleString() || "Rest"} @ {b.rate}%</div>
                ))}
            </div>
        )
    }
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Tax Configuration"
        subtitle="Manage fiscal year tax brackets and thresholds"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Payroll", href: "/payroll" },
          { label: "Tax Config" },
        ]}
        extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                New Config
            </Button>
        }
      />

      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <Table
          columns={columns}
          dataSource={configs}
          rowKey="id"
          loading={isLoading}
        />
      </Card>

      <Modal
        title="Create Tax Configuration"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={isCreating}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ isActive: true }}>
            <div className="grid grid-cols-2 gap-4">
                <Form.Item name="fiscalYear" label="Fiscal Year" rules={[{ required: true }]}>
                    <Input placeholder="e.g. 2025-26" />
                </Form.Item>
                <Form.Item name="taxExemptThreshold" label="Exempt Threshold" rules={[{ required: true }]}>
                    <InputNumber style={{ width: "100%" }} />
                </Form.Item>
            </div>
            <Form.Item name="isActive" label="Set as Active" valuePropName="checked">
                <Switch />
            </Form.Item>

            <Divider titlePlacement="left">Tax Brackets</Divider>
            <Form.List name="brackets">
                {(fields, { add, remove }) => (
                    <>
                        {fields.map(({ key, name, ...restField }) => (
                            <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                                <Form.Item {...restField} name={[name, "upperLimit"]} label="Upper Limit (Null for Rest)">
                                    <InputNumber style={{ width: 150 }} />
                                </Form.Item>
                                <Form.Item {...restField} name={[name, "rate"]} label="Rate (%)" rules={[{ required: true }]}>
                                    <InputNumber style={{ width: 100 }} />
                                </Form.Item>
                                <DeleteOutlined onClick={() => remove(name)} style={{ color: "red" }} />
                            </Space>
                        ))}
                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                            Add Bracket
                        </Button>
                    </>
                )}
            </Form.List>
        </Form>
      </Modal>
    </div>
  );
}
