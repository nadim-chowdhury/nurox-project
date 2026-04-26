"use client";

import { useState } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Switch, message, Tabs, Card } from "antd";
import { PlusOutlined, LockOutlined } from "@ant-design/icons";
import { useGetTaxRatesQuery, useCreateTaxRateMutation, useClosePeriodMutation } from "@/store/api/financeApi";

export default function FinanceSettings() {
  const { data: taxRates, isLoading: trLoading } = useGetTaxRatesQuery();
  const [createTaxRate] = useCreateTaxRateMutation();
  const [closePeriod] = useClosePeriodMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreateTaxRate = async (values: any) => {
    try {
      await createTaxRate(values).unwrap();
      message.success("Tax rate created");
      setIsModalOpen(false);
      form.resetFields();
    } catch (_err: any) {
      message.error("Failed to create tax rate");
    }
  };

  const handleClosePeriod = async () => {
      Modal.confirm({
          title: "Are you sure you want to close this period?",
          content: "This will lock all transactions for the period. This action cannot be easily undone.",
          onOk: async () => {
              try {
                  // Mock ID for current period
                  await closePeriod("current-period-uuid").unwrap();
                  message.success("Period closed and locked.");
              } catch (_err) {
                  message.error("Failed to close period.");
              }
          }
      });
  };

  const taxRateColumns = [
    { title: "Name", dataIndex: "name" },
    { title: "Rate (%)", dataIndex: "rate", render: (val: number) => `${val}%` },
    { title: "Description", dataIndex: "description" },
    { title: "Active", dataIndex: "isActive", render: (val: boolean) => <Switch checked={val} disabled /> },
  ];

  const settingsTabs = [
      {
          key: "tax-rates",
          label: "Tax Rates (VAT/GST)",
          children: (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Manage Tax Rates</h3>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>Add Tax Rate</Button>
                </div>
                <Table dataSource={taxRates} columns={taxRateColumns} rowKey="id" loading={trLoading} />
            </div>
          )
      },
      {
          key: "accounting-periods",
          label: "Accounting Periods",
          children: (
              <div className="space-y-4">
                  <h3 className="text-lg font-medium">Period Closing</h3>
                  <Card>
                      <div className="flex justify-between items-center">
                          <div>
                              <div className="font-bold">Current Period: April 2026</div>
                              <div className="text-gray-500">Status: OPEN</div>
                          </div>
                          <Button danger icon={<LockOutlined />} onClick={handleClosePeriod}>Close Period</Button>
                      </div>
                  </Card>
              </div>
          )
      }
  ];

  return (
    <div>
      <Tabs items={settingsTabs} />

      <Modal
        title="Add Tax Rate"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateTaxRate}>
          <Form.Item name="name" label="Tax Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Standard VAT" />
          </Form.Item>
          <Form.Item name="rate" label="Rate (%)" rules={[{ required: true }]}>
            <InputNumber className="w-full" min={0} max={100} precision={2} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
