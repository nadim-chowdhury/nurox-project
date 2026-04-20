"use client";

import React from "react";
import { Table, type TableProps } from "antd";

interface DataTableProps<T> extends TableProps<T> {
  loading?: boolean;
}

/**
 * Standard ERP data table with Deep Space styling.
 * - Alternating row stripes (via globals.css)
 * - No cell borders
 * - Show total + page size changer
 * - Horizontal scroll for responsive
 */
export function DataTable<T extends object>({
  loading,
  ...props
}: DataTableProps<T>) {
  return (
    <Table
      {...props}
      loading={loading}
      size="middle"
      scroll={{ x: "max-content" }}
      pagination={{
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`,
        defaultPageSize: 25,
        pageSizeOptions: ["10", "25", "50", "100"],
      }}
      style={{ background: "transparent" }}
    />
  );
}
