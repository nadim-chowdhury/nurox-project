"use client";

import React from "react";
import { usePathname, useRouter, useParams } from "next/navigation";
import {
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  ProjectOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

export default function MobileTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const tabs = [
    {
      label: "Dashboard",
      icon: DashboardOutlined,
      href: `/${locale}/dashboard`,
    },
    { label: "HR", icon: TeamOutlined, href: `/${locale}/hr/employees` },
    {
      label: "Finance",
      icon: DollarOutlined,
      href: `/${locale}/finance/journals`,
    },
    { label: "Projects", icon: ProjectOutlined, href: `/${locale}/projects` },
    { label: "POS", icon: ShoppingOutlined, href: `/${locale}/pos` },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        background: "rgba(17, 24, 39, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid var(--ghost-border, rgba(61, 74, 99, 0.15))",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {tabs.map((tab) => {
        const isActive =
          pathname === tab.href ||
          (tab.href !== `/${locale}/dashboard` &&
            pathname.startsWith(tab.href));
        return (
          <button
            key={tab.href}
            type="button"
            onClick={() => router.push(tab.href)}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              flex: 1,
              height: "100%",
              color: isActive
                ? "var(--color-primary, #c3f5ff)"
                : "var(--color-on-surface-variant, #9aa5be)",
              transition: "color 0.15s ease",
            }}
          >
            <tab.icon
              style={{
                fontSize: 18,
                color: isActive
                  ? "var(--color-primary, #c3f5ff)"
                  : "var(--color-on-surface-variant, #9aa5be)",
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.02em",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
