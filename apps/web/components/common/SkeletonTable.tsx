"use client";

import React from "react";
import { Skeleton } from "antd";

/**
 * Skeleton loader for data tables.
 * Shows a realistic placeholder while table data is loading.
 *
 * @param rows Number of skeleton rows to show (default: 5)
 * @param columns Number of columns to simulate (default: 5)
 */

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export function SkeletonTable({ rows = 5, columns = 5 }: SkeletonTableProps) {
  return (
    <div
      style={{
        background: "var(--color-surface-low)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 16,
          padding: "14px 16px",
          background: "var(--color-bg)",
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton.Input
            key={`header-${i}`}
            active
            size="small"
            style={{ width: "80%", height: 14 }}
          />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={`row-${rowIdx}`}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 16,
            padding: "12px 16px",
            background:
              rowIdx % 2 === 0
                ? "var(--color-surface-lowest)"
                : "var(--color-surface-low)",
          }}
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton.Input
              key={`cell-${rowIdx}-${colIdx}`}
              active
              size="small"
              style={{
                width: colIdx === 0 ? "60%" : "75%",
                height: 14,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
