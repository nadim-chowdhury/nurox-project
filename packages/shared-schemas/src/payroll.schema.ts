import { z } from "zod";

/**
 * Types of salary components
 */
export const payrollComponentTypeEnum = z.enum([
  "EARNING",
  "DEDUCTION",
  "STATUTORY", // PF, Tax, etc.
]);

export type PayrollComponentType = z.infer<typeof payrollComponentTypeEnum>;

/**
 * Salary Structure Template
 */
export const salaryStructureSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(255).optional(),
  components: z.array(
    z.object({
      name: z.string().min(1),
      type: payrollComponentTypeEnum,
      amountType: z.enum(["FIXED", "PERCENTAGE"]),
      value: z.number().min(0),
      isTaxable: z.boolean().default(true),
      dependsOn: z.string().optional(), // e.g., "PERCENTAGE" of "BASE"
    })
  ),
  isDefault: z.boolean().default(false),
});

export type SalaryStructureDto = z.infer<typeof salaryStructureSchema>;

/**
 * Payroll Run Status
 */
export const payrollRunStatusEnum = z.enum([
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "PROCESSED",
  "CANCELLED",
]);

export type PayrollRunStatus = z.infer<typeof payrollRunStatusEnum>;

/**
 * Payroll Run (Monthly Process)
 */
export const payrollRunSchema = z.object({
  id: z.string().uuid().optional(),
  period: z.string().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM"), // e.g., "2026-04"
  status: payrollRunStatusEnum.default("DRAFT"),
  totalGross: z.number().min(0).optional(),
  totalDeduction: z.number().min(0).optional(),
  totalNet: z.number().min(0).optional(),
  processedDate: z.string().datetime().optional().nullable(),
  notes: z.string().max(500).optional(),
});

export type PayrollRunDto = z.infer<typeof payrollRunSchema>;

/**
 * Tax Bracket Configuration (BD TIN Compliant)
 */
export const taxBracketSchema = z.object({
  fiscalYear: z.string().min(4).max(9), // e.g. "2025-26"
  threshold: z.number(), // Amount below which tax is 0
  brackets: z.array(
    z.object({
      upperLimit: z.number().nullable(), // null means infinite
      rate: z.number().min(0).max(100), // percentage
    })
  ),
});

export type TaxBracketDto = z.infer<typeof taxBracketSchema>;

/**
 * Payslip Response
 */
export const payslipSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().uuid(),
  employeeName: z.string(),
  employeeCode: z.string(),
  period: z.string(),
  earnings: z.array(z.object({ name: z.string(), amount: z.number() })),
  deductions: z.array(z.object({ name: z.string(), amount: z.number() })),
  grossPay: z.number(),
  netPay: z.number(),
  status: payrollRunStatusEnum,
  createdAt: z.string().datetime(),
});

export type PayslipDto = z.infer<typeof payslipSchema>;
