import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { UnifiedResponse } from "./projectsApi";

export const salesApi = createApi({
  reducerPath: "salesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  }),
  tagTypes: ["Deal", "Lead"],
  endpoints: (builder) => ({
    getDeals: builder.query<UnifiedResponse<any[]>, void>({
      query: () => "/sales/deals",
      providesTags: ["Deal"],
    }),
    getLeads: builder.query<UnifiedResponse<any[]>, void>({
      query: () => "/sales/leads",
      providesTags: ["Lead"],
    }),
    createDeal: builder.mutation<UnifiedResponse<any>, Partial<any>>({
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
