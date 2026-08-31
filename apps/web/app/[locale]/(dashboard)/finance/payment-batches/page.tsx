"use client";

import { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  Tag,
  message,
  DatePicker,
} from "antd";
import { PlusOutlined, FileTextOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useGetPaymentBatchesQuery,
  useCreatePaymentBatchMutation,
  useGetBillsQuery,
} from "@/store/api/financeApi";
import { formatCurrency, formatDate } from "@/lib/utils";
import dayjs from "dayjs";

const { Option } = Select;

export default function PaymentBatches() {
  const { data: batches, isLoading: batchesLoading } =
    useGetPaymentBatchesQuery();
  const { data: bills } = useGetBillsQuery({ page: 1, limit: 100 });
  const [createBatch] = useCreatePaymentBatchMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const unpaidBills =
    bills?.data?.filter((b: any) => b.status !== "PAID") || [];

  const handleCreate = async (values: any) => {
    try {
      await createBatch({
        ...values,
        date: values.date.toISOString(),
      }).unwrap();
      message.success("Payment batch created and processed");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to create batch");
    }
  };

  const columns = [
    { title: "Batch Ref", dataIndex: "batchReference" },
    { title: "Date", dataIndex: "date", render: (d: string) => formatDate(d) },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      render: (v: number) => formatCurrency(v),
    },
    { title: "Count", dataIndex: "paymentCount" },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => (
        <Tag color={s === "COMPLETED" ? "green" : "blue"}>{s}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Button size="small" icon={<FileTextOutlined />}>
          Export Bank File
        </Button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Payment Batches"
        subtitle="Process bulk vendor payments"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Payment Batches" },
        ]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            New Batch
          </Button>
        }
      />

      <Table
        dataSource={batches}
        columns={columns}
        rowKey="id"
        loading={batchesLoading}
      />

      <Modal
        title="Create Bulk Payment Batch"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="date"
              label="Payment Date"
              rules={[{ required: true }]}
              initialValue={dayjs()}
            >
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              name="bankAccountId"
              label="Source Bank Account"
              rules={[{ required: true }]}
            >
              <Select placeholder="Select bank account">
                {/* Bank accounts should be fetched here */}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="billIds"
            label="Select Bills to Pay"
            rules={[{ required: true }]}
          >
            <Select mode="multiple" placeholder="Select unpaid bills">
              {unpaidBills.map((b: any) => (
                <Option key={b.id} value={b.id}>
                  {b.billNumber} - {b.vendorName} (
                  {formatCurrency(b.totalAmount)})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="notes" label="Batch Notes">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import { Input } from "antd";
