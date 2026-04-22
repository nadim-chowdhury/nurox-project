"use client";

import React, { useState } from "react";
import { Table, Tag, Button, Space, message, Modal, List, Badge, Form, Input, InputNumber, Select, Divider } from "antd";
import { 
  PlusOutlined, 
  MailOutlined, 
  EyeOutlined, 
  SafetyCertificateOutlined, 
  HistoryOutlined,
  DownloadOutlined,
  RollbackOutlined,
  DollarOutlined
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { 
  useSendPOMutation, 
  useVerifyMatchQuery,
  useCreateGRNMutation,
  useAllocateLandedCostMutation,
  useCreatePurchaseReturnMutation
} from "@/store/api/procurementApi";
import { formatCurrency } from "@/lib/utils";

const mockOrders = [
  {
    id: "1",
    poNumber: "PO-2026-001",
    vendorId: "v1",
    vendor: { name: "Global Logistics", id: "v1" },
    orderDate: "2026-04-20",
    grandTotal: 12500,
    status: "SENT",
    currency: "USD",
    version: 2,
    lines: [
      { id: "l1", productId: "p1", name: "Product A", quantity: 100, unitCost: 125, totalAmount: 12500, receivedQuantity: 0 }
    ],
    history: [
      { version: 1, date: "2026-04-19", note: "Original creation" }
    ]
  }
];

export default function PurchaseOrdersPage() {
  const [sendPO, { isLoading: isSending }] = useSendPOMutation();
  const [createGRN] = useCreateGRNMutation();
  const [allocateLandedCost] = useAllocateLandedCostMutation();
  const [createReturn] = useCreatePurchaseReturnMutation();

  const [matchPoId, setMatchPoId] = useState<string | null>(null);
  const [historyPo, setHistoryPo] = useState<any | null>(null);
  const [receiptPo, setReceiptPo] = useState<any | null>(null);
  const [landedCostGrnId, setLandedCostGrnId] = useState<string | null>(null);
  const [returnPo, setReturnPo] = useState<any | null>(null);

  const [grnForm] = Form.useForm();
  const [landedCostForm] = Form.useForm();
  const [returnForm] = Form.useForm();

  const { data: matchResult, isLoading: loadingMatch } = useVerifyMatchQuery(matchPoId!, {
    skip: !matchPoId,
  });

  const handleSend = async (id: string) => {
    try {
      await sendPO(id).unwrap();
      message.success("Purchase order sent to vendor");
    } catch (error) {
      message.error("Failed to send purchase order");
    }
  };

  const handleReceive = async (values: any) => {
    try {
      await createGRN({
        poId: receiptPo.id,
        status: "PENDING",
        receivedDate: new Date().toISOString(),
        receivedById: "current-user-id",
        lines: receiptPo.lines.map((l: any) => ({
          poLineId: l.id,
          productId: l.productId,
          receivedQuantity: values[`qty_${l.id}`],
          warehouseId: "wh-1",
          batchNumber: values.batchNumber,
        }))
      }).unwrap();
      message.success("Goods received successfully. Inventory updated.");
      setReceiptPo(null);
      grnForm.resetFields();
    } catch (error) {
      message.error("Failed to process receipt");
    }
  };

  const handleLandedCostSubmit = async (values: any) => {
    try {
      await allocateLandedCost({
        id: landedCostGrnId!,
        costs: [
          { type: "Freight", amount: values.freight },
          { type: "Duty", amount: values.duty },
        ],
      }).unwrap();
      message.success("Landed costs allocated successfully");
      setLandedCostGrnId(null);
      landedCostForm.resetFields();
    } catch (error) {
      message.error("Failed to allocate landed costs");
    }
  };

  const handleReturnSubmit = async (values: any) => {
    try {
      await createReturn({
        vendorId: returnPo.vendorId,
        poId: returnPo.id,
        reason: values.reason,
        items: returnPo.lines.map((l: any) => ({
          productId: l.productId,
          variantId: l.variantId,
          warehouseId: "wh-1",
          quantity: l.quantity,
        })),
      }).unwrap();
      message.success("Return processed and Debit Note created.");
      setReturnPo(null);
      returnForm.resetFields();
    } catch (error) {
      message.error("Failed to process return");
    }
  };

  const columns = [
    {
      title: "PO Number",
      dataIndex: "poNumber",
      key: "poNumber",
      render: (val: string) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    { title: "Vendor", dataIndex: ["vendor", "name"], key: "vendor" },
    { title: "Date", dataIndex: "orderDate", key: "orderDate" },
    {
      title: "Total",
      dataIndex: "grandTotal",
      key: "total",
      render: (val: number) => formatCurrency(val),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "blue";
        if (status === "SENT") color = "green";
        if (status === "DRAFT") color = "orange";
        if (status === "FULLY_RECEIVED") color = "cyan";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            size="small" 
            title="Receive Items (GRN)" 
            onClick={() => setReceiptPo(record)}
          />
          <Button 
            icon={<DollarOutlined />} 
            size="small" 
            title="Landed Costs" 
            onClick={() => setLandedCostGrnId(record.id)} // In real app, tied to GRN
          />
          <Button 
            icon={<SafetyCertificateOutlined />} 
            size="small" 
            title="3-Way Match Check"
            onClick={() => setMatchPoId(record.id)}
          />
          <Button 
            icon={<RollbackOutlined />} 
            size="small" 
            title="Purchase Return"
            danger
            onClick={() => setReturnPo(record)}
          />
          <Button icon={<HistoryOutlined />} size="small" onClick={() => setHistoryPo(record)} />
          {record.status === "DRAFT" && (
            <Button icon={<MailOutlined />} size="small" onClick={() => handleSend(record.id)} loading={isSending} />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Purchase Orders"
        subtitle="Manage end-to-end procurement lifecycle"
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Procurement", href: "/procurement" }, { label: "Orders" }]}
        extra={[<Button key="add" type="primary" icon={<PlusOutlined />}>Create PO</Button>]}
      />

      <Table dataSource={mockOrders} columns={columns} rowKey="id" />

      {/* GRN Modal */}
      <Modal
        title={`Goods Receipt Note — ${receiptPo?.poNumber}`}
        open={!!receiptPo}
        onCancel={() => setReceiptPo(null)}
        onOk={() => grnForm.submit()}
      >
        <Form form={grnForm} layout="vertical" onFinish={handleReceive}>
          <p>Record quantities for incoming items.</p>
          {receiptPo?.lines.map((line: any) => (
            <Form.Item key={line.id} name={`qty_${line.id}`} label={`${line.name} (Ordered: ${line.quantity})`} initialValue={line.quantity}>
              <InputNumber min={0} max={line.quantity} style={{ width: "100%" }} />
            </Form.Item>
          ))}
          <Form.Item name="batchNumber" label="Batch/Lot Number">
            <Input placeholder="Enter batch number" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 3-Way Match Modal */}
      <Modal
        title="3-Way Match Verification"
        open={!!matchPoId}
        onCancel={() => setMatchPoId(null)}
        footer={[<Button key="ok" onClick={() => setMatchPoId(null)}>Close</Button>]}
      >
        {loadingMatch ? "Verifying PO vs GRN vs Invoices..." : (
          <div>
            <Badge status={matchResult?.isMatch ? "success" : "error"} text={matchResult?.isMatch ? "Matched" : "Mismatch!"} />
            <Table
              dataSource={matchResult?.mismatches || []}
              size="small"
              pagination={false}
              columns={[
                { title: "Product", dataIndex: "productId", key: "p" },
                { title: "PO Qty", dataIndex: "poQuantity", key: "pq" },
                { title: "Recvd Qty", dataIndex: "receivedQuantity", key: "rq" },
                { title: "Diff", dataIndex: "difference", key: "df", render: (v) => <span style={{ color: v !== 0 ? "red" : "inherit" }}>{v}</span> },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* Landed Cost Modal */}
      <Modal
        title="Landed Cost Allocation"
        open={!!landedCostGrnId}
        onCancel={() => setLandedCostGrnId(null)}
        onOk={() => landedCostForm.submit()}
      >
        <Form form={landedCostForm} layout="vertical" onFinish={handleLandedCostSubmit}>
          <Form.Item name="freight" label="Freight Charges" initialValue={0}>
            <InputNumber prefix="$" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="duty" label="Customs Duties" initialValue={0}>
            <InputNumber prefix="$" style={{ width: "100%" }} />
          </Form.Item>
          <p style={{ fontSize: 12, color: "gray" }}>Costs will be allocated across all items based on received quantity.</p>
        </Form>
      </Modal>

      {/* Return Modal */}
      <Modal
        title="Purchase Return & Debit Note"
        open={!!returnPo}
        onCancel={() => setReturnPo(null)}
        onOk={() => returnForm.submit()}
        okText="Process Return"
        okButtonProps={{ danger: true }}
      >
        <Form form={returnForm} layout="vertical" onFinish={handleReturnSubmit}>
          <Form.Item name="reason" label="Reason for Return" rules={[{ required: true }]}>
            <Select options={[{ label: "Damaged Goods", value: "DAMAGED" }, { label: "Wrong Item", value: "WRONG_ITEM" }, { label: "Expired", value: "EXPIRED" }]} />
          </Form.Item>
          <Form.Item name="notes" label="Additional Notes">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Divider />
          <p>Processing this return will reverse stock levels and generate a Debit Note for the vendor.</p>
        </Form>
      </Modal>

      <Modal
        title="Version History & Amendments"
        open={!!historyPo}
        onCancel={() => setHistoryPo(null)}
        footer={[<Button key="ok" onClick={() => setHistoryPo(null)}>Close</Button>]}
      >
        <List
          dataSource={historyPo?.history || []}
          renderItem={(item: any) => (
            <List.Item>
              <List.Item.Meta title={`Version ${item.version}`} description={`${item.date} — ${item.note}`} />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}
