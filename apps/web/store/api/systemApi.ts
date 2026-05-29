import { baseApi } from "./baseApi";
import type {
  CompanyProfileDto,
  BranchDto,
  CreateBranchDto,
  UpdateBranchDto,
} from "@repo/shared-schemas";

export interface TenantSettings {
  name: string;
  primaryColor: string;
  logoUrl: string;
}

export interface TenantModule {
  moduleKey: string;
  isEnabled: boolean;
}

export interface HealthCheckResponse {
  status: "ok" | "error" | "shutting_down";
  info: Record<string, any>;
  error: Record<string, any>;
  details: Record<string, any>;
}

export const systemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHealth: builder.query<HealthCheckResponse, void>({
      query: () => "/health",
    }),

    getSettings: builder.query<TenantSettings, void>({
      query: () => "/system/settings",
      providesTags: ["Setting"],
    }),

    getModules: builder.query<TenantModule[], void>({
      query: () => "/system/modules",
      providesTags: ["Module"],
    }),

    getCompanyProfile: builder.query<CompanyProfileDto, void>({
      query: () => "/system/company",
      providesTags: ["Setting"],
    }),

    updateCompanyProfile: builder.mutation<
      CompanyProfileDto,
      CompanyProfileDto
    >({
      query: (body) => ({
        url: "/system/company",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Setting"],
    }),

    getBranches: builder.query<BranchDto[], void>({
      query: () => "/system/branches",
      providesTags: ["Branch"],
    }),

    createBranch: builder.mutation<BranchDto, CreateBranchDto>({
      query: (body) => ({
        url: "/system/branches",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Branch"],
    }),

    updateBranch: builder.mutation<
      BranchDto,
      { id: string; data: UpdateBranchDto }
    >({
      query: ({ id, data }) => ({
        url: `/system/branches/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Branch"],
    }),

    deleteBranch: builder.mutation<void, string>({
      query: (id) => ({
        url: `/system/branches/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Branch"],
    }),

    getCalendars: builder.query<any[], void>({
      query: () => "/system/calendars",
      providesTags: ["Calendar"],
    }),

    createCalendar: builder.mutation<any, any>({
      query: (body) => ({
        url: "/system/calendars",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Calendar"],
    }),

    updateCalendar: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/system/calendars/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Calendar"],
    }),

    deleteCalendar: builder.mutation<void, string>({
      query: (id) => ({
        url: `/system/calendars/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Calendar"],
    }),

    getHolidays: builder.query<any[], { branchId?: string } | void>({
      query: (params) => ({
        url: "/system/holidays",
        params: params || undefined,
      }),
      providesTags: ["Holiday"],
    }),

    createHoliday: builder.mutation<any, any>({
      query: (body) => ({
        url: "/system/holidays",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Holiday"],
    }),

    updateHoliday: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/system/holidays/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Holiday"],
    }),

    deleteHoliday: builder.mutation<void, string>({
      query: (id) => ({
        url: `/system/holidays/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Holiday"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHealthQuery,
  useGetSettingsQuery,
  useGetModulesQuery,
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
  useGetCalendarsQuery,
  useCreateCalendarMutation,
  useUpdateCalendarMutation,
  useDeleteCalendarMutation,
  useGetHolidaysQuery,
  useCreateHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,
} = systemApi;
