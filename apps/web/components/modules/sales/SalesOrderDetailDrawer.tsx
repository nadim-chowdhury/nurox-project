"use client";

import React from "react";
import {
  Drawer,
  Descriptions,
  Button,
  Space,
  Modal,
  Form,
  Input,
  DatePicker,
  message,
  Table,
  Tag,
} from "antd";
import dayjs from "dayjs";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  useGetSalesOrderQuery,
  useConfirmSalesOrderMutation,
  useCreateInvoiceFromSalesOrderMutation,
  calcSalesLineTotal,
  type SalesOrderRecord,
} from "@/store/api/salesApi";

interface SalesOrderDetailDrawerProps {
  orderId: string | null;
  onClose: () => void;
}

export function SalesOrderDetailDrawer({
  orderId,
  onClose,
}: SalesOrderDetailDrawerProps) {
  const {
    data: order,
    isLoading,
    isFetching,
  } = useGetSalesOrderQuery(orderId ?? "", { skip: !orderId });
  const [confirmOrder, { isLoading: confirming }] =
    useConfirmSalesOrderMutation();
  const [createInvoice, { isLoading: invoicing }] =
    useCreateInvoiceFromSalesOrderMutation();
  const [invoiceOpen, setInvoiceOpen] = React.useState(false);
  const [form] = Form.useForm();

  const handleConfirm = async () => {
    if (!orderId) return;
    try {
      await confirmOrder(orderId).unwrap();
      message.success("Sales order confirmed");
    } catch (err: unknown) {
      const e = err as { data?: { message?: string | string[] } };
      const msg = e.data?.message;
      message.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : (msg ?? "Failed to confirm order"),
      );
    }
  };

  const handleInvoice = async (values: {
    sellerName: string;
    sellerBin: string;
    sellerAddress: string;
    buyerName?: string;
    buyerBin?: string;
    buyerAddress?: string;
    dueDate?: dayjs.Dayjs;
    vehicleNumber?: string;
  }) => {
    if (!orderId) return;
    try {
      const result = await createInvoice({
        id: orderId,
        body: {
          sellerName: values.sellerName,
          sellerBin: values.sellerBin,
          sellerAddress: values.sellerAddress,
          buyerName: values.buyerName,
          buyerBin: values.buyerBin,
          buyerAddress: values.buyerAddress,
          vehicleNumber: values.vehicleNumber,
          dueDate: values.dueDate?.toISOString(),
        },
      }).unwrap();
      message.success(`Invoice ${result.invoiceNumber} created`);
      setInvoiceOpen(false);
      form.resetFields();
    } catch (err: unknown) {
      const e = err as { data?: { message?: string | string[] } };
      const msg = e.data?.message;
      message.error(
        Array.isArray(msg)
          ? msg.join(", ")
          : (msg ?? "Failed to create invoice"),
      );
    }
  };

  const openInvoiceModal = (record: SalesOrderRecord) => {
    form.setFieldsValue({
      sellerName: "NUROX Demo Ltd",
      sellerBin: "000000000-0000",
      sellerAddress: "Dhaka, Bangladesh",
      buyerName: record.account?.name ?? "",
      buyerBin: record.account?.taxBin ?? "",
      buyerAddress: record.account?.billingAddress ?? "",
      dueDate: dayjs().add(30, "day"),
    });
    setInvoiceOpen(true);
  };

  const displayTotal =
    order?.totalAmount ??
    order?.lines?.reduce((sum, line) => sum + calcSalesLineTotal(line), 0) ??
    0;

  return (
    <>
      <Drawer
        title={order ? `Order ${order.soNumber}` : "Sales order"}
        open={!!orderId}
        onClose={onClose}
        width={640}
        loading={isLoading || isFetching}
        extra={
          order ? (
            <Space>
              {order.status === "DRAFT" && (
                <Button
                  type="primary"
                  loading={confirming}
                  onClick={handleConfirm}
                >
                  Confirm
                </Button>
              )}
              {order.status === "CONFIRMED" && !order.financeInvoiceId && (
                <Button
                  type="primary"
                  loading={invoicing}
                  onClick={() => openInvoiceModal(order)}
                >
                  Create invoice
                </Button>
              )}
            </Space>
          ) : null
        }
      >
        {order ? (
          <>
            <Descriptions column={1} size="small" bordered className="mb-4">
              <Descriptions.Item label="Status">
                <StatusTag status={order.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Customer">
                {order.account?.name ?? order.accountId}
              </Descriptions.Item>
              <Descriptions.Item label="Order date">
                {formatDate(order.orderDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Total">
                {formatCurrency(displayTotal, order.currency)}
              </Descriptions.Item>
              {order.financeInvoiceId ? (
                <Descriptions.Item label="Finance invoice">
                  <Tag color="green">{order.financeInvoiceId}</Tag>
                </Descriptions.Item>
              ) : null}
              {order.mushak63Id ? (
                <Descriptions.Item label="Mushak 6.3">
                  <Tag color="blue">{order.mushak63Id}</Tag>
                </Descriptions.Item>
              ) : null}
            </Descriptions>

            <Table
              size="small"
              rowKey="id"
              pagination={false}
              dataSource={order.lines ?? []}
              columns={[
                { title: "Product", dataIndex: "productId", ellipsis: true },
                { title: "Qty", dataIndex: "quantity", width: 70 },
                {
                  title: "Unit price",
                  dataIndex: "unitPrice",
                  width: 100,
                  render: (v: number) => formatCurrency(v, order.currency),
                },
                {
                  title: "Line total",
                  key: "total",
                  width: 110,
                  render: (_: unknown, line) =>
                    formatCurrency(calcSalesLineTotal(line), order.currency),
                },
              ]}
            />
          </>
        ) : null}
      </Drawer>

      <Modal
        title="Create invoice (Mushak 6.3)"
        open={invoiceOpen}
        onCancel={() => setInvoiceOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={invoicing}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleInvoice}>
          <Form.Item
            name="sellerName"
            label="Seller name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="sellerBin"
            label="Seller BIN"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="sellerAddress"
            label="Seller address"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="buyerName" label="Buyer name">
            <Input />
          </Form.Item>
          <Form.Item name="buyerBin" label="Buyer BIN">
            <Input />
          </Form.Item>
          <Form.Item name="buyerAddress" label="Buyer address">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="dueDate" label="Due date">
            <DatePicker className="w-full" />
          </Form.Item>
          <Form.Item name="vehicleNumber" label="Vehicle number">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
