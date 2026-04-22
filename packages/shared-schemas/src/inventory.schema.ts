import { z } from "zod";

export const unitOfMeasureEnum = z.enum(["PCS", "KG", "L", "M", "BOX", "DOZEN"]);
export type UnitOfMeasure = z.infer<typeof unitOfMeasureEnum>;

export const stockMovementTypeEnum = z.enum(["RECEIPT", "ISSUE", "TRANSFER", "ADJUSTMENT", "RETURN"]);
export type StockMovementType = z.infer<typeof stockMovementTypeEnum>;

export const valuationMethodEnum = z.enum(["FIFO", "LIFO", "WEIGHTED_AVERAGE", "FEFO"]);
export type ValuationMethod = z.infer<typeof valuationMethodEnum>;

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
  valuationMethod: valuationMethodEnum.default("FIFO"),
});

export type ProductDto = z.infer<typeof productSchema>;

export const productVariantSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  sku: z.string().min(1),
  name: z.string().min(1),
  attributeValues: z.record(z.string(), z.string()).optional(), // e.g. { size: 'L', color: 'Blue' }
  priceAdjustment: z.number().default(0),
  isActive: z.boolean().default(true),
});

export type ProductVariantDto = z.infer<typeof productVariantSchema>;

export const warehouseSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1, "Warehouse code is required"),
  name: z.string().min(1, "Warehouse name is required"),
  location: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type WarehouseDto = z.infer<typeof warehouseSchema>;

export const zoneSchema = z.object({
  id: z.string().uuid().optional(),
  warehouseId: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
});

export type ZoneDto = z.infer<typeof zoneSchema>;

export const rackSchema = z.object({
  id: z.string().uuid().optional(),
  zoneId: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
});

export type RackDto = z.infer<typeof rackSchema>;

export const binSchema = z.object({
  id: z.string().uuid().optional(),
  rackId: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  capacity: z.number().optional().nullable(),
});

export type BinDto = z.infer<typeof binSchema>;

export const batchSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  batchNumber: z.string().min(1),
  expiryDate: z.string().datetime().optional().nullable(),
  manufactureDate: z.string().datetime().optional().nullable(),
  receivedDate: z.string().datetime().optional(),
  initialQuantity: z.number(),
  remainingQuantity: z.number(),
  unitCost: z.number(),
});

export type BatchDto = z.infer<typeof batchSchema>;

export const stockMovementSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  warehouseId: z.string().uuid(),
  binId: z.string().uuid().optional().nullable(),
  batchId: z.string().uuid().optional().nullable(),
  type: stockMovementTypeEnum,
  quantity: z.number(),
  reference: z.string().optional().nullable(), // PO number, SO number, etc.
  reasonCode: z.string().optional().nullable(),
  unitCost: z.number().min(0).optional(),
  totalCost: z.number().min(0).optional(),
});

export type StockMovementDto = z.infer<typeof stockMovementSchema>;

export const stockAdjustmentSchema = z.object({
  id: z.string().uuid().optional(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  warehouseId: z.string().uuid(),
  binId: z.string().uuid().optional().nullable(),
  batchId: z.string().uuid().optional().nullable(),
  adjustmentQuantity: z.number(),
  reasonCode: z.string().min(1),
  notes: z.string().optional().nullable(),
});

export type StockAdjustmentDto = z.infer<typeof stockAdjustmentSchema>;

export const stockCountSchema = z.object({
  id: z.string().uuid().optional(),
  warehouseId: z.string().uuid(),
  status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  startedAt: z.string().datetime().optional().nullable(),
  completedAt: z.string().datetime().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type StockCountDto = z.infer<typeof stockCountSchema>;

export const stockCountItemSchema = z.object({
  id: z.string().uuid().optional(),
  stockCountId: z.string().uuid(),
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional().nullable(),
  binId: z.string().uuid().optional().nullable(),
  batchId: z.string().uuid().optional().nullable(),
  expectedQuantity: z.number(),
  actualQuantity: z.number(),
  difference: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type StockCountItemDto = z.infer<typeof stockCountItemSchema>;
