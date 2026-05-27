import { z } from "zod";

export const workcenterSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  machineCostPerHour: z.number().min(0),
  laborCostPerHour: z.number().min(0),
  overheadCostPerHour: z.number().min(0),
});

export const createBomItemSchema = z.object({
  componentProductId: z.string().uuid(), // ID from inventory
  quantity: z.number().min(0.001),
  unitOfMeasure: z.string(),
});

export const createBomSchema = z.object({
  finishedProductId: z.string().uuid(),
  version: z.string().default("v1.0"),
  items: z.array(createBomItemSchema).min(1),
  isActive: z.boolean().default(true),
});

export type CreateBomDto = z.infer<typeof createBomSchema>;

export const workOrderStatusEnum = z.enum([
  "DRAFT",
  "RELEASED",
  "IN_PROGRESS",
  "COMPLETED",
  "CLOSED",
  "CANCELLED",
]);

export const createWorkOrderSchema = z.object({
  bomId: z.string().uuid(),
  plannedQuantity: z.number().min(1),
  workcenterId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
});

export type CreateWorkOrderDto = z.infer<typeof createWorkOrderSchema>;

export const logProductionSchema = z.object({
  workOrderId: z.string().uuid(),
  completedQuantity: z.number().min(0),
  scrapQuantity: z.number().min(0),
  scrapReason: z.string().optional(),
  laborHours: z.number().min(0),
  machineHours: z.number().min(0),
});

export type LogProductionDto = z.infer<typeof logProductionSchema>;
