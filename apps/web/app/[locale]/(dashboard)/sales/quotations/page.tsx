"use client";

import React, { useMemo, useState } from "react";
import { Button, message, Dropdown } from "antd";
import type { MenuProps } from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  SendOutlined,
  SwapOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";
import { CreateQuotationModal } from "@/components/modules/sales/CreateQuotationModal";
import {
  useGetQuotationsQuery,
  useSendQuotationMutation,
  useConvertQuotationMutation,
  quotationDisplayTotal,
  type QuotationRecord,
} from "@/store/api/salesApi";

export default function QuotationsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const {
    data: quotations = [],
    isLoading,
    isFetching,
  } = useGetQuotationsQuery();
  const [sendQuotation, { isLoading: sending }] = useSendQuotationMutation();
  const [convertQuotation, { isLoading: converting }] =
    useConvertQuotationMutation();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = Array.isArray(quotations) ? quotations : [];
    return list.filter(
      (row) =>
        row.quotationNumber.toLowerCase().includes(q) ||
        (row.account?.name ?? "").toLowerCase().includes(q),
    );
  }, [quotations, search]);

  const runAction = async (label: string, action: () => Promise<unknown>) => {
    try {
      await action();
      message.success(label);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string | string[] } };
      const msg = e.data?.message;
      message.error(
        Array.isArray(msg) ? msg.join(", ") : (msg ?? "Action failed"),
      );
    }
  };

  const columns: ColumnsType<QuotationRecord> = [
    {
      title: "Quote #",
      dataIndex: "quotationNumber",
      key: "quotationNumber",
      width: 160,
      render: (v: string) => (
        <span
          style={{
            color: "var(--color-primary)",
            fontFamily: "var(--font-display)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      width: 180,
      render: (_: unknown, row) => (
        <span
          style={{
            color: "var(--color-on-surface)",
            fontWeight: 500,
            fontSize: 13,
          }}
        >
          {row.account?.name ?? "—"}
        </span>
      ),
    },
    {
      title: "Items",
      key: "items",
      width: 80,
      render: (_: unknown, row) => (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
          {row.lines?.length ?? 0}
        </span>
      ),
    },
    {
      title: "Total",
      key: "total",
      width: 130,
      sorter: (a, b) => quotationDisplayTotal(a) - quotationDisplayTotal(b),
      render: (_: unknown, row) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-primary)",
            fontWeight: 700,
          }}
        >
          {formatCurrency(quotationDisplayTotal(row), row.currency)}
        </span>
      ),
    },
    {
      title: "Valid until",
      dataIndex: "validUntil",
      key: "validUntil",
      width: 120,
      render: (d: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: "",
      key: "actions",
      width: 80,
      render: (_: unknown, record) => {
        const items: MenuProps["items"] = [];

        if (record.status === "DRAFT") {
          items.push({
            key: "send",
            icon: <SendOutlined />,
            label: "Send to customer",
            onClick: () =>
              runAction("Quotation sent", () =>
                sendQuotation(record.id).unwrap(),
              ),
          });
        }

        if (
          (record.status === "DRAFT" || record.status === "SENT") &&
          record.accountId
        ) {
          items.push({
            key: "convert",
            icon: <SwapOutlined />,
            label: "Convert to sales order",
            onClick: () =>
              runAction("Converted to sales order", () =>
                convertQuotation(record.id).unwrap(),
              ),
          });
        }

        if (items.length === 0) {
          return (
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              disabled
              style={{ color: "var(--color-on-surface-variant)" }}
            />
          );
        }

        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              loading={sending || converting}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Quotations"
        subtitle={`${filtered.length} quotes`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Sales", href: "/sales" },
          { label: "Quotations" },
        ]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateOpen(true)}
          >
            Create quote
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search quotes..."
        showExport
      />
      <DataTable<QuotationRecord>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={isLoading || isFetching}
      />

      <CreateQuotationModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
