import { z } from "zod";
import { paginationMetaSchema } from "./common.schema";

export const TicketStatusEnum = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "PENDING_USER",
  "RESOLVED",
  "CLOSED",
]);
export const TicketPriorityEnum = z.enum(["P1", "P2", "P3", "P4"]);

export const ticketSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: TicketStatusEnum.default("OPEN"),
  priority: TicketPriorityEnum.default("P3"),
  category: z.string().optional(),
  requesterId: z.string().uuid(),
  assigneeId: z.string().uuid().nullable(),
  resolvedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TicketDto = z.infer<typeof ticketSchema>;

export const createTicketSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: TicketPriorityEnum.default("P3"),
  category: z.string(),
});

export type CreateTicketDto = z.infer<typeof createTicketSchema>;

export const ticketMessageSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  senderId: z.string().uuid().nullable(), // Null for system/email-to-ticket external
  isInternal: z.boolean().default(false),
  content: z.string().min(1),
  createdAt: z.string().datetime(),
});

export type TicketMessageDto = z.infer<typeof ticketMessageSchema>;

export const kbArticleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  title: z.string().min(1),
  content: z.string(),
  category: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  isPublic: z.boolean().default(false),
  authorId: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type KbArticleDto = z.infer<typeof kbArticleSchema>;
