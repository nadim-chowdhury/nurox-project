import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardShell } from "@/components/modules/dashboard/DashboardShell";
import { QuickActionButton } from "@/components/modules/dashboard/QuickActionButton";

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

      <DashboardShell />

      <QuickActionButton />
    </div>
  );
}
