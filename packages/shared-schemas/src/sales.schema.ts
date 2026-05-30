import { z } from "zod";

export const leadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
]);

export const createLeadSchema = z.object({
  name: z.string().min(1).max(150),
  company: z.string().max(150).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  source: z.string().max(100).optional(),
  status: leadStatusSchema.optional(),
  estimatedValue: z.number().nonnegative().optional(),
  assignedTo: z.string().uuid().optional(),
  notes: z.string().optional(),
  score: z.number().int().default(0),
  sourceDetails: z.record(z.string(), z.any()).optional().nullable(),
});

export type CreateLeadDto = z.infer<typeof createLeadSchema>;
export const updateLeadSchema = createLeadSchema.partial();
export type UpdateLeadDto = z.infer<typeof updateLeadSchema>;

export const dealStatusSchema = z.enum(["OPEN", "WON", "LOST"]);
export const dealStageSchema = z.enum([
  "PROSPECTING",
  "QUALIFICATION",
  "PROPOSAL",
  "NEGOTIATION",
  "CLOSED_WON",
  "CLOSED_LOST",
]);

export const createDealSchema = z.object({
  title: z.string().min(1).max(200),
  customerName: z.string().max(150).optional(),
  value: z.number().nonnegative().optional(),
  stage: dealStageSchema.optional(),
  status: dealStatusSchema.optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  notes: z.string().optional(),
  accountId: z.string().uuid().optional().nullable(),
  contactId: z.string().uuid().optional().nullable(),
});

export type CreateDealDto = z.infer<typeof createDealSchema>;
export const updateDealSchema = createDealSchema.partial();
export type UpdateDealDto = z.infer<typeof updateDealSchema>;

// Account & Contact
export const createAccountSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  industry: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable(),
  annualRevenue: z.number().min(0).optional().nullable(),
  taxBin: z.string().max(20).optional().nullable(),
  billingAddress: z.string().optional().nullable(),
});
export type CreateAccountDto = z.infer<typeof createAccountSchema>;

export const createContactSchema = z.object({
  id: z.string().uuid().optional(),
  accountId: z.string().uuid().optional().nullable(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
  isPrimary: z.boolean().default(false),
});
export type CreateContactDto = z.infer<typeof createContactSchema>;

// Activity Log
export const activityTypeSchema = z.enum([
  "CALL",
  "EMAIL",
  "MEETING",
  "NOTE",
  "TASK",
]);
export const createActivityLogSchema = z.object({
  id: z.string().uuid().optional(),
  entityType: z.enum(["LEAD", "CONTACT", "DEAL", "ACCOUNT"]),
  entityId: z.string().uuid(),
  type: activityTypeSchema,
  subject: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  activityDate: z.string().datetime(),
  performedById: z.string().uuid(),
  metadata: z.record(z.string(), z.any()).optional().nullable(),
});
export type CreateActivityLogDto = z.infer<typeof createActivityLogSchema>;

// Quotation
export const quotationStatusSchema = z.enum([
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
]);
export const createQuotationLineSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().min(0.0001),
  unitPrice: z.number().min(0),
  discountPercent: z.number().min(0).max(100).default(0),
  taxPercent: z.number().min(0).max(100).default(15),
  sdPercent: z.number().min(0).max(100).default(0),
  productName: z.string().optional(),
});
export const createQuotationSchema = z.object({
  id: z.string().uuid().optional(),
  accountId: z.string().uuid().optional().nullable(),
  contactId: z.string().uuid().optional().nullable(),
  dealId: z.string().uuid().optional().nullable(),
  quotationNumber: z.string().optional(),
  version: z.number().default(1),
  status: quotationStatusSchema.default("DRAFT"),
  issueDate: z.string().datetime(),
  validUntil: z.string().datetime(),
  currency: z.string().default("USD"),
  lines: z.array(createQuotationLineSchema),
});
export type CreateQuotationDto = z.infer<typeof createQuotationSchema>;

// Sales Order
export const soStatusSchema = z.enum([
  "DRAFT",
  "CONFIRMED",
  "PARTIALLY_DELIVERED",
  "DELIVERED",
  "INVOICED",
  "CANCELLED",
]);
export const createSalesOrderLineSchema = createQuotationLineSchema.extend({
  deliveredQuantity: z.number().default(0),
  invoicedQuantity: z.number().default(0),
});
export const createSalesOrderSchema = z.object({
  id: z.string().uuid().optional(),
  quotationId: z.string().uuid().optional().nullable(),
  accountId: z.string().uuid(),
  soNumber: z.string().optional(),
  status: soStatusSchema.default("DRAFT"),
  orderDate: z.string().datetime(),
  currency: z.string().default("USD"),
  lines: z.array(createSalesOrderLineSchema),
});
export type CreateSalesOrderDto = z.infer<typeof createSalesOrderSchema>;

export const invoiceFromSalesOrderSchema = z.object({
  dueDate: z.string().datetime().optional(),
  sellerName: z.string().min(1),
  sellerBin: z.string().min(1),
  sellerAddress: z.string().min(1),
  buyerName: z.string().optional(),
  buyerBin: z.string().optional(),
  buyerAddress: z.string().optional(),
  vehicleNumber: z.string().optional(),
});

export type InvoiceFromSalesOrderDto = z.infer<
  typeof invoiceFromSalesOrderSchema
>;

export const salesOrderToInvoiceResultSchema = z.object({
  salesOrderId: z.string().uuid(),
  financeInvoiceId: z.string().uuid(),
  mushak63Id: z.string().uuid(),
  invoiceNumber: z.string(),
});

// Delivery Order
export const doStatusSchema = z.enum([
  "DRAFT",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);
export const createDeliveryOrderLineSchema = z.object({
  soLineId: z.string().uuid(),
  productId: z.string().uuid(),
  quantity: z.number().min(1),
});
export const createDeliveryOrderSchema = z.object({
  id: z.string().uuid().optional(),
  salesOrderId: z.string().uuid(),
  doNumber: z.string().optional(),
  status: doStatusSchema.default("DRAFT"),
  deliveryDate: z.string().datetime().optional().nullable(),
  lines: z.array(createDeliveryOrderLineSchema),
});
export type CreateDeliveryOrderDto = z.infer<typeof createDeliveryOrderSchema>;

// Pricelist
export const createPricelistItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  overridePrice: z.number().min(0).optional().nullable(),
  discountPercent: z.number().min(0).max(100).optional().nullable(),
});
export const createPricelistSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  currency: z.string().default("USD"),
  isActive: z.boolean().default(true),
  validFrom: z.string().datetime().optional().nullable(),
  validTo: z.string().datetime().optional().nullable(),
  items: z.array(createPricelistItemSchema),
});
export type CreatePricelistDto = z.infer<typeof createPricelistSchema>;
