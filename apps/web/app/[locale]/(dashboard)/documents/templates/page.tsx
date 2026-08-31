"use client";

import React, { useState } from "react";
import { Button, Space, Card, Typography, Input, Tag } from "antd";
import {
  PlusOutlined,
  FileTextOutlined,
  SearchOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

const mockTemplates = [
  {
    id: "1",
    name: "Employment Contract",
    category: "HR",
    tags: ["Onboarding", "Legal"],
  },
  {
    id: "2",
    name: "Non-Disclosure Agreement",
    category: "Legal",
    tags: ["Confidentiality"],
  },
  { id: "3", name: "Offer Letter", category: "HR", tags: ["Onboarding"] },
  {
    id: "4",
    name: "Purchase Order",
    category: "Procurement",
    tags: ["Finance"],
  },
];

export default function DocumentTemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = mockTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Document Templates"
        subtitle="Manage Smart Document Templates"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Documents", href: "/documents" },
          { label: "Templates" },
        ]}
        extra={
          <Button type="primary" icon={<PlusOutlined />}>
            Create Template
          </Button>
        }
      />

      <div style={{ marginBottom: 24, marginTop: 24 }}>
        <Input
          placeholder="Search templates..."
          prefix={
            <SearchOutlined
              style={{ color: "var(--color-on-surface-variant)" }}
            />
          }
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            maxWidth: 400,
            background: "rgba(255,255,255,0.02)",
            borderColor: "rgba(255,255,255,0.1)",
            color: "white",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 24,
        }}
      >
        {filtered.map((template) => (
          <Card
            key={template.id}
            hoverable
            style={{
              background: "rgba(255,255,255,0.02)",
              borderColor: "rgba(255,255,255,0.05)",
              borderRadius: 12,
            }}
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                key="edit"
                style={{ color: "var(--color-primary)" }}
              >
                Edit
              </Button>,
              <Button type="text" key="use">
                Use Template
              </Button>,
            ]}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
              <div
                style={{
                  padding: 12,
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 8,
                }}
              >
                <FileTextOutlined
                  style={{ fontSize: 24, color: "var(--color-primary)" }}
                />
              </div>
              <div>
                <Title
                  level={5}
                  style={{ margin: 0, color: "var(--color-on-surface)" }}
                >
                  {template.name}
                </Title>
                <Text
                  type="secondary"
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  {template.category}
                </Text>
                <div style={{ marginTop: 8 }}>
                  {template.tags.map((tag) => (
                    <Tag
                      key={tag}
                      style={{
                        background: "rgba(195,245,255,0.08)",
                        color: "#c3f5ff",
                        border: "none",
                      }}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
