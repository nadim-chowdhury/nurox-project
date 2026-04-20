"use client";

import React from "react";
import { Layout, Button, Avatar, Dropdown, Space } from "antd";
import {
  SearchOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { useLogoutMutation } from "@/store/api/authApi";
import { Breadcrumbs } from "./Breadcrumbs";
import { NotificationPanel } from "./NotificationPanel";

const { Header } = Layout;

export function TopBar() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
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
        padding: "0 24px",
        marginLeft: collapsed ? 64 : 256,
        transition: "margin-left 0.2s ease",
        background: "rgba(17, 24, 39, 0.7)",
        height: 64,
      }}
    >
      {/* Left: Breadcrumbs */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Breadcrumbs />
      </div>

      {/* Right side */}
      <Space size={12}>
        {/* Search trigger */}
        <Button
          type="text"
          icon={<SearchOutlined />}
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
        <NotificationPanel />

        {/* User menu */}
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <div
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
                background: "linear-gradient(135deg, #c3f5ff, #00e5ff)",
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
