import { z } from "zod";

export const workflowTriggerSchema = z.enum([
  "LEAVE_REQUESTED",
  "LEAVE_APPROVED",
  "TICKET_CREATED",
  "INVOICE_GENERATED",
  "USER_CREATED",
]);

export const workflowActionSchema = z.enum([
  "SEND_EMAIL",
  "SEND_SLACK_WEBHOOK",
  "CREATE_TASK",
  "UPDATE_STATUS",
]);

export const workflowRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  triggerEvent: workflowTriggerSchema,
  conditionLogic: z.any().optional(), // Generic JSON structure for if-conditions
  actionType: workflowActionSchema,
  actionPayload: z.any(), // e.g. { to: 'admin@nurox.local', template: '...' }
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type WorkflowRuleDto = z.infer<typeof workflowRuleSchema>;

export const createWorkflowRuleSchema = workflowRuleSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateWorkflowRuleDto = z.infer<typeof createWorkflowRuleSchema>;
