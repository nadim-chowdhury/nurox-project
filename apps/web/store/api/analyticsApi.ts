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
  revenueGrowth: { name: string; value: number }[];
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
}

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Dashboard"],
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardData, AnalyticsParams>({
      query: (params) => ({
        url: "/analytics/dashboard",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getKPIs: builder.query<DashboardData["kpis"], AnalyticsParams>({
      query: (params) => ({
        url: "/analytics/kpis",
        params,
      }),
      providesTags: ["Dashboard"],
    }),
    getAuditLogs: builder.query<any, any>({
      query: (params) => ({
        url: "/system/audit-logs",
        params,
      }),
    }),
    getAlerts: builder.query<any[], AnalyticsParams | void>({
      query: (params) => ({
        url: "/analytics/alerts",
        params: params || undefined,
      }),
    }),
    getDepartmentKPIs: builder.query<any[], void>({
      query: () => "/analytics/departments",
    }),
    getComparison: builder.query<any, { currentStart: string; currentEnd: string; prevStart: string; prevEnd: string }>({
      query: (params) => ({
        url: "/analytics/comparison",
        params,
      }),
    }),
    getHRAnalytics: builder.query<any, void>({
      query: () => "/analytics/hr",
    }),
    getPerformanceCalibration: builder.query<any[], void>({
      query: () => "/analytics/performance-calibration",
    }),
  }),
});

export const { 
  useGetDashboardQuery, 
  useGetKPIsQuery,
  useGetAuditLogsQuery,
  useGetAlertsQuery,
  useGetDepartmentKPIsQuery,
  useGetComparisonQuery,
  useGetHRAnalyticsQuery,
  useGetPerformanceCalibrationQuery,
} = analyticsApi;
