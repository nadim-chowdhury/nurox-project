"use client";

import React from "react";
import { Layout, Button, Avatar, Dropdown, Space, Badge, Tooltip } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  WifiOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/useRedux";
import { useLogoutMutation } from "@/store/api/authApi";
import { Breadcrumbs } from "./Breadcrumbs";
import { NotificationDropdown } from "./NotificationDropdown";

const { Header } = Layout;

export function TopBar() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const { sidebarCollapsed: collapsed, primaryColor, socketStatus } = useAppSelector((s) => s.ui);
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      // Still clear local state
    }
    router.push("/login");
  };

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Profile",
      onClick: () => router.push("/settings"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      onClick: () => router.push("/settings"),
    },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      className="app-header"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 99,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingInline: "24px",
        marginInlineStart: collapsed ? 64 : 256,
        transition: "all 0.2s ease",
        background: "rgba(17, 24, 39, 0.7)",
        height: 64,
      }}
    >
      {/* Left: Breadcrumbs */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Breadcrumbs />
      </div>

      {/* Right side */}
      <Space size={16}>
        {/* Socket Status */}
        <Tooltip title={`System Status: ${socketStatus}`}>
          <Badge 
            status={
              socketStatus === 'connected' ? 'success' : 
              socketStatus === 'connecting' ? 'processing' : 'error'
            } 
          >
            <WifiOutlined style={{ color: 'var(--color-on-surface-variant)', fontSize: 16 }} />
          </Badge>
        </Tooltip>

        {/* Search trigger */}
        <Button
          type="text"
          icon={<SearchOutlined />}
          aria-label="Open Command Palette"
          style={{
            color: "var(--color-on-surface-variant)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12, opacity: 0.5 }}>
            <kbd style={{ opacity: 0.6 }}>⌘K</kbd>
          </span>
        </Button>

        {/* Notifications */}
        <NotificationDropdown />

        {/* User menu */}
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <div
            role="button"
            aria-label="User profile menu"
            tabIndex={0}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: 4,
              transition: "background 0.15s ease",
            }}
          >
            <Avatar
              size={32}
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, #00e5ff)`,
                color: "#003c4a",
                fontWeight: 600,
              }}
            >
              {user?.firstName?.[0] || "N"}
            </Avatar>
            <span
              style={{
                color: "var(--color-on-surface)",
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {user?.firstName || "Nurox"} {user?.lastName || "User"}
            </span>
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
}
