"use client";

import React from "react";
import { Empty, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";

/**
 * Custom empty state component matching the Deep Space design system.
 * Used when a table/list has no data.
 */

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No data yet",
  description = "Get started by creating your first entry.",
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        textAlign: "center",
      }}
    >
      <Empty
        image={
          icon ?? (
            <InboxOutlined
              style={{
                fontSize: 56,
                color: "var(--color-on-surface-variant)",
                opacity: 0.4,
              }}
            />
          )
        }
        description={null}
      />
      <h3
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-on-surface)",
          fontSize: 18,
          fontWeight: 600,
          marginTop: 16,
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: "var(--color-on-surface-variant)",
          fontSize: 14,
          maxWidth: 360,
          lineHeight: 1.6,
          marginBottom: actionLabel ? 24 : 0,
        }}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <Button type="primary" onClick={onAction} size="large">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
