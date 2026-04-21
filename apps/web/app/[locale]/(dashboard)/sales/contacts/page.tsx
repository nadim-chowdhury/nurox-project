"use client";

import React, { useState } from "react";
import { Button, Space } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { TableToolbar } from "@/components/tables/TableToolbar";
import { Avatar } from "@/components/common/Avatar";
import type { ColumnsType } from "antd/es/table";

interface Contact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  title: string;
  lastContact: string;
}

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Alex Morgan",
    company: "TechStart Inc",
    email: "alex@techstart.io",
    phone: "+1 555 100 2001",
    title: "CTO",
    lastContact: "2 days ago",
  },
  {
    id: "2",
    name: "Sarah Lin",
    company: "Acme Corp",
    email: "sarah.lin@acme.com",
    phone: "+1 555 200 3002",
    title: "VP Engineering",
    lastContact: "1 week ago",
  },
  {
    id: "3",
    name: "Mark Davis",
    company: "FinEdge",
    email: "mark@finedge.io",
    phone: "+1 555 300 4003",
    title: "CEO",
    lastContact: "3 days ago",
  },
  {
    id: "4",
    name: "Jessica Wu",
    company: "GreenLogix",
    email: "jessica@greenlogix.com",
    phone: "+1 555 400 5004",
    title: "Procurement Manager",
    lastContact: "Today",
  },
  {
    id: "5",
    name: "Raj Patel",
    company: "BuildRight Co",
    email: "raj@buildright.com",
    phone: "+1 555 500 6005",
    title: "IT Director",
    lastContact: "5 days ago",
  },
  {
    id: "6",
    name: "Emily Brown",
    company: "NovaHealth",
    email: "emily@novahealth.co",
    phone: "+1 555 600 7006",
    title: "COO",
    lastContact: "2 weeks ago",
  },
];

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const filtered = mockContacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Contact> = [
    {
      title: "Contact",
      key: "name",
      width: 220,
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar name={r.name} size={36} />
          <div>
            <div
              style={{
                color: "var(--color-on-surface)",
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              {r.name}
            </div>
            <div
              style={{ color: "var(--color-on-surface-variant)", fontSize: 12 }}
            >
              {r.title}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
      width: 160,
      render: (v: string) => (
        <span style={{ color: "var(--color-on-surface)", fontSize: 13 }}>
          {v}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (v: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 160,
      render: (v: string) => (
        <span
          style={{ color: "var(--color-on-surface-variant)", fontSize: 13 }}
        >
          {v}
        </span>
      ),
    },
    {
      title: "Last Contact",
      dataIndex: "lastContact",
      key: "last",
      width: 120,
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
            icon={<MailOutlined />}
            style={{ color: "var(--color-on-surface-variant)" }}
          />
          <Button
            type="text"
            size="small"
            icon={<PhoneOutlined />}
            style={{ color: "var(--color-on-surface-variant)" }}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            style={{ color: "var(--color-on-surface-variant)" }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Contacts"
        subtitle={`${filtered.length} contacts`}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Sales", href: "/sales" },
          { label: "Contacts" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Add Contact
          </Button>
        }
      />
      <TableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search contacts..."
        showExport
      />
      <DataTable<Contact> columns={columns} dataSource={filtered} rowKey="id" />
    </div>
  );
}
