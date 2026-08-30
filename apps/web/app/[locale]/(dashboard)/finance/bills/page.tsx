"use client";

import React, { useState } from "react";
import {
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  message,
  Tag,
} from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useGetBillsQuery,
  useCreateBillMutation,
  useGetAccountsQuery,
  useUpdateBillStatusMutation,
} from "@/store/api/financeApi";
import dayjs from "dayjs";

const { Option } = Select;

export default function BillsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetBillsQuery({ page, limit: 10 });
  const { data: accounts } = useGetAccountsQuery();
  const [createBill] = useCreateBillMutation();
  const [updateStatus] = useUpdateBillStatusMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      const payload = {
        ...values,
        issueDate: values.issueDate.toISOString(),
        dueDate: values.dueDate.toISOString(),
      };
      await createBill(payload).unwrap();
      message.success("Bill recorded successfully");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to record bill");
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      await updateStatus({ id, status: "PAID" }).unwrap();
      message.success("Bill marked as PAID");
    } catch (err: any) {
      message.error(err.data?.message || "Failed to update status");
    }
  };

  const columns = [
    { title: "Bill #", dataIndex: "billNumber" },
    { title: "Vendor", dataIndex: "vendorName" },
    {
      title: "Issue Date",
      dataIndex: "issueDate",
      render: (d: string) => dayjs(d).format("YYYY-MM-DD"),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (d: string) => dayjs(d).format("YYYY-MM-DD"),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      render: (v: number) => `$${(v || 0).toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s: string) => {
        let color = "default";
        if (s === "PAID") color = "success";
        if (s === "PARTIALLY_PAID") color = "warning";
        if (s === "OVERDUE") color = "error";
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small">
            View
          </Button>
          {record.status !== "PAID" && (
            <Button size="small" onClick={() => handleMarkPaid(record.id)}>
              Mark Paid
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Bills"
        subtitle="Manage vendor bills and accounts payable"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Bills" },
        ]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            Record Bill
          </Button>
        }
      />

      <div className="bg-white p-4 rounded shadow-sm">
        <DataTable
          columns={columns}
          dataSource={data?.data}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: data?.meta?.total,
            current: page,
            pageSize: 10,
            onChange: (p: number) => setPage(p),
          }}
        />
      </div>

      <Modal
        title="Record Vendor Bill"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="billNumber"
              label="Bill Number"
              rules={[{ required: true }]}
            >
              <Input placeholder="VND-2026-001" />
            </Form.Item>
            <Form.Item
              name="vendorName"
              label="Vendor Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="issueDate"
              label="Issue Date"
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item
              name="dueDate"
              label="Due Date"
              rules={[{ required: true }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <Form.List
            name="lines"
            initialValue={[
              { description: "", quantity: 1, unitPrice: 0, accountId: "" },
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "accountId"]}
                      rules={[{ required: true, message: "Missing account" }]}
                    >
                      <Select
                        placeholder="Account"
                        style={{ width: 200 }}
                        showSearch
                        optionFilterProp="children"
                      >
                        {(Array.isArray(accounts) ? accounts : [])
                          .filter(
                            (a) => a.type === "EXPENSE" || a.type === "ASSET",
                          )
                          .map((a) => (
                            <Option key={a.id} value={a.id}>
                              {a.code} - {a.name}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "description"]}
                      rules={[
                        { required: true, message: "Missing description" },
                      ]}
                    >
                      <Input placeholder="Description" style={{ width: 250 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[{ required: true, message: "Missing quantity" }]}
                    >
                      <InputNumber placeholder="Qty" min={1} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "unitPrice"]}
                      rules={[{ required: true, message: "Missing price" }]}
                    >
                      <InputNumber placeholder="Price" min={0} precision={2} />
                    </Form.Item>
                    <Button
                      type="text"
                      danger
                      onClick={() => remove(name)}
                      icon={<PlusOutlined rotate={45} />}
                    />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
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

// Simple wrapper since DataTable might be a local component we want to keep using or replace
function DataTable({ columns, dataSource, rowKey, loading, pagination }: any) {
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      loading={loading}
      pagination={pagination}
    />
  );
}
import { Table } from "antd";
