import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface TenantSettings {
  name: string;
  primaryColor: string;
  logoUrl: string;
}

export const systemApi = createApi({
  reducerPath: "systemApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
    prepareHeaders: (headers) => {
      // Tenant ID is injected by middleware into the request,
      // but for client-side fetches we might need to extract it from hostname
      const hostname = window.location.hostname;
      let tenantId = "public";
      if (hostname.includes("localhost") && hostname.split(".").length > 1) {
        tenantId = hostname.split(".")[0] || "public";
      }
      headers.set("x-tenant-id", tenantId);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSettings: builder.query<TenantSettings, void>({
      query: () => "/system/settings",
    }),
  }),
});

export const { useGetSettingsQuery } = systemApi;
