"use client";

import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Tag,
  message,
  Space,
  Card,
  Row,
  Col,
  Statistic,
} from "antd";
import { PlusOutlined, SwapOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import {
  useGetPettyCashFundsQuery,
  useCreatePettyCashFundMutation,
  useGetPettyCashTransactionsQuery,
  useRecordPettyCashTransactionMutation,
} from "@/store/api/financeApi";
import { formatCurrency, formatDate } from "@/lib/utils";
import dayjs from "dayjs";

const { Option } = Select;

export default function PettyCash() {
  const { data: funds, isLoading: fundsLoading } = useGetPettyCashFundsQuery();
  const [selectedFundId, setSelectedFundId] = useState<string | null>(null);
  const { data: transactions, isLoading: trxLoading } =
    useGetPettyCashTransactionsQuery(selectedFundId!, {
      skip: !selectedFundId,
    });

  const [createFund] = useCreatePettyCashFundMutation();
  const [recordTransaction] = useRecordPettyCashTransactionMutation();

  const [isFundModalOpen, setIsFundModalOpen] = useState(false);
  const [isTrxModalOpen, setIsTrxModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [trxForm] = Form.useForm();

  useEffect(() => {
    if (funds && funds.length > 0 && !selectedFundId) {
      setSelectedFundId(funds[0].id);
    }
  }, [funds, selectedFundId]);

  const handleCreateFund = async (values: any) => {
    try {
      await createFund(values).unwrap();
      message.success("Petty cash fund created");
      setIsFundModalOpen(false);
      form.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to create fund");
    }
  };

  const handleRecordTrx = async (values: any) => {
    try {
      await recordTransaction({
        ...values,
        fundId: selectedFundId,
        transactionDate: values.transactionDate.toISOString(),
      }).unwrap();
      message.success("Transaction recorded");
      setIsTrxModalOpen(false);
      trxForm.resetFields();
    } catch (err: any) {
      message.error(err.data?.message || "Failed to record transaction");
    }
  };

  const selectedFund = funds?.find((f) => f.id === selectedFundId);

  const columns = [
    {
      title: "Date",
      dataIndex: "transactionDate",
      render: (d: string) => formatDate(d),
    },
    { title: "Description", dataIndex: "description" },
    {
      title: "Type",
      dataIndex: "type",
      render: (t: string) => (
        <Tag color={t === "DISBURSEMENT" ? "red" : "green"}>{t}</Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      align: "right" as const,
      render: (val: number, record: any) => (
        <span
          style={{
            color: record.type === "DISBURSEMENT" ? "#ff4d4f" : "#52c41a",
          }}
        >
          {record.type === "DISBURSEMENT" ? "-" : "+"} {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: "Balance",
      dataIndex: "runningBalance",
      align: "right" as const,
      render: (val: number) => formatCurrency(val),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Petty Cash"
        subtitle="Small cash fund management"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Finance", href: "/finance" },
          { label: "Petty Cash" },
        ]}
        extra={
          <Space>
            <Select
              value={selectedFundId}
              onChange={setSelectedFundId}
              style={{ width: 200 }}
              loading={fundsLoading}
            >
              {funds?.map((f) => (
                <Option key={f.id} value={f.id}>
                  {f.name}
                </Option>
              ))}
            </Select>
            <Button
              icon={<PlusOutlined />}
              onClick={() => setIsFundModalOpen(true)}
            >
              New Fund
            </Button>
            <Button
              type="primary"
              icon={<SwapOutlined />}
              onClick={() => setIsTrxModalOpen(true)}
            >
              Record Transaction
            </Button>
          </Space>
        }
      />

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Current Balance"
              value={selectedFund?.balance || 0}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Custodian"
              value={selectedFund?.custodianName || "Not assigned"}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Status"
              value={selectedFund?.isActive ? "Active" : "Inactive"}
              valueStyle={{
                color: selectedFund?.isActive ? "#52c41a" : "#ff4d4f",
              }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Transaction History"
        size="small"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          dataSource={transactions}
          columns={columns}
          rowKey="id"
          loading={trxLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Create New Petty Cash Fund"
        open={isFundModalOpen}
        onCancel={() => setIsFundModalOpen(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateFund}>
          <Form.Item name="name" label="Fund Name" rules={[{ required: true }]}>
            <Input placeholder="e.g., Marketing Petty Cash" />
          </Form.Item>
          <Form.Item
            name="custodianName"
            label="Custodian Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Employee Name" />
          </Form.Item>
          <Form.Item
            name="initialBalance"
            label="Initial Balance"
            rules={[{ required: true }]}
          >
            <InputNumber className="w-full" min={0} precision={2} prefix="$" />
          </Form.Item>
          <Form.Item
            name="glAccountId"
            label="GL Account"
            rules={[{ required: true }]}
          >
            <Select placeholder="Link to GL account">
              {/* Should fetch accounts here */}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Record Petty Cash Transaction"
        open={isTrxModalOpen}
        onCancel={() => setIsTrxModalOpen(false)}
        onOk={() => trxForm.submit()}
      >
        <Form form={trxForm} layout="vertical" onFinish={handleRecordTrx}>
          <Form.Item
            name="transactionDate"
            label="Date"
            rules={[{ required: true }]}
            initialValue={dayjs()}
          >
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Select>
              <Option value="DISBURSEMENT">Disbursement (Expense)</Option>
              <Option value="REPLENISHMENT">Replenishment (Inflow)</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
            <InputNumber
              className="w-full"
              min={0.01}
              precision={2}
              prefix="$"
            />
          </Form.Item>
          <Form.Item name="reference" label="Reference / Voucher #">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
