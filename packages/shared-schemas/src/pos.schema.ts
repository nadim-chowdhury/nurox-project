import { z } from "zod";

export const posSessionStatusEnum = z.enum(["OPEN", "CLOSED"]);
export const posPaymentMethodEnum = z.enum(["CASH", "CARD", "MOBILE", "SPLIT"]);

export const posSessionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  cashierId: z.string().uuid(),
  openedAt: z.string().datetime(),
  closedAt: z.string().datetime().nullable(),
  openingFloat: z.number().min(0),
  closingCash: z.number().nullable(),
  status: posSessionStatusEnum,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type PosSessionDto = z.infer<typeof posSessionSchema>;

export const createPosSessionSchema = posSessionSchema.pick({
  openingFloat: true,
});

export type CreatePosSessionDto = z.infer<typeof createPosSessionSchema>;

export const posOrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  discount: z.number().min(0).default(0),
});

export const createPosOrderSchema = z.object({
  sessionId: z.string().uuid(),
  items: z.array(posOrderItemSchema).min(1),
  paymentMethod: posPaymentMethodEnum,
  amountTendered: z.number().min(0),
});

export type CreatePosOrderDto = z.infer<typeof createPosOrderSchema>;
