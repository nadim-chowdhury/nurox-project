import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";
import type { 
  CompanyProfileDto, 
  BranchDto, 
  CreateBranchDto, 
  UpdateBranchDto 
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

export const systemApi = createApi({
  reducerPath: "systemApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["System", "Branches", "Modules"],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthCheckResponse, void>({
      query: () => "/health",
    }),

    getSettings: builder.query<TenantSettings, void>({
      query: () => "/system/settings",
      providesTags: ["System"],
    }),

    getModules: builder.query<TenantModule[], void>({
      query: () => "/system/modules",
      providesTags: ["Modules"],
    }),

    getCompanyProfile: builder.query<CompanyProfileDto, void>({
      query: () => "/system/company",
      providesTags: ["System"],
    }),

    updateCompanyProfile: builder.mutation<CompanyProfileDto, CompanyProfileDto>({
      query: (body) => ({
        url: "/system/company",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["System"],
    }),

    getBranches: builder.query<BranchDto[], void>({
      query: () => "/system/branches",
      providesTags: ["Branches"],
    }),

    createBranch: builder.mutation<BranchDto, CreateBranchDto>({
      query: (body) => ({
        url: "/system/branches",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Branches"],
    }),

    updateBranch: builder.mutation<BranchDto, { id: string; data: UpdateBranchDto }>({
      query: ({ id, data }) => ({
        url: `/system/branches/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Branches"],
    }),

    deleteBranch: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/system/branches/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Branches"],
    }),
  }),
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
} = systemApi;
