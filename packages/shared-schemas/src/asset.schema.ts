import { z } from 'zod';

export const assetStatusSchema = z.enum([
  'PURCHASED',
  'ACTIVE',
  'UNDER_MAINTENANCE',
  'DISPOSED',
]);

export const depreciationMethodSchema = z.enum([
  'STRAIGHT_LINE',
  'DECLINING_BALANCE',
]);

export const createAssetCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  depreciationMethod: depreciationMethodSchema,
  depreciationRate: z.number().min(0).max(100), // percentage per year
  usefulLifeMonths: z.number().int().positive(),
});

export const createAssetSchema = z.object({
  name: z.string().min(2).max(255),
  assetCode: z.string().min(2).max(50),
  categoryId: z.string().uuid(),
  purchaseDate: z.string().date(),
  purchaseCost: z.number().positive(),
  location: z.string().min(2).max(255).optional(),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  warrantyExpiry: z.string().date().optional(),
  insuranceExpiry: z.string().date().optional(),
});

export const updateAssetSchema = createAssetSchema.partial().extend({
  status: assetStatusSchema.optional(),
});

export const assignAssetSchema = z.object({
  employeeId: z.string().uuid(),
  assignmentDate: z.string().date(),
  notes: z.string().optional(),
});

export const createAssetMaintenanceSchema = z.object({
  maintenanceDate: z.string().date(),
  type: z.string(), // e.g., 'ROUTINE', 'REPAIR'
  description: z.string(),
  cost: z.number().nonnegative(),
  technician: z.string().optional(),
  nextMaintenanceDate: z.string().date().optional(),
});

export const disposeAssetSchema = z.object({
  disposalDate: z.string().date(),
  disposalPrice: z.number().nonnegative(),
  disposalReason: z.string(),
});

export type CreateAssetCategoryDto = z.infer<typeof createAssetCategorySchema>;
export type CreateAssetDto = z.infer<typeof createAssetSchema>;
export type UpdateAssetDto = z.infer<typeof updateAssetSchema>;
export type AssignAssetDto = z.infer<typeof assignAssetSchema>;
export type CreateAssetMaintenanceDto = z.infer<typeof createAssetMaintenanceSchema>;
export type DisposeAssetDto = z.infer<typeof disposeAssetSchema>;
