"use client";

import { useState } from "react";
import { Table, Button, Modal, message, Tag, Space, Form, Input, DatePicker, InputNumber } from "antd";
import { PlusOutlined, EyeOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { 
  useGetInvoicesQuery, 
  useCreateInvoiceMutation, 
  useUpdateInvoiceStatusMutation 
} from "@/store/api/financeApi";
import dayjs from "dayjs";

export default function Invoices() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetInvoicesQuery({ page, limit: 10 });
  const [createInvoice] = useCreateInvoiceMutation();
  const [updateStatus] = useUpdateInvoiceStatusMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      const payload = {
        ...values,
        issueDate: values.issueDate.toISOString(),
        dueDate: values.dueDate.toISOString(),
      };
      await createInvoice(payload).unwrap();
      message.success("Invoice created successfully");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to create invoice");
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await updateStatus({ id, status: "PAID" }).unwrap();
      message.success("Invoice marked as PAID. Auto-journal posted.");
    } catch (err: any) {
      message.error(err.data?.message || "Failed to update status");
    }
  };

  const columns = [
    { title: "Invoice #", dataIndex: "invoiceNumber" },
    { title: "Customer", dataIndex: "customerName" },
    { title: "Issue Date", dataIndex: "issueDate", render: (date: string) => dayjs(date).format("YYYY-MM-DD") },
    { title: "Due Date", dataIndex: "dueDate", render: (date: string) => dayjs(date).format("YYYY-MM-DD") },
    { title: "Total Amount", dataIndex: "totalAmount", render: (val: number) => `$${val.toFixed(2)}` },
    { 
      title: "Status", 
      dataIndex: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "PAID") color = "success";
        if (status === "SENT") color = "processing";
        if (status === "OVERDUE") color = "error";
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small">View</Button>
          {record.status !== "PAID" && (
            <Button 
              icon={<CheckCircleOutlined />} 
              size="small" 
              type="primary"
              onClick={() => handleMarkPaid(record.id)}
            >
              Mark Paid
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Customer Invoices</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          Create Invoice
        </Button>
      </div>

      <Table
        dataSource={data?.data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.meta?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
      />

      <Modal
        title="Create New Invoice"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item name="invoiceNumber" label="Invoice Number" rules={[{ required: true }]}>
              <Input placeholder="INV-2026-001" />
            </Form.Item>
            <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="customerEmail" label="Customer Email">
              <Input type="email" />
            </Form.Item>
            <div className="grid grid-cols-2 gap-2">
              <Form.Item name="issueDate" label="Issue Date" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
              <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </div>
          </div>

          <Form.List name="lines" initialValue={[{ description: "", quantity: 1, unitPrice: 0 }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      rules={[{ required: true, message: 'Missing description' }]}
                    >
                      <Input placeholder="Description" style={{ width: 300 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true, message: 'Missing quantity' }]}
                    >
                      <InputNumber placeholder="Qty" min={1} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'unitPrice']}
                      rules={[{ required: true, message: 'Missing price' }]}
                    >
                      <InputNumber placeholder="Price" min={0} precision={2} />
                    </Form.Item>
                    <Button type="text" danger onClick={() => remove(name)} icon={<PlusOutlined rotate={45} />} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Line Item
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
