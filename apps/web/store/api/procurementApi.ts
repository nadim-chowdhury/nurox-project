import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";
import type {
  VendorDto,
  PurchaseRequestDto,
  RfqDto,
  VendorQuoteDto,
  PurchaseOrderDto,
  GrnDto,
} from "@repo/shared-schemas";

export const procurementApi = createApi({
  reducerPath: "procurementApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Vendor", "PR", "RFQ", "PO", "GRN"],
  endpoints: (builder) => ({
    getVendors: builder.query<any[], void>({
      query: () => "/procurement/vendors",
      providesTags: ["Vendor"],
    }),

    createVendor: builder.mutation<any, VendorDto>({
      query: (body) => ({
        url: "/procurement/vendors",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vendor"],
    }),

    getVendorScorecard: builder.query<any, string>({
      query: (id) => `/procurement/vendors/${id}/scorecard`,
      providesTags: ["Vendor"],
    }),

    createPR: builder.mutation<any, PurchaseRequestDto>({
      query: (body) => ({
        url: "/procurement/purchase-requests",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PR"],
    }),

    createRFQ: builder.mutation<any, RfqDto>({
      query: (body) => ({
        url: "/procurement/rfqs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RFQ"],
    }),

    getRfqComparison: builder.query<any[], string>({
      query: (id) => `/procurement/rfqs/${id}/comparison`,
      providesTags: ["RFQ"],
    }),

    submitQuote: builder.mutation<any, VendorQuoteDto>({
      query: (body) => ({
        url: "/procurement/quotes",
        method: "POST",
        body,
      }),
      invalidatesTags: ["RFQ"],
    }),

    createPO: builder.mutation<any, PurchaseOrderDto>({
      query: (body) => ({
        url: "/procurement/purchase-orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PO"],
    }),

    sendPO: builder.mutation<any, string>({
      query: (id) => ({
        url: `/procurement/purchase-orders/${id}/send`,
        method: "POST",
      }),
      invalidatesTags: ["PO"],
    }),

    verifyMatch: builder.query<any, string>({
      query: (id) => `/procurement/purchase-orders/${id}/verify-match`,
      providesTags: ["PO"],
    }),

    createGRN: builder.mutation<any, GrnDto>({
      query: (body) => ({
        url: "/procurement/grns",
        method: "POST",
        body,
      }),
      invalidatesTags: ["GRN", "PO"],
    }),

    allocateLandedCost: builder.mutation<any, { id: string; costs: any[] }>({
      query: ({ id, costs }) => ({
        url: `/procurement/grns/${id}/landed-costs`,
        method: "POST",
        body: costs,
      }),
      invalidatesTags: ["GRN"],
    }),

    createPurchaseReturn: builder.mutation<any, any>({
      query: (body) => ({
        url: "/procurement/returns",
        method: "POST",
        body,
      }),
      invalidatesTags: ["GRN", "Stock"],
    }),
  }),
});

export const {
  useGetVendorsQuery,
  useCreateVendorMutation,
  useGetVendorScorecardQuery,
  useCreatePRMutation,
  useCreateRFQMutation,
  useGetRfqComparisonQuery,
  useSubmitQuoteMutation,
  useCreatePOMutation,
  useSendPOMutation,
  useVerifyMatchQuery,
  useCreateGRNMutation,
  useAllocateLandedCostMutation,
  useCreatePurchaseReturnMutation,
} = procurementApi;
