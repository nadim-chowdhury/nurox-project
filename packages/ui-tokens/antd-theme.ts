import type { ThemeConfig } from "antd";
import { theme as antdTheme } from "antd";

/**
 * Nurox ERP — Ant Design 6.x Theme Configuration
 * Deep Space palette mapped to antd design tokens.
 * Applied via ConfigProvider in AntdProvider.tsx.
 */
export const nuroxTheme: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    // Brand colors
    colorPrimary: "#c3f5ff",
    colorPrimaryHover: "#80d8ff",
    colorPrimaryActive: "#00e5ff",

    // Backgrounds mapped to Deep Space palette
    colorBgBase: "#0c1324",
    colorBgContainer: "#1a2235",
    colorBgElevated: "#222c42",
    colorBgLayout: "#111827",
    colorBgSpotlight: "#2e3447",

    // Text
    colorText: "#e8eaf0",
    colorTextSecondary: "#9aa5be",
    colorTextTertiary: "#e3eeff",
    colorTextDisabled: "rgba(232,234,240,0.3)",

    // Borders — ghost only
    colorBorder: "rgba(61,74,99,0.15)",
    colorBorderSecondary: "rgba(61,74,99,0.10)",
    colorSplit: "rgba(61,74,99,0.12)",

    // Semantic
    colorError: "#ffb4ab",
    colorSuccess: "#6dd58c",
    colorWarning: "#ffb347",
    colorInfo: "#c3f5ff",

    // Typography
    fontFamily: '"Manrope", -apple-system, sans-serif',
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeHeading1: 28,
    fontSizeHeading2: 22,
    fontSizeHeading3: 18,

    // Shape
    borderRadius: 4,
    borderRadiusLG: 6,
    borderRadiusSM: 2,
    borderRadiusXS: 2,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 8,
    marginLG: 24,

    // Motion
    motionDurationMid: "0.2s",
    motionDurationSlow: "0.3s",

    // Shadow — ambient tinted
    boxShadow: "0px 8px 24px rgba(7,13,31,0.3)",
    boxShadowSecondary: "0px 4px 12px rgba(7,13,31,0.2)",
  },
  components: {
    Layout: {
      siderBg: "#111827",
      headerBg: "rgba(17,24,39,0.7)",
      bodyBg: "#0c1324",
      triggerBg: "#1a2235",
    },
    Menu: {
      darkItemBg: "#111827",
      darkSubMenuItemBg: "#0c1324",
      darkItemSelectedBg: "rgba(195,245,255,0.08)",
      darkItemSelectedColor: "#c3f5ff",
      darkItemColor: "#9aa5be",
      darkItemHoverColor: "#e8eaf0",
      darkItemHoverBg: "rgba(195,245,255,0.05)",
      iconSize: 16,
    },
    Table: {
      colorBgContainer: "#111827",
      headerBg: "#0c1324",
      rowHoverBg: "#222c42",
      borderColor: "transparent",
      colorTextHeading: "#9aa5be",
      fontSize: 13,
    },
    Card: {
      colorBgContainer: "#1a2235",
      paddingLG: 24,
      borderRadiusLG: 4,
    },
    Button: {
      primaryColor: "#003c4a",
      defaultBg: "transparent",
      defaultBorderColor: "rgba(195,245,255,0.2)",
      defaultColor: "#c3f5ff",
    },
    Input: {
      colorBgContainer: "#2e3447",
      activeBorderColor: "#c3f5ff",
      hoverBorderColor: "rgba(195,245,255,0.4)",
      activeShadow: "0 0 0 2px rgba(195,245,255,0.1)",
    },
    Select: {
      colorBgContainer: "#2e3447",
      optionSelectedBg: "rgba(195,245,255,0.08)",
    },
    Modal: {
      contentBg: "rgba(26,34,53,0.6)",
      headerBg: "transparent",
      footerBg: "transparent",
    },
    Drawer: {
      colorBgElevated: "rgba(17,24,39,0.85)",
    },
    DatePicker: {
      colorBgContainer: "#2e3447",
    },
    Badge: {
      colorBgContainer: "#c3f5ff",
      colorText: "#003c4a",
    },
    Tag: {
      defaultBg: "rgba(195,245,255,0.1)",
      defaultColor: "#c3f5ff",
    },
    Statistic: {
      titleFontSize: 12,
      contentFontSize: 28,
    },
    Tabs: {
      inkBarColor: "#c3f5ff",
      itemSelectedColor: "#c3f5ff",
      itemHoverColor: "#e8eaf0",
      itemColor: "#9aa5be",
    },
    Steps: {
      colorPrimary: "#c3f5ff",
      colorText: "#e8eaf0",
    },
  },
};
