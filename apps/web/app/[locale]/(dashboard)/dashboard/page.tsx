import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { DashboardShell } from "@/components/modules/dashboard/DashboardShell";
import { QuickActionButton } from "@/components/modules/dashboard/QuickActionButton";
import dayjs from "dayjs";

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ 
    from?: string; 
    to?: string; 
    compare?: string;
  }>;
}) {
  const { locale: _locale } = await params;
  const { from, to, compare } = await searchParams;

  const startDate = from ? dayjs(from) : dayjs().subtract(30, "d");
  const endDate = to ? dayjs(to) : dayjs();
  const showComparison = compare === "true";

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Organization Overview"
        subtitle="Real-time monitoring and analytics"
        breadcrumbs={[{ label: "Home", href: "/dashboard" }, { label: "Dashboard" }]}
      />

      <DashboardShell 
        startDate={startDate.toISOString()} 
        endDate={endDate.toISOString()} 
        showComparison={showComparison}
      />

      <QuickActionButton />
    </div>
  );
}
