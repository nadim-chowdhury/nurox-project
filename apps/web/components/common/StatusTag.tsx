"use client";

import React from "react";
import { Tag } from "antd";

/**
 * Semantic status tag with consistent color mapping across all ERP modules.
 * Maps status strings to colors from the Deep Space palette.
 */

const STATUS_COLOR_MAP: Record<string, string> = {
  // Universal
  active: "#6dd58c",
  inactive: "#9aa5be",
  pending: "#ffb347",
  approved: "#6dd58c",
  rejected: "#ffb4ab",
  cancelled: "#9aa5be",
  draft: "#9aa5be",

  // HR
  on_leave: "#80d8ff",
  terminated: "#ffb4ab",
  probation: "#ffb347",

  // Finance
  paid: "#6dd58c",
  unpaid: "#ffb4ab",
  overdue: "#ffb4ab",
  partial: "#ffb347",

  // Inventory
  in_stock: "#6dd58c",
  low_stock: "#ffb347",
  out_of_stock: "#ffb4ab",

  // Projects
  not_started: "#9aa5be",
  in_progress: "#80d8ff",
  completed: "#6dd58c",
  on_hold: "#ffb347",

  // Priority
  critical: "#ffb4ab",
  high: "#ffb347",
  medium: "#c3f5ff",
  low: "#9aa5be",

  // Sales
  won: "#6dd58c",
  lost: "#ffb4ab",
  open: "#80d8ff",
  qualified: "#c3f5ff",
  proposal: "#ffb347",
  negotiation: "#e3eeff",
};

interface StatusTagProps {
  /** The status string (case-insensitive, spaces/hyphens normalized) */
  status: string;
  /** Override the display label */
  label?: string;
  /** Override the color */
  color?: string;
}

export function StatusTag({ status, label, color }: StatusTagProps) {
  const normalizedStatus = status.toLowerCase().replace(/[\s-]/g, "_");
  const resolvedColor =
    color ?? STATUS_COLOR_MAP[normalizedStatus] ?? "#9aa5be";
  const displayLabel =
    label ??
    status.replace(/[_-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <Tag
      style={{
        background: `${resolvedColor}15`,
        color: resolvedColor,
        border: `1px solid ${resolvedColor}30`,
        borderRadius: 4,
        fontWeight: 500,
        fontSize: 12,
      }}
    >
      {displayLabel}
    </Tag>
  );
}
