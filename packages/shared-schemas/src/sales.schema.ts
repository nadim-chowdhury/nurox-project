import { z } from 'zod';

export const leadStatusSchema = z.enum([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
]);

export const createLeadSchema = z.object({
  name: z.string().min(1).max(150),
  company: z.string().max(150).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  source: z.string().max(100).optional(),
  status: leadStatusSchema.optional(),
  estimatedValue: z.number().nonnegative().optional(),
  assignedTo: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type CreateLeadDto = z.infer<typeof createLeadSchema>;
export const updateLeadSchema = createLeadSchema.partial();
export type UpdateLeadDto = z.infer<typeof updateLeadSchema>;

export const dealStatusSchema = z.enum(['OPEN', 'WON', 'LOST']);
export const dealStageSchema = z.enum([
  'PROSPECTING',
  'QUALIFICATION',
  'PROPOSAL',
  'NEGOTIATION',
  'CLOSED_WON',
  'CLOSED_LOST',
]);

export const createDealSchema = z.object({
  title: z.string().min(1).max(200),
  customerName: z.string().max(150).optional(),
  value: z.number().nonnegative().optional(),
  stage: dealStageSchema.optional(),
  status: dealStatusSchema.optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export type CreateDealDto = z.infer<typeof createDealSchema>;
export const updateDealSchema = createDealSchema.partial();
export type UpdateDealDto = z.infer<typeof updateDealSchema>;
