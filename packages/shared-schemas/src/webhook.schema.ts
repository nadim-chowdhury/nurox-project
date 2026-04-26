import { z } from 'zod';

export const createWebhookSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url().max(500),
  events: z.array(z.string()).min(1),
  isActive: z.boolean().optional().default(true),
  headers: z.record(z.string(), z.string()).optional().nullable(),
});

export type CreateWebhookDto = z.infer<typeof createWebhookSchema>;
export const updateWebhookSchema = createWebhookSchema.partial();
export type UpdateWebhookDto = z.infer<typeof updateWebhookSchema>;
