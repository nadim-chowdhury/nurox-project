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

export const systemApi = createApi({
  reducerPath: "systemApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["System", "Branches"],
  endpoints: (builder) => ({
    getSettings: builder.query<TenantSettings, void>({
      query: () => "/system/settings",
      providesTags: ["System"],
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
  useGetSettingsQuery,
  useGetCompanyProfileQuery,
  useUpdateCompanyProfileMutation,
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
} = systemApi;
