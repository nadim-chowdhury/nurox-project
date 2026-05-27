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
