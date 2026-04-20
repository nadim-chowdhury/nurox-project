"use client";

import React from "react";
import { Typography, Breadcrumb } from "antd";

const { Title, Text } = Typography;

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  extra?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  extra,
}: PageHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
      }}
    >
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumb
            style={{ marginBottom: 8 }}
            items={breadcrumbs.map((b) => ({
              title: b.href ? (
                <a
                  href={b.href}
                  style={{ color: "var(--color-on-surface-variant)" }}
                >
                  {b.label}
                </a>
              ) : (
                <span style={{ color: "var(--color-on-surface-variant)" }}>
                  {b.label}
                </span>
              ),
            }))}
          />
        )}
        <Title
          level={3}
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--color-on-surface)",
            marginBottom: 4,
          }}
        >
          {title}
        </Title>
        {subtitle && (
          <Text
            style={{ color: "var(--color-on-surface-variant)", fontSize: 14 }}
          >
            {subtitle}
          </Text>
        )}
      </div>
      {extra && <div>{extra}</div>}
    </div>
  );
}
