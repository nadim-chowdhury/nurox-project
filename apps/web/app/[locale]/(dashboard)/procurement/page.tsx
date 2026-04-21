"use client";

import React from "react";
import { Row, Col, Card, Table, Tag, Button } from "antd";
import {
  ShoppingOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { formatCurrency } from "@/lib/utils";
import { useGetVendorsQuery } from "@/store/api/procurementApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { name: "Vendor A", spend: 45000 },
  { name: "Vendor B", spend: 32000 },
  { name: "Vendor C", spend: 28000 },
  { name: "Vendor D", spend: 21000 },
  { name: "Vendor E", spend: 19000 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function ProcurementPage() {
  const { data: vendors, isLoading: loadingVendors } = useGetVendorsQuery();

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Procurement"
        subtitle="Purchase management and vendor analytics"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Procurement" },
        ]}
        extra={[
          <Button key="pr" type="primary" icon={<PlusOutlined />}>
            New Requisition
          </Button>,
        ]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Open POs"
            value="12"
            prefix={<FileTextOutlined style={{ color: "#80d8ff" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Pending Approvals"
            value="5"
            prefix={<CheckSquareOutlined style={{ color: "#ffb347" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Active Vendors"
            value={vendors?.length?.toString() || "0"}
            loading={loadingVendors}
            prefix={<TeamOutlined style={{ color: "#6dd58c" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="MTD Spend"
            value={formatCurrency(145600)}
            prefix={<ShoppingOutlined style={{ color: "#c3f5ff" }} />}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Vendor Spend Analytics" style={{ height: "100%" }}>
            <div style={{ height: 300, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      background: "var(--color-surface)",
                      border: "1px solid var(--ghost-border)",
                    }}
                  />
                  <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Recent Vendors" extra={<a href="#">View All</a>}>
            <Table
              dataSource={vendors?.slice(0, 5)}
              loading={loadingVendors}
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Name",
                  dataIndex: "name",
                  key: "name",
                },
                {
                  title: "Status",
                  dataIndex: "kycStatus",
                  key: "status",
                  render: (status) => (
                    <Tag color={status === "VERIFIED" ? "green" : "orange"}>
                      {status}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
