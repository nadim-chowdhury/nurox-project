"use client";

import React, { useMemo, useState } from "react";
import { Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { StatusTag } from "@/components/common/StatusTag";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";
import { SalesOrderDetailDrawer } from "@/components/modules/sales/SalesOrderDetailDrawer";
import {
  useGetSalesOrdersQuery,
  calcSalesLineTotal,
  type SalesOrderRecord,
} from "@/store/api/salesApi";

function orderDisplayTotal(order: SalesOrderRecord): number {
  if (order.totalAmount != null) return Number(order.totalAmount);
  return (
    order.lines?.reduce((sum, line) => sum + calcSalesLineTotal(line), 0) ?? 0
  );
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data: orders = [], isLoading, isFetching } = useGetSalesOrdersQuery();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(
      (row) =>
        row.soNumber.toLowerCase().includes(q) ||
        (row.account?.name ?? "").toLowerCase().includes(q),
    );
  }, [orders, search]);

  const columns: ColumnsType<SalesOrderRecord> = [
    {
      title: "Order #",
      dataIndex: "soNumber",
      key: "soNumber",
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
      sorter: (a, b) => orderDisplayTotal(a) - orderDisplayTotal(b),
      render: (_: unknown, row) => (
        <span
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-primary)",
            fontWeight: 700,
          }}
        >
          {formatCurrency(orderDisplayTotal(row), row.currency)}
        </span>
      ),
    },
    {
      title: "Order date",
      dataIndex: "orderDate",
      key: "orderDate",
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
      width: 130,
      render: (s: string) => <StatusTag status={s} />,
    },
    {
      title: "Invoice",
      key: "invoice",
      width: 100,
      render: (_: unknown, row) =>
        row.financeInvoiceId ? (
          <span style={{ fontSize: 12, color: "var(--color-success)" }}>
            Created
          </span>
        ) : (
          <span
            style={{ fontSize: 12, color: "var(--color-on-surface-variant)" }}
          >
            —
          </span>
        ),
    },
    {
      title: "",
      key: "actions",
      width: 50,
      render: (_: unknown, record) => (
        <Button
          type="text"
          size="small"
          icon={<EyeOutlined />}
          style={{ color: "var(--color-on-surface-variant)" }}
          onClick={() => setSelectedId(record.id)}
        />
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Sales Orders"
        subtitle={`${filtered.length} orders`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Sales", href: "/sales" },
          { label: "Orders" },
        ]}
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search orders..."
        showExport
      />
      <DataTable<SalesOrderRecord>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={isLoading || isFetching}
      />

      <SalesOrderDetailDrawer
        orderId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
