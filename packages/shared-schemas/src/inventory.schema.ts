import { z } from "zod";

export const unitOfMeasureEnum = z.enum(["PCS", "KG", "L", "M", "BOX", "DOZEN"]);
export type UnitOfMeasure = z.infer<typeof unitOfMeasureEnum>;

export const stockMovementTypeEnum = z.enum(["RECEIPT", "ISSUE", "TRANSFER", "ADJUSTMENT", "RETURN"]);
export type StockMovementType = z.infer<typeof stockMovementTypeEnum>;

export const productSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Product name is required"),
  barcode: z.string().optional().nullable(),
  uom: unitOfMeasureEnum.default("PCS"),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  basePrice: z.number().min(0).default(0),
  reorderPoint: z.number().min(0).default(0),
  taxClassId: z.string().uuid().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type ProductDto = z.infer<typeof productSchema>;

export const warehouseSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, "Warehouse code is required"),
  name: z.string().min(1, "Warehouse name is required"),
  location: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type WarehouseDto = z.infer<typeof warehouseSchema>;

export const stockMovementSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  warehouseId: z.string().uuid(),
  binId: z.string().uuid().optional().nullable(),
  type: stockMovementTypeEnum,
  quantity: z.number(),
  reference: z.string().optional().nullable(),
  reasonCode: z.string().optional().nullable(),
  unitCost: z.number().min(0).optional(),
});

export type StockMovementDto = z.infer<typeof stockMovementSchema>;

export const batchSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  batchNumber: z.string().min(1),
  expiryDate: z.string().datetime().optional().nullable(),
  manufactureDate: z.string().datetime().optional().nullable(),
});

export type BatchDto = z.infer<typeof batchSchema>;
