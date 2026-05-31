"use client";

import React, { useState, useEffect } from "react";
import { Modal, Input, List, Typography, Space, Tag, Empty, Spin } from "antd";
import {
  SearchOutlined,
  FileTextOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { toggleCommandPalette } from "@/store/slices/uiSlice";
import {
  useLazyGlobalSearchQuery,
  useTrackClickMutation,
} from "@/store/api/searchApi";
import { useDebounce } from "@/hooks/useDebounce";
import { useRouter } from "next/navigation";

const { Text } = Typography;

export function GlobalSearch() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.ui.commandPaletteOpen);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();

  const [triggerSearch, { data, isFetching }] = useLazyGlobalSearchQuery();
  const [trackClick] = useTrackClickMutation();

  useEffect(() => {
    if (debouncedQuery) {
      triggerSearch(debouncedQuery);
    }
  }, [debouncedQuery, triggerSearch]);

  const handleClose = () => {
    if (isOpen) {
      dispatch(toggleCommandPalette());
    }
    setQuery("");
  };

  const handleNavigate = (type: string, id: string) => {
    if (data?.searchId) {
      trackClick({ queryId: data.searchId, entityId: id });
    }
    handleClose();
    switch (type) {
      case "products":
        router.push(`/inventory/products/${id}`);
        break;
      case "invoices":
        router.push(`/finance/invoices/${id}`);
        break;
      case "employees":
        router.push(`/hr/employees/${id}`);
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "products":
        return <ShoppingCartOutlined />;
      case "invoices":
        return <FileTextOutlined />;
      case "employees":
        return <UserOutlined />;
      default:
        return <SearchOutlined />;
    }
  };

  const getTitle = (item: any, type: string) => {
    switch (type) {
      case "products":
        return item.name;
      case "invoices":
        return item.invoiceNumber;
      case "employees":
        return `${item.firstName} ${item.lastName}`;
      default:
        return "Unknown";
    }
  };

  const getSubtitle = (item: any, type: string) => {
    switch (type) {
      case "products":
        return item.sku;
      case "invoices":
        return `${item.customerName} - ${item.totalAmount} ${item.currency}`;
      case "employees":
        return `${item.designation} (${item.department})`;
      default:
        return "";
    }
  };

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      closable={false}
      styles={{ body: { padding: 0 } }}
      width={600}
      centered
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--color-border-variant)",
        }}
      >
        <Input
          autoFocus
          placeholder="Search products, invoices, employees... (⌘K)"
          prefix={
            <SearchOutlined
              style={{ color: "var(--color-on-surface-variant)" }}
            />
          }
          variant="borderless"
          size="large"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          suffix={isFetching && <Spin size="small" />}
        />
      </div>

      <div style={{ maxHeight: 400, overflowY: "auto", padding: "8px 0" }}>
        {!query && (
          <div style={{ padding: "24px", textAlign: "center" }}>
            <Text type="secondary">Type to start searching...</Text>
          </div>
        )}

        {query &&
          data?.results.map((group) => (
            <div key={group.indexUid}>
              {group.hits.length > 0 && (
                <>
                  <div
                    style={{
                      padding: "8px 24px",
                      background: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <Text
                      strong
                      style={{
                        textTransform: "uppercase",
                        fontSize: 11,
                        letterSpacing: 1,
                      }}
                    >
                      {group.indexUid}
                    </Text>
                  </div>
                  <List
                    dataSource={group.hits}
                    renderItem={(item) => (
                      <List.Item
                        className="search-result-item"
                        style={{
                          padding: "12px 24px",
                          cursor: "pointer",
                          border: "none",
                        }}
                        onClick={() => handleNavigate(group.indexUid, item.id)}
                      >
                        <Space
                          size={16}
                          style={{
                            width: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <Space size={12}>
                            <div
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                background: "rgba(255,255,255,0.05)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 18,
                              }}
                            >
                              {getIcon(group.indexUid)}
                            </div>
                            <div>
                              <Text strong style={{ display: "block" }}>
                                {getTitle(item, group.indexUid)}
                              </Text>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {getSubtitle(item, group.indexUid)}
                              </Text>
                            </div>
                          </Space>
                          <RightOutlined
                            style={{ fontSize: 12, opacity: 0.3 }}
                          />
                        </Space>
                      </List.Item>
                    )}
                  />
                </>
              )}
            </div>
          ))}

        {query &&
          !isFetching &&
          data?.results.every((g) => g.hits.length === 0) && (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No results found"
            />
          )}
      </div>

      <div
        style={{
          padding: "12px 24px",
          borderTop: "1px solid var(--color-border-variant)",
          display: "flex",
          gap: 16,
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          <Tag style={{ fontSize: 10, lineHeight: "16px" }}>↑↓</Tag> to navigate
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <Tag style={{ fontSize: 10, lineHeight: "16px" }}>↵</Tag> to select
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <Tag style={{ fontSize: 10, lineHeight: "16px" }}>esc</Tag> to close
        </Text>
      </div>
    </Modal>
  );
}
