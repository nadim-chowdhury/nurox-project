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
  useGetRecurringJournalsQuery,
  useCreateRecurringJournalMutation,
  useGetAccountsQuery,
} from "@/store/api/financeApi";
import dayjs from "dayjs";

const { Option } = Select;

export default function RecurringJournals() {
  const { data: recurring, isLoading } = useGetRecurringJournalsQuery();
  const { data: accounts } = useGetAccountsQuery();
  const [createRecurring] = useCreateRecurringJournalMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreate = async (values: any) => {
    try {
      await createRecurring({
        ...values,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate?.toISOString(),
      }).unwrap();
      message.success("Recurring journal template created");
      setIsModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to create template");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
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
        title="Recurring Journals"
        subtitle="Automated ledger entries"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Recurring Journals" },
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
        title="New Recurring Journal Template"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={() => form.submit()}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Template Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g., Monthly Rent Accrual" />
            </Form.Item>
            <Form.Item
              name="frequency"
              label="Frequency"
              rules={[{ required: true }]}
            >
              <Select>
                <Option value="DAILY">Daily</Option>
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
            <Form.Item name="currency" label="Currency" initialValue="USD">
              <Select>
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
                <Option value="GBP">GBP</Option>
                <Option value="BDT">BDT</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.List
            name="lines"
            initialValue={[{ accountId: "", debit: 0, credit: 0 }]}
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
                        style={{ width: 300 }}
                        showSearch
                        optionFilterProp="children"
                      >
                        {accounts?.map((acc) => (
                          <Option key={acc.id} value={acc.id}>
                            {acc.code} - {acc.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "debit"]}
                      rules={[{ required: true }]}
                    >
                      <InputNumber placeholder="Debit" min={0} precision={2} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "credit"]}
                      rules={[{ required: true }]}
                    >
                      <InputNumber placeholder="Credit" min={0} precision={2} />
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

          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
