"use client";

import React, { useEffect } from "react";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/store";
import { nuroxTheme } from "@repo/ui-tokens/antd-theme";
import { setDirection, setPrimaryColor, setLogoUrl } from "../../store/slices/uiSlice";
import { useGetSettingsQuery } from "../../store/api/systemApi";
import enUS from "antd/locale/en_US";
import bnBD from "antd/locale/bn_BD";
import arEG from "antd/locale/ar_EG";

const antdLocales: Record<string, any> = {
  en: enUS,
  bn: bnBD,
  ar: arEG,
};

export function AntdProvider({
  children,
  locale,
  direction: initialDirection,
}: {
  children: React.ReactNode;
  locale: string;
  direction: "ltr" | "rtl";
}) {
  const dispatch = useDispatch();
  const { theme, primaryColor, direction } = useSelector(
    (state: RootState) => state.ui,
  );

  // Fetch tenant-specific branding
  const { data: settings } = useGetSettingsQuery();

  useEffect(() => {
    if (settings?.primaryColor) {
      dispatch(setPrimaryColor(settings.primaryColor));
    }
    if (settings?.logoUrl) {
      dispatch(setLogoUrl(settings.logoUrl));
    }
  }, [settings, dispatch]);

  // Sync direction from server-side detection to Redux on mount/change
  useEffect(() => {
    dispatch(setDirection(initialDirection));
  }, [initialDirection, dispatch]);

  // Sync RTL direction natively deeply into HTML for logical properties
  useEffect(() => {
    document.documentElement.dir = direction;
    if (direction === "rtl") {
      document.documentElement.classList.add("rtl");
    } else {
      document.documentElement.classList.remove("rtl");
    }
  }, [direction]);

  return (
    <ConfigProvider
      direction={direction}
      locale={antdLocales[locale] || enUS}
      theme={{
        ...nuroxTheme,
        algorithm:
          theme === "dark"
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        token: {
          ...nuroxTheme.token,
          // Dynamic primary color replacement from Tenant Branding settings
          colorPrimary: primaryColor,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
