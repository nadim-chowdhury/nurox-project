import { baseApi } from "./baseApi";
import type {
  SubscriptionPlanDto,
  TenantSubscriptionDto,
  BillingInvoiceListResponseDto,
  CheckoutRequestDto,
  CheckoutResponseDto,
} from "@repo/shared-schemas";

export const billingApi = baseApi.injectEndpoints({
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
      providesTags: ["Invoice_Billing"],
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
      invalidatesTags: ["Subscription"],
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
  overrideExisting: false,
});

export const {
  useGetPlansQuery,
  useGetCurrentSubscriptionQuery,
  useGetInvoicesQuery,
  useCreateCheckoutSessionMutation,
  useCreatePortalSessionMutation,
} = billingApi;
