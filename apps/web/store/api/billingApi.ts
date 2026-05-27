import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";
import type {
  SubscriptionPlanDto,
  TenantSubscriptionDto,
  BillingInvoiceListResponseDto,
  CheckoutRequestDto,
  CheckoutResponseDto,
} from "@repo/shared-schemas";

export const billingApi = createApi({
  reducerPath: "billingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Subscription", "Invoice"],
  endpoints: (builder) => ({
    getPlans: builder.query<SubscriptionPlanDto[], void>({
      query: () => "/billing/plans",
    }),
    getCurrentSubscription: builder.query<TenantSubscriptionDto, void>({
      query: () => "/billing/subscription",
      providesTags: ["Subscription"],
    }),
    getInvoices: builder.query<BillingInvoiceListResponseDto, void>({
      query: () => "/billing/invoices",
      providesTags: ["Invoice"],
    }),
    createCheckoutSession: builder.mutation<
      CheckoutResponseDto,
      CheckoutRequestDto
    >({
      query: (body) => ({
        url: "/billing/checkout",
        method: "POST",
        body,
      }),
    }),
    createPortalSession: builder.mutation<
      CheckoutResponseDto,
      { returnUrl: string }
    >({
      query: (body) => ({
        url: "/billing/portal",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetCurrentSubscriptionQuery,
  useGetInvoicesQuery,
  useCreateCheckoutSessionMutation,
  useCreatePortalSessionMutation,
} = billingApi;
