"use client";
import React from "react";
import { ConfigProvider } from "antd";
import { nuroxTheme } from "@repo/ui-tokens/antd-theme";

export function AntdProvider({ children }: { children: React.ReactNode }) {
  return <ConfigProvider theme={nuroxTheme}>{children}</ConfigProvider>;
}
