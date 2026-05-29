import { baseApi } from "./baseApi";

export interface AuditLog {
  id: string;
  tenantId: string;
  userId: string | null;
  action: string;
  module: string;
  description: string;
  entityType: string | null;
  entityId: string | null;
  oldValue: Record<string, any> | null;
  newValue: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  correlationId: string | null;
  durationMs: number | null;
  createdAt: string;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<
      PaginatedAuditLogs,
      { page?: number; limit?: number; module?: string; userId?: string }
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.limit) queryParams.append("limit", params.limit.toString());
        if (params.module) queryParams.append("module", params.module);
        if (params.userId) queryParams.append("userId", params.userId);

        return {
          url: `/system/audit-logs?${queryParams.toString()}`,
        };
      },
      providesTags: ["AuditLog"],
    }),
    exportGdprData: builder.mutation<Blob, string>({
      query: (userId) => ({
        url: `/gdpr/export/${userId}`,
        method: "GET",
        responseHandler: (response) => response.blob(),
      }),
    }),
    eraseGdprData: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (userId) => ({
        url: `/gdpr/erase/${userId}`,
        method: "POST",
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAuditLogsQuery,
  useExportGdprDataMutation,
  useEraseGdprDataMutation,
} = auditApi;
