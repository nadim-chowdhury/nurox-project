import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";

export interface DashboardData {
  kpis: {
    totalEmployees: number;
    revenueMTD: number;
    pendingInvoices: number;
    pipelineValue: number;
  };
  pipelineStats: { stage: string; count: number; value: number }[];
  taskStats: { status: string; count: number }[];
}

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardData, void>({
      query: () => "/analytics/dashboard",
      providesTags: ["Dashboard"],
    }),
    getKPIs: builder.query<DashboardData["kpis"], void>({
      query: () => "/analytics/kpis",
      providesTags: ["Dashboard"],
    }),
    getAuditLogs: builder.query<any, any>({
      query: (params) => ({
        url: "/system/audit-logs",
        params,
      }),
    }),
    getAlerts: builder.query<any[], void>({
      query: () => "/analytics/alerts",
    }),
  }),
});

export const { 
  useGetDashboardQuery, 
  useGetKPIsQuery,
  useGetAuditLogsQuery,
  useGetAlertsQuery,
} = analyticsApi;
