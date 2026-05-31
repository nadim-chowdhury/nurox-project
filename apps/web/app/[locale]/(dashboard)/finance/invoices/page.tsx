"use client";

import { useState } from "react";
import { Table, Button, Modal, message, Tag, Space } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  FilePdfOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  useGetInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceStatusMutation,
  useLazyExportInvoicePdfQuery,
} from "@/store/api/financeApi";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { invoiceSchema, type InvoiceDto } from "@repo/shared-schemas";
import { RhfInput } from "@/components/common/forms/RhfInput";
import { RhfDatePicker } from "@/components/common/forms/RhfDatePicker";
import { RhfInputNumber } from "@/components/common/forms/RhfInputNumber";
import { RhfTextArea } from "@/components/common/forms/RhfTextArea";
import dayjs from "dayjs";

export default function Invoices() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetInvoicesQuery({ page, limit: 10 });
  const [createInvoice] = useCreateInvoiceMutation();
  const [updateStatus] = useUpdateInvoiceStatusMutation();
  const [triggerExport] = useLazyExportInvoicePdfQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { control, handleSubmit, reset, watch, setValue } = useForm<InvoiceDto>(
    {
      resolver: zodResolver(invoiceSchema),
      defaultValues: {
        invoiceNumber: `INV-${dayjs().format("YYYYMMDD")}-001`,
        customerName: "",
        customerEmail: "",
        issueDate: dayjs().toISOString(),
        dueDate: dayjs().add(30, "day").toISOString(),
        lines: [{ description: "", quantity: 1, unitPrice: 0, lineTotal: 0 }],
        subtotal: 0,
        taxAmount: 0,
        totalAmount: 0,
        notes: "",
      },
    },
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  // Watch lines to auto-calculate totals
  const lines = watch("lines");
  const calculateTotals = () => {
    const subtotal = lines.reduce(
      (acc, line) => acc + line.quantity * line.unitPrice,
      0,
    );
    const taxAmount = subtotal * 0.15; // Example 15% VAT
    const totalAmount = subtotal + taxAmount;

    setValue("subtotal", subtotal);
    setValue("taxAmount", taxAmount);
    setValue("totalAmount", totalAmount);
  };

  const handleDownloadPdf = async (id: string, invoiceNumber: string) => {
    try {
      const blob = await triggerExport(id).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${invoiceNumber}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (_err) {
      message.error("Failed to generate PDF");
    }
  };

  const onSubmit = async (values: InvoiceDto) => {
    try {
      await createInvoice(values).unwrap();
      message.success("Invoice created successfully");
      setIsModalOpen(false);
      reset();
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
    {
      title: "Issue Date",
      dataIndex: "issueDate",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD"),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      render: (val: number) => `$${Number(val).toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "PAID") color = "success";
        if (status === "SENT") color = "processing";
        if (status === "OVERDUE") color = "error";
        return <Tag color={color}>{status}</Tag>;
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
          <Button
            icon={<FilePdfOutlined />}
            size="small"
            onClick={() => handleDownloadPdf(record.id, record.invoiceNumber)}
          >
            PDF
          </Button>
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
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Customer Invoices</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            reset();
            setIsModalOpen(true);
          }}
        >
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
        onOk={handleSubmit(onSubmit)}
        width={900}
        okText="Create Invoice"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <RhfInput
              name="invoiceNumber"
              control={control}
              label="Invoice Number"
              required
            />
            <RhfInput
              name="customerName"
              control={control}
              label="Customer Name"
              required
            />
            <RhfInput
              name="customerEmail"
              control={control}
              label="Customer Email"
            />
            <div className="grid grid-cols-2 gap-2">
              <RhfDatePicker
                name="issueDate"
                control={control}
                label="Issue Date"
                required
              />
              <RhfDatePicker
                name="dueDate"
                control={control}
                label="Due Date"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <h4 className="mb-2 font-medium">Line Items</h4>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-start mb-2">
                <div className="flex-[3]">
                  <RhfInput
                    name={`lines.${index}.description` as const}
                    control={control}
                    placeholder="Description"
                    required
                  />
                </div>
                <div className="flex-[1]">
                  <RhfInputNumber
                    name={`lines.${index}.quantity` as const}
                    control={control}
                    placeholder="Qty"
                    min={1}
                    onChange={calculateTotals}
                  />
                </div>
                <div className="flex-[1]">
                  <RhfInputNumber
                    name={`lines.${index}.unitPrice` as const}
                    control={control}
                    placeholder="Price"
                    min={0}
                    precision={2}
                    onChange={calculateTotals}
                  />
                </div>
                <Button
                  type="text"
                  danger
                  onClick={() => remove(index)}
                  icon={<DeleteOutlined />}
                  className="mt-1"
                />
              </div>
            ))}
            <Button
              type="dashed"
              onClick={() =>
                append({
                  description: "",
                  quantity: 1,
                  unitPrice: 0,
                  lineTotal: 0,
                })
              }
              block
              icon={<PlusOutlined />}
            >
              Add Line Item
            </Button>
          </div>

          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">
                  ${watch("subtotal")?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (15%):</span>
                <span className="font-semibold">
                  ${watch("taxAmount")?.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg border-t pt-2">
                <span>Total:</span>
                <span className="font-bold text-primary">
                  ${watch("totalAmount")?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <RhfTextArea name="notes" control={control} label="Notes" rows={3} />
        </form>
      </Modal>
    </div>
  );
}
