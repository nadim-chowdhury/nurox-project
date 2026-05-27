import { z } from "zod";
import { paginationMetaSchema } from "./common.schema";

// Helper for pagination
export const createPaginatedSchema = <T extends z.ZodTypeAny>(schema: T) => {
  return z.object({
    data: z.array(schema),
    meta: paginationMetaSchema,
  });
};

// Enums
export const SubscriptionStatusEnum = z.enum([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "frozen",
  "incomplete",
  "incomplete_expired",
  "suspended",
]);

export const InvoiceStatusEnum = z.enum([
  "draft",
  "open",
  "paid",
  "uncollectible",
  "void",
]);

export const PaymentProviderEnum = z.enum(["stripe", "sslcommerz"]);

// DTOs for Subscription Plans
export const subscriptionPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  monthlyPrice: z.number().min(0),
  annualPrice: z.number().min(0),
  currency: z.string().length(3),
  stripeProductId: z.string().optional(),
  features: z.object({
    maxUsers: z.number(),
    storageLimitGb: z.number(),
    apiRateLimit: z.number(),
    modules: z.array(z.string()),
  }),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SubscriptionPlanDto = z.infer<typeof subscriptionPlanSchema>;

// DTOs for Tenant Subscription
export const tenantSubscriptionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  planId: z.string().uuid(),
  plan: subscriptionPlanSchema.optional(),
  status: SubscriptionStatusEnum,
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
  trialEndsAt: z.string().datetime().nullable(),
  currentPeriodStart: z.string().datetime().nullable(),
  currentPeriodEnd: z.string().datetime().nullable(),
  cancelAtPeriodEnd: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TenantSubscriptionDto = z.infer<typeof tenantSubscriptionSchema>;

// DTOs for Invoices
export const billingInvoiceSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  amountDue: z.number(),
  amountPaid: z.number(),
  amountRemaining: z.number(),
  currency: z.string().length(3),
  status: InvoiceStatusEnum,
  hostedInvoiceUrl: z.string().url().nullable(),
  pdfUrl: z.string().url().nullable(),
  stripeInvoiceId: z.string().optional(),
  paymentProvider: PaymentProviderEnum.default("stripe"),
  dueDate: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type BillingInvoiceDto = z.infer<typeof billingInvoiceSchema>;

export const billingInvoiceListResponseSchema =
  createPaginatedSchema(billingInvoiceSchema);
export type BillingInvoiceListResponseDto = z.infer<
  typeof billingInvoiceListResponseSchema
>;

// DTO for Checkout / Upgrade
export const checkoutRequestSchema = z.object({
  planId: z.string().uuid(),
  isAnnual: z.boolean().default(false),
  paymentProvider: PaymentProviderEnum.default("stripe"),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export type CheckoutRequestDto = z.infer<typeof checkoutRequestSchema>;

export const checkoutResponseSchema = z.object({
  url: z.string().url(),
});

export type CheckoutResponseDto = z.infer<typeof checkoutResponseSchema>;
