"use client";

import React from "react";
import { Layout } from "antd";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { FloatingActions } from "@/components/common/FloatingActions";
import { OfflineBanner } from "@/components/common/OfflineBanner";
import MobileTabBar from "@/components/layout/MobileTabBar";
import { useAppSelector, useAppDispatch } from "@/hooks/useRedux";
import { toggleSidebar, toggleCommandPalette } from "@/store/slices/uiSlice";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { useGetCurrentSubscriptionQuery } from "@/store/api/billingApi";
import { Alert } from "antd";
import { GlobalSearch } from "@/components/common/GlobalSearch";

const { Content } = Layout;

export function AppShell({ children }: { children: React.ReactNode }) {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const { data: subscription } = useGetCurrentSubscriptionQuery();

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      // 'L' to toggle sidebar
      if (e.key.toLowerCase() === "l") {
        dispatch(toggleSidebar());
      }

      // 'H' for Home/Dashboard
      if (e.key.toLowerCase() === "h") {
        router.push(`/${locale}/dashboard`);
      }

      // '/' or 'S' for Search (Command Palette)
      if (e.key === "/" || e.key.toLowerCase() === "s") {
        if (e.key === "/") e.preventDefault();
        dispatch(toggleCommandPalette());
      }

      // 'N' for New (if on a module page, could trigger a modal)
      if (e.key.toLowerCase() === "n") {
        console.log("Global 'New' action triggered");
        // This could be linked to a global 'New' FAB or modal
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dispatch, router]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout
        style={{
          marginLeft: collapsed ? 64 : 256,
          transition: "margin-left 0.2s ease",
        }}
      >
        <TopBar />
        <OfflineBanner />

        {subscription?.status === "past_due" && (
          <Alert
            type="warning"
            title="Payment Past Due"
            description="Your tenant subscription payment is past due. Please update payment method."
            showIcon
            banner
          />
        )}

        {subscription?.status === "suspended" && (
          <Alert
            type="error"
            title="Account Suspended"
            description="Your account has been suspended due to unpaid invoices. Please update your payment method to restore access."
            showIcon
            banner
          />
        )}

        <Content
          style={{
            padding: 24,
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
          <FloatingActions />
          <GlobalSearch />
        </Content>
        <MobileTabBar />
      </Layout>
    </Layout>
  );
}
