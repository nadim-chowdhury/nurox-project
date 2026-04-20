"use client";

import React from "react";
import { Input, Button, Space, Dropdown, Tooltip } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";

/**
 * Toolbar for data tables: search, filter, export, and primary action.
 * Sits above the DataTable component.
 */

interface TableToolbarProps {
  /** Search input value */
  searchValue?: string;
  /** Search change handler */
  onSearchChange?: (value: string) => void;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Primary action button label */
  primaryActionLabel?: string;
  /** Primary action click handler */
  onPrimaryAction?: () => void;
  /** Show export button */
  showExport?: boolean;
  /** Export click handler */
  onExport?: () => void;
  /** Show refresh button */
  showRefresh?: boolean;
  /** Refresh click handler */
  onRefresh?: () => void;
  /** Filter dropdown items */
  filterItems?: { key: string; label: string }[];
  /** Filter selection handler */
  onFilterSelect?: (key: string) => void;
  /** Extra elements to render on the right */
  extra?: React.ReactNode;
}

export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  primaryActionLabel,
  onPrimaryAction,
  showExport = false,
  onExport,
  showRefresh = false,
  onRefresh,
  filterItems,
  onFilterSelect,
  extra,
}: TableToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      {/* Left: Search + Filters */}
      <Space wrap>
        {onSearchChange && (
          <Input
            prefix={
              <SearchOutlined
                style={{ color: "var(--color-on-surface-variant)" }}
              />
            }
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            allowClear
            style={{ width: 280 }}
          />
        )}

        {filterItems && filterItems.length > 0 && (
          <Dropdown
            menu={{
              items: filterItems.map((item) => ({
                key: item.key,
                label: item.label,
                onClick: () => onFilterSelect?.(item.key),
              })),
            }}
            trigger={["click"]}
          >
            <Button icon={<FilterOutlined />}>Filters</Button>
          </Dropdown>
        )}
      </Space>

      {/* Right: Actions */}
      <Space>
        {extra}

        {showRefresh && (
          <Tooltip title="Refresh">
            <Button icon={<ReloadOutlined />} onClick={onRefresh} />
          </Tooltip>
        )}

        {showExport && (
          <Button icon={<DownloadOutlined />} onClick={onExport}>
            Export
          </Button>
        )}

        {primaryActionLabel && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onPrimaryAction}
          >
            {primaryActionLabel}
          </Button>
        )}
      </Space>
    </div>
  );
}
