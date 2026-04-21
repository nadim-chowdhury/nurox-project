import { z } from "zod";

export const accountTypeEnum = z.enum(["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]);
export type AccountType = z.infer<typeof accountTypeEnum>;

export const accountSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, "Account code is required"),
  name: z.string().min(1, "Account name is required"),
  type: accountTypeEnum,
  description: z.string().optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  currency: z.string().default("USD"),
  isActive: z.boolean().default(true),
});

export type AccountDto = z.infer<typeof accountSchema>;

export const journalStatusEnum = z.enum(["DRAFT", "POSTED", "REVERSED"]);
export type JournalStatus = z.infer<typeof journalStatusEnum>;

export const journalLineSchema = z.object({
  accountId: z.string().uuid(),
  description: z.string().optional().nullable(),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0),
});

export const journalEntrySchema = z.object({
  id: z.string().uuid().optional(),
  entryDate: z.string().datetime(),
  description: z.string().optional().nullable(),
  reference: z.string().optional().nullable(),
  status: journalStatusEnum.default("DRAFT"),
  lines: z.array(journalLineSchema).min(2, "At least two lines are required"),
}).refine((data) => {
  const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
  const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);
  return Math.abs(totalDebit - totalCredit) < 0.01;
}, {
  message: "Journal entry must be balanced (Debits must equal Credits)",
});

export type JournalEntryDto = z.infer<typeof journalEntrySchema>;

export const invoiceStatusEnum = z.enum(["DRAFT", "SENT", "PARTIALLY_PAID", "PAID", "OVERDUE", "VOID"]);
export type InvoiceStatus = z.infer<typeof invoiceStatusEnum>;

export const invoiceLineSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  taxRateId: z.string().uuid().optional().nullable(),
});

export const invoiceSchema = z.object({
  id: z.string().uuid().optional(),
  invoiceNumber: z.string().min(1),
  customerName: z.string().min(1),
  customerEmail: z.string().email().optional().nullable(),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime(),
  status: invoiceStatusEnum.default("DRAFT"),
  lines: z.array(invoiceLineSchema).min(1),
  notes: z.string().optional().nullable(),
});

export type InvoiceDto = z.infer<typeof invoiceSchema>;

export const taxRateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  rate: z.number().min(0).max(100),
  description: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type TaxRateDto = z.infer<typeof taxRateSchema>;
