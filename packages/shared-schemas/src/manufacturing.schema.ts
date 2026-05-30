import { z } from "zod";

export const workcenterSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  machineCostPerHour: z.number().min(0),
  laborCostPerHour: z.number().min(0),
  overheadCostPerHour: z.number().min(0),
});

export const createWorkcenterSchema = z.object({
  name: z.string().min(1).max(100),
  machineCostPerHour: z.number().min(0).default(0),
  laborCostPerHour: z.number().min(0).default(0),
  overheadCostPerHour: z.number().min(0).default(0),
});

export type CreateWorkcenterDto = z.infer<typeof createWorkcenterSchema>;

export const machineStatusEnum = z.enum([
  "AVAILABLE",
  "IN_USE",
  "MAINTENANCE",
  "OFFLINE",
]);

export const createMachineSchema = z.object({
  workcenterId: z.string().uuid(),
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  capacityPerHour: z.number().min(0).optional(),
});

export type CreateMachineDto = z.infer<typeof createMachineSchema>;

export const createBomItemSchema = z.object({
  componentProductId: z.string().uuid(),
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

export const workOrderStageStatusEnum = z.enum([
  "PENDING",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "SKIPPED",
  "CANCELLED",
]);

export const createWorkOrderStageSchema = z.object({
  sequence: z.number().int().min(1),
  name: z.string().min(1).max(120),
  workcenterId: z.string().uuid(),
  machineId: z.string().uuid().optional(),
  scheduledMinutes: z.number().int().min(0).default(0),
  plannedStartAt: z.string().datetime().optional(),
  plannedEndAt: z.string().datetime().optional(),
  consumesBom: z.boolean().default(false),
});

export const createWorkOrderSchema = z.object({
  bomId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  plannedQuantity: z.number().min(0.0001),
  workcenterId: z.string().uuid().optional(),
  dueDate: z.string().datetime().optional(),
  stages: z.array(createWorkOrderStageSchema).min(1).optional(),
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

export const completeWorkOrderSchema = z.object({
  unitCost: z.number().min(0).optional(),
});

export type CompleteWorkOrderDto = z.infer<typeof completeWorkOrderSchema>;
