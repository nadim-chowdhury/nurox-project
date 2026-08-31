"use client";

import { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Space,
  DatePicker,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useGetRecurringInvoicesQuery,
  useCreateRecurringInvoiceMutation,
} from "@/store/api/financeApi";
import dayjs from "dayjs";

const { Option } = Select;

export default function RecurringInvoices() {
  const { data: recurring, isLoading } = useGetRecurringInvoicesQuery();
  const [createRecurring] = useCreateRecurringInvoiceMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createRecurring({
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate?.toISOString(),
      }).unwrap();
      message.success("Recurring invoice template created");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to create template");
    }
  };

  const columns = [
    { title: "Customer", dataIndex: "customerName" },
    {
      title: "Frequency",
      dataIndex: "frequency",
      render: (f: string) => <Tag color="blue">{f}</Tag>,
    },
    {
      title: "Next Run",
      dataIndex: "nextRunDate",
      render: (d: string) => dayjs(d).format("YYYY-MM-DD"),
    },
    {
      title: "Status",
      dataIndex: "isActive",
      render: (active: boolean) => (
        <Tag color={active ? "green" : "red"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space>
          <Button size="small" icon={<PlayCircleOutlined />}>
            Run Now
          </Button>
          <Button size="small" icon={<DeleteOutlined />} danger />
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Recurring Invoices"
        subtitle="Automated subscription billing"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Recurring Invoices" },
        ]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            New Template
          </Button>
        }
      />

      <Table
        dataSource={recurring}
        columns={columns}
        rowKey="id"
        loading={isLoading}
      />

      <Modal
        title="New Recurring Invoice Template"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="customerName"
              label="Customer Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="customerEmail"
              label="Customer Email"
              rules={[{ required: true, type: "email" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="frequency"
              label="Frequency"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="WEEKLY">Weekly</Option>
                <Option value="MONTHLY">Monthly</Option>
                <Option value="QUARTERLY">Quarterly</Option>
                <Option value="YEARLY">Yearly</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={[{ required: true }]}
              initialValue={dayjs()}
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </div>

          <Form.List
            name="lines"
            initialValue={[{ description: "", quantity: 1, unitPrice: 0 }]}
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
                      name={[name, "description"]}
                      rules={[
                        { required: true, message: "Missing description" },
                      ]}
                    >
                      <Input placeholder="Description" style={{ width: 300 }} />
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
                      icon={<DeleteOutlined />}
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
