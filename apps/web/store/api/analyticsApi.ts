import { baseApi } from "./baseApi";

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

export const analyticsApi = baseApi.injectEndpoints({
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
      providesTags: ["AuditLog"],
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
    getComparison: builder.query<
      any,
      {
        currentStart: string;
        currentEnd: string;
        prevStart: string;
        prevEnd: string;
      }
    >({
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
  overrideExisting: false,
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
