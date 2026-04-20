"use client";

import React, { useState } from "react";
import { Button, Space, Tag } from "antd";
import {
  PlusOutlined,
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { Avatar } from "@/components/common/Avatar";
import { formatDate } from "@/lib/utils";
import type { ColumnsType } from "antd/es/table";

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FilePdfOutlined style={{ color: "#ffb4ab" }} />,
  xlsx: <FileExcelOutlined style={{ color: "#6dd58c" }} />,
  docx: <FileTextOutlined style={{ color: "#80d8ff" }} />,
  png: <FileImageOutlined style={{ color: "#ffb347" }} />,
  jpg: <FileImageOutlined style={{ color: "#ffb347" }} />,
};

const mockDocs: Document[] = [
  {
    id: "1",
    name: "Employee Handbook 2026.pdf",
    type: "pdf",
    category: "HR Policy",
    uploadedBy: "Fatima Khan",
    uploadedAt: "2026-04-15",
    size: "2.4 MB",
  },
  {
    id: "2",
    name: "Q1 Financial Report.xlsx",
    type: "xlsx",
    category: "Finance",
    uploadedBy: "Michael Chen",
    uploadedAt: "2026-04-10",
    size: "1.8 MB",
  },
  {
    id: "3",
    name: "NDA Template.docx",
    type: "docx",
    category: "Legal",
    uploadedBy: "Fatima Khan",
    uploadedAt: "2026-03-22",
    size: "340 KB",
  },
  {
    id: "4",
    name: "Office Floor Plan.png",
    type: "png",
    category: "Operations",
    uploadedBy: "David Miller",
    uploadedAt: "2026-03-15",
    size: "5.1 MB",
  },
  {
    id: "5",
    name: "Leave Policy Update.pdf",
    type: "pdf",
    category: "HR Policy",
    uploadedBy: "Fatima Khan",
    uploadedAt: "2026-04-18",
    size: "890 KB",
  },
  {
    id: "6",
    name: "Vendor Contracts Q2.pdf",
    type: "pdf",
    category: "Procurement",
    uploadedBy: "James Wilson",
    uploadedAt: "2026-04-05",
    size: "3.2 MB",
  },
  {
    id: "7",
    name: "Brand Guidelines.pdf",
    type: "pdf",
    category: "Marketing",
    uploadedBy: "Priya Sharma",
    uploadedAt: "2026-02-28",
    size: "12 MB",
  },
  {
    id: "8",
    name: "Tax Filing 2025.xlsx",
    type: "xlsx",
    category: "Finance",
    uploadedBy: "Michael Chen",
    uploadedAt: "2026-01-30",
    size: "4.5 MB",
  },
];

export default function DocumentsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockDocs.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Document> = [
    {
      title: "Document",
      key: "name",
      width: 300,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>
            {TYPE_ICONS[r.type] || <FileTextOutlined />}
          </span>
          <span
            style={{
              color: "var(--color-on-surface)",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            {r.name}
          </span>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 140,
      filters: [...new Set(mockDocs.map((d) => d.category))].map((c) => ({
        text: c,
        value: c,
      })),
      onFilter: (v, r) => r.category === v,
      render: (v: string) => (
        <Tag
          style={{
            background: "rgba(195,245,255,0.08)",
            color: "#c3f5ff",
            border: "1px solid rgba(195,245,255,0.2)",
            borderRadius: 4,
          }}
        >
          {v}
        </Tag>
      ),
    },
    {
      title: "Uploaded By",
      key: "uploadedBy",
      width: 170,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar name={r.uploadedBy} size={24} />
          <span
            style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
          >
            {r.uploadedBy}
          </span>
        </div>
      ),
    },
    {
      title: "Date",
      dataIndex: "uploadedAt",
      key: "date",
      width: 120,
      sorter: (a, b) =>
        new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime(),
      render: (d: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {formatDate(d)}
        </span>
      ),
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      width: 90,
      render: (v: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 100,
      align: "right" as const,
      render: () => (
        <Space size={4}>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            style={{ color: "var(--color-on-surface-variant)" }}
          />
          <Button
            type="text"
            size="small"
            icon={<DownloadOutlined />}
            style={{ color: "var(--color-on-surface-variant)" }}
          />
          <Button
            type="text"
            size="small"
            icon={<DeleteOutlined />}
            style={{ color: "var(--color-error)" }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Documents"
        subtitle={`${filtered.length} documents`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Documents" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Upload Document
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search documents..."
        showExport
        filterItems={[
          { key: "hr", label: "HR Policy" },
          { key: "finance", label: "Finance" },
          { key: "legal", label: "Legal" },
        ]}
      />
      <DataTable<Document>
        columns={columns}
        dataSource={filtered}
        rowKey="id"
      />
    </div>
  );
}
