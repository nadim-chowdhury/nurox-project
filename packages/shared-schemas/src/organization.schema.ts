import { z } from "zod";

export const companyProfileSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Company name is required").max(150),
  domain: z.string().max(255).optional(),
  logoUrl: z.string().url().nullable().optional(),
  address: z.string().max(255).nullable().optional(),
  taxRegistrationNumber: z.string().max(50).nullable().optional(),
  phoneNumber: z.string().max(20).nullable().optional(),
  email: z.string().email().max(100).nullable().optional(),
  website: z.string().url().max(100).nullable().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default("#00b96b"),
});

export type CompanyProfileDto = z.infer<typeof companyProfileSchema>;

export const branchSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Branch name is required").max(150),
  code: z.string().min(1, "Branch code is required").max(20),
  address: z.string().max(255).nullable().optional(),
  timezone: z.string().default("UTC"),
  isActive: z.boolean().default(true),
});

export type BranchDto = z.infer<typeof branchSchema>;

export const createBranchSchema = branchSchema.omit({ id: true });
export type CreateBranchDto = z.infer<typeof createBranchSchema>;

export const updateBranchSchema = createBranchSchema.partial();
export type UpdateBranchDto = z.infer<typeof updateBranchSchema>;
