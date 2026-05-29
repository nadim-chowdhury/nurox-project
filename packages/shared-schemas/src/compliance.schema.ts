import { z } from "zod";

export const taxJurisdictionEnum = z.enum(["BD", "IN", "US", "GLOBAL"]);
export type TaxJurisdiction = z.infer<typeof taxJurisdictionEnum>;

export const calculateTaxPayloadSchema = z.object({
  jurisdiction: taxJurisdictionEnum,
  baseAmount: z.number().min(0),
  transactionType: z.enum(["SALES", "PURCHASE", "PAYROLL", "INTERCOMPANY"]),
  originState: z.string().optional(),
  destinationState: z.string().optional(),
  productCategory: z.string().optional(),
  sdRate: z.number().min(0).optional(),
  vatRate: z.number().min(0).optional(),
});

export type CalculateTaxPayloadDto = z.infer<typeof calculateTaxPayloadSchema>;

export const taxRuleSchema = z.object({
  id: z.string().uuid(),
  jurisdiction: taxJurisdictionEnum,
  taxName: z.string().min(1),
  ratePercentage: z.number().min(0),
  isActive: z.boolean().default(true),
});

export const createTaxRuleSchema = taxRuleSchema.omit({ id: true });
export type CreateTaxRuleDto = z.infer<typeof createTaxRuleSchema>;

export const complianceAlertSchema = z.object({
  id: z.string().uuid(),
  jurisdiction: taxJurisdictionEnum,
  deadlineType: z.string().min(1), // e.g. "VAT_RETURN", "TDS_FILING"
  dueDate: z.string().datetime(),
  description: z.string().optional(),
});

/**
 * Bangladesh Mushak 6.3 (Tax Invoice) Schema
 */
export const mushak63ItemSchema = z.object({
  itemName: z.string().min(1),
  hsCode: z.string().optional(),
  unitOfSupply: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
  totalPriceExclTax: z.number().min(0),
  sdRate: z.number().min(0).default(0),
  sdAmount: z.number().min(0).default(0),
  vatRate: z.number().min(0).default(0),
  vatAmount: z.number().min(0).default(0),
  totalAmountInclTax: z.number().min(0),
});

export const mushak63Schema = z.object({
  id: z.string().uuid().optional(),
  invoiceNumber: z.string().min(1),
  issueDate: z.string().datetime(),
  sellerName: z.string().min(1),
  sellerBin: z.string().min(1),
  sellerAddress: z.string().min(1),
  buyerName: z.string().min(1),
  buyerBin: z.string().optional(),
  buyerAddress: z.string().min(1),
  vehicleNumber: z.string().optional(),
  totalBaseAmount: z.number().min(0),
  totalSdAmount: z.number().min(0).default(0),
  totalVatAmount: z.number().min(0),
  totalAmountInclTax: z.number().min(0),
  items: z.array(mushak63ItemSchema).min(1),
});

export type Mushak63Dto = z.infer<typeof mushak63Schema>;
export type Mushak63ItemDto = z.infer<typeof mushak63ItemSchema>;

/**
 * Bangladesh VDS (Mushak 6.6) Certificate Schema
 */
export const vdsCertificateSchema = z.object({
  id: z.string().uuid().optional(),
  certificateNumber: z.string().min(1),
  issueDate: z.string().datetime(),
  supplierName: z.string().min(1),
  supplierBin: z.string().min(1),
  referenceMushak63No: z.string().min(1),
  referenceMushak63Date: z.string().datetime(),
  totalAmount: z.number().min(0),
  vatAmount: z.number().min(0),
  deductedVatAmount: z.number().min(0),
  treasuryChallanNo: z.string().optional(),
  treasuryChallanDate: z.string().datetime().optional(),
});

export type VdsCertificateDto = z.infer<typeof vdsCertificateSchema>;

/**
 * Bangladesh Mushak 9.1 (Monthly VAT Return) Schema
 */
export const mushak91Schema = z.object({
  id: z.string().uuid().optional(),
  period: z.string(), // e.g. "2026-05"
  issueDate: z.string().datetime().optional(),

  // Part 3: Output Tax (Sales)
  totalOutputVat: z.number().default(0),
  totalOutputSd: z.number().default(0),
  totalSalesValue: z.number().default(0),

  // Part 4: Input Tax (Purchases)
  totalInputVat: z.number().default(0),
  totalInputSd: z.number().default(0),
  totalPurchaseValue: z.number().default(0),

  // Part 5: Increasing Adjustments
  increasingAdjustments: z.number().default(0),

  // Part 6: Decreasing Adjustments
  decreasingAdjustments: z.number().default(0),

  // Part 7: Net Tax Calculation
  netTaxPayable: z.number().default(0),

  status: z.enum(["DRAFT", "SUBMITTED", "APPROVED"]).default("DRAFT"),
  payload: z.any().optional(), // Full breakdown
});

export type Mushak91Dto = z.infer<typeof mushak91Schema>;

export const generateVatReturnSchema = z.object({
  jurisdiction: taxJurisdictionEnum,
  period: z.string(), // YYYY-MM
});

export type GenerateVatReturnDto = z.infer<typeof generateVatReturnSchema>;
