"use client";

import React from "react";
import { Card, Statistic, type StatisticProps } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

interface KpiCardProps extends StatisticProps {
  trend?: "up" | "down";
  trendValue?: string;
  trendLabel?: string;
}

/**
 * KPI Statistic card with Space Grotesk numbers,
 * Electric Cyan accent, and trend indicator.
 */
export function KpiCard({
  trend,
  trendValue,
  trendLabel = "vs last month",
  ...props
}: KpiCardProps) {
  return (
    <Card className="kpi-card" style={{ padding: 4 }}>
      <Statistic {...props} />
      {trend && trendValue && (
        <div
          style={{
            marginTop: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {trend === "up" ? (
            <ArrowUpOutlined
              style={{ color: "var(--color-success)", fontSize: 12 }}
            />
          ) : (
            <ArrowDownOutlined
              style={{ color: "var(--color-error)", fontSize: 12 }}
            />
          )}
          <span
            style={{
              color:
                trend === "up" ? "var(--color-success)" : "var(--color-error)",
              fontSize: 12,
            }}
          >
            {trendValue}
          </span>
          <span
            style={{
              color: "var(--color-on-surface-variant)",
              fontSize: 12,
            }}
          >
            {trendLabel}
          </span>
        </div>
      )}
    </Card>
  );
}
