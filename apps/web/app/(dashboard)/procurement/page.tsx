"use client";

import React from "react";
import { Row, Col } from "antd";
import {
  ShoppingOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { PageHeader } from "@/components/common/PageHeader";
import { KpiCard } from "@/components/common/KpiCard";
import { formatCurrency } from "@/lib/utils";

export default function ProcurementPage() {
  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Procurement"
        subtitle="Purchase management overview"
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Procurement" },
        ]}
      />
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Open POs"
            value="8"
            prefix={<FileTextOutlined style={{ color: "#80d8ff" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Pending Approvals"
            value="3"
            prefix={<CheckSquareOutlined style={{ color: "#ffb347" }} />}
          />
        </Col>
        <Col xs={12} sm={6}>
          <KpiCard
            title="Active Vendors"
            value="24"
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
    </div>
  );
}
