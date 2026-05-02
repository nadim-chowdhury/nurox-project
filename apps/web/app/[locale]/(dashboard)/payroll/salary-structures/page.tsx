"use client";

import React, { useState } from "react";
import { Card, Tag, Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { SalaryStructureBuilder } from "@/components/modules/payroll/SalaryStructureBuilder";
import { useGetStructuresQuery } from "@/store/api/payrollApi";
import type { ColumnsType } from "antd/es/table";

const columns: ColumnsType<any> = [
  {
    title: "Structure",
    dataIndex: "name",
    render: (v: string) => (
      <span style={{ color: "var(--color-on-surface)", fontWeight: 500 }}>
        {v}
      </span>
    ),
  },
  {
    title: "Components",
    dataIndex: "components",
    render: (components: any[]) => (
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {components.map((c, i) => (
          <Tag key={i} color={c.type === "EARNING" ? "blue" : "orange"}>
            {c.name} ({c.amountType === "PERCENTAGE" ? `${c.value}%` : `$${c.value}`})
          </Tag>
        ))}
      </div>
    ),
  },
  {
    title: "Default",
    dataIndex: "isDefault",
    render: (v: boolean) => (
      <Tag color={v ? "green" : "default"}>{v ? "YES" : "NO"}</Tag>
    ),
  },
];

export default function SalaryStructuresPage() {
  const { data: structures, isLoading } = useGetStructuresQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Salary Structures"
        subtitle="Define compensation packages and pay grades"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Payroll", href: "/payroll" },
          { label: "Salary Structures" },
        ]}
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
          >
            New Structure
          </Button>
        }
      />
      <Card
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--ghost-border)",
        }}
      >
        <DataTable<any>
          columns={columns}
          dataSource={structures}
          loading={isLoading}
          rowKey="id"
        />
      </Card>

      <Modal
        title="Create Salary Structure"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={900}
      >
        <SalaryStructureBuilder onSuccess={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
