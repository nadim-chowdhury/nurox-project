import { baseApi } from "./baseApi";
import type { UnifiedResponse } from "./projectsApi";

export interface Deal {
  id: string;
  title: string;
  customer: string;
  value: number;
  stage: string;
  probability: number;
  owner: string;
  closeDate: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  source: string;
  status: string;
  assignedTo: string;
  createdAt: string;
}

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDeals: builder.query<UnifiedResponse<Deal[]>, void>({
      query: () => "/sales/deals",
      providesTags: ["Opportunity"],
    }),
    getLeads: builder.query<UnifiedResponse<Lead[]>, void>({
      query: () => "/sales/leads",
      providesTags: ["Lead"],
    }),
    createDeal: builder.mutation<UnifiedResponse<Deal>, Partial<Deal>>({
      query: (body) => ({
        url: "/sales/deals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Opportunity"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDealsQuery, useGetLeadsQuery, useCreateDealMutation } =
  salesApi;
