import React from "react";
import { Typography } from "antd";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardGrid } from "@/components/modules/dashboard/DashboardGrid";
import { QuickActionButton } from "@/components/modules/dashboard/QuickActionButton";
import { AlertsPanel } from "@/components/modules/dashboard/AlertsPanel";
import { Row, Col } from "antd";

const { Title, Text } = Typography;

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Organization Overview"
        subtitle="Real-time monitoring and analytics"
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Dashboard" }]}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={18}>
          <DashboardGrid />
        </Col>
        <Col xs={24} xl={6}>
          <AlertsPanel />
        </Col>
      </Row>

      <QuickActionButton />
    </div>
  );
}
