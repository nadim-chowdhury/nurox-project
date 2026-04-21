import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
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

export const salesApi = createApi({
  reducerPath: "salesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  }),
  tagTypes: ["Deal", "Lead"],
  endpoints: (builder) => ({
    getDeals: builder.query<UnifiedResponse<Deal[]>, void>({
      query: () => "/sales/deals",
      providesTags: ["Deal"],
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
      invalidatesTags: ["Deal"],
    }),
  }),
});

export const { useGetDealsQuery, useGetLeadsQuery, useCreateDealMutation } =
  salesApi;
