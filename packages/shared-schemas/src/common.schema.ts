import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().uuid("Invalid ID format"),
});

export type IdParamDto = z.infer<typeof idParamSchema>;

export const basePaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
});

export type BasePaginationDto = z.infer<typeof basePaginationSchema>;

export const paginationMetaSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export type PaginationMetaDto = z.infer<typeof paginationMetaSchema>;

export const dateRangeSchema = z
  .object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.startDate) <= new Date(data.endDate);
      }
      return true;
    },
    { message: "Start date must be before end date" },
  );

export type DateRangeDto = z.infer<typeof dateRangeSchema>;

export const apiErrorSchema = z.object({
  statusCode: z.number(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string(),
  timestamp: z.string().datetime(),
  path: z.string(),
});

export type ApiErrorDto = z.infer<typeof apiErrorSchema>;

export const auditLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  action: z.string(),
  module: z.string(),
  description: z.string(),
  metadata: z.record(z.string(), z.any()).nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type AuditLogDto = z.infer<typeof auditLogSchema>;

export const userPreferenceSchema = z.object({
  userId: z.string().uuid(),
  key: z.string(),
  value: z.any(),
});

export type UserPreferenceDto = z.infer<typeof userPreferenceSchema>;
