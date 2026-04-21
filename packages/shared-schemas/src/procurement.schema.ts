import { z } from "zod";

export const vendorSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Vendor name is required"),
  code: z.string().min(1, "Vendor code is required"),
  contactPerson: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  currency: z.string().default("USD"),
  paymentTerms: z.string().optional().nullable(),
  creditLimit: z.number().min(0).default(0),
  kycStatus: z.enum(["PENDING", "VERIFIED", "REJECTED"]).default("PENDING"),
  taxId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type VendorDto = z.infer<typeof vendorSchema>;

export const purchaseRequestStatusEnum = z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "CONVERTED_TO_RFQ", "CONVERTED_TO_PO", "CANCELLED"]);
export type PurchaseRequestStatus = z.infer<typeof purchaseRequestStatusEnum>;

export const purchaseRequestLineSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().min(1),
  estimatedUnitCost: z.number().min(0).optional().nullable(),
  requiredDate: z.string().datetime().optional().nullable(),
});

export const purchaseRequestSchema = z.object({
  id: z.string().uuid().optional(),
  prNumber: z.string().optional(),
  departmentId: z.string().uuid(),
  requestedById: z.string().uuid(),
  status: purchaseRequestStatusEnum.default("DRAFT"),
  totalEstimatedCost: z.number().default(0),
  notes: z.string().optional().nullable(),
  lines: z.array(purchaseRequestLineSchema),
});

export type PurchaseRequestDto = z.infer<typeof purchaseRequestSchema>;

export const rfqStatusEnum = z.enum(["DRAFT", "SENT", "RECEIVED", "CLOSED", "CANCELLED"]);
export type RfqStatus = z.infer<typeof rfqStatusEnum>;

export const rfqSchema = z.object({
  id: z.string().uuid().optional(),
  rfqNumber: z.string().optional(),
  status: rfqStatusEnum.default("DRAFT"),
  deadline: z.string().datetime(),
  notes: z.string().optional().nullable(),
  vendorIds: z.array(z.string().uuid()),
  lines: z.array(purchaseRequestLineSchema), // Reuse line schema for RFQ
});

export type RfqDto = z.infer<typeof rfqSchema>;

export const vendorQuoteSchema = z.object({
  id: z.string().uuid().optional(),
  rfqId: z.string().uuid(),
  vendorId: z.string().uuid(),
  quoteNumber: z.string(),
  quoteDate: z.string().datetime(),
  validUntil: z.string().datetime().optional().nullable(),
  currency: z.string().default("USD"),
  totalAmount: z.number(),
  lines: z.array(z.object({
    productId: z.string().uuid(),
    variantId: z.string().uuid().optional().nullable(),
    quotedQuantity: z.number(),
    quotedUnitCost: z.number(),
    leadTimeDays: z.number().optional().nullable(),
  })),
});

export type VendorQuoteDto = z.infer<typeof vendorQuoteSchema>;

export const poStatusEnum = z.enum(["DRAFT", "SENT", "PARTIALLY_RECEIVED", "FULLY_RECEIVED", "CANCELLED", "CLOSED"]);
export type PoStatus = z.infer<typeof poStatusEnum>;

export const purchaseOrderLineSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  quantity: z.number().min(1),
  unitCost: z.number().min(0),
  taxAmount: z.number().default(0),
  discountAmount: z.number().default(0),
  totalAmount: z.number(),
  receivedQuantity: z.number().default(0),
});

export const purchaseOrderSchema = z.object({
  id: z.string().uuid().optional(),
  poNumber: z.string().optional(),
  vendorId: z.string().uuid(),
  status: poStatusEnum.default("DRAFT"),
  orderDate: z.string().datetime(),
  expectedDeliveryDate: z.string().datetime().optional().nullable(),
  currency: z.string().default("USD"),
  subTotal: z.number(),
  taxTotal: z.number().default(0),
  discountTotal: z.number().default(0),
  grandTotal: z.number(),
  paymentTerms: z.string().optional().nullable(),
  shippingAddress: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  version: z.number().default(1),
  lines: z.array(purchaseOrderLineSchema),
});

export type PurchaseOrderDto = z.infer<typeof purchaseOrderSchema>;

export const grnStatusEnum = z.enum(["PENDING", "COMPLETED", "CANCELLED"]);
export type GrnStatus = z.infer<typeof grnStatusEnum>;

export const grnLineSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  poLineId: z.string().uuid(),
  receivedQuantity: z.number().min(1),
  unitCost: z.number().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  warehouseId: z.string().uuid(),
  binId: z.string().uuid().optional().nullable(),
});

export const grnSchema = z.object({
  id: z.string().uuid().optional(),
  grnNumber: z.string().optional(),
  poId: z.string().uuid(),
  receivedDate: z.string().datetime(),
  receivedById: z.string().uuid(),
  status: grnStatusEnum.default("PENDING"),
  notes: z.string().optional().nullable(),
  lines: z.array(grnLineSchema),
});

export type GrnDto = z.infer<typeof grnSchema>;

export const debitNoteSchema = z.object({
  id: z.string().uuid().optional(),
  vendorId: z.string().uuid(),
  grnId: z.string().uuid().optional().nullable(),
  poId: z.string().uuid().optional().nullable(),
  amount: z.number().min(0),
  reason: z.string(),
  date: z.string().datetime(),
});

export type DebitNoteDto = z.infer<typeof debitNoteSchema>;
