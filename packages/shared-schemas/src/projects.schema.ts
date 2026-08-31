import { z } from "zod";

export const projectStatusSchema = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED",
]);

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  client: z.string().max(150).optional(),
  type: z.string().max(100).optional(),
  description: z.string().optional(),
  status: projectStatusSchema.optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(),
  budgetCost: z.number().nonnegative().optional(),
  budgetTime: z.number().nonnegative().optional(),
  currency: z.string().default("USD"),
  managerId: z.string().uuid().optional(),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;

export const taskPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const taskStatusSchema = z.enum([
  "NOT_STARTED",
  "IN_PROGRESS",
  "IN_REVIEW",
  "COMPLETED",
  "BLOCKED",
]);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(), // Tiptap HTML
  projectId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable(),
  assignees: z.array(z.string().uuid()).optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().nonnegative().optional(),
  isBillable: z.boolean().default(true),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;

// Milestone
export const createMilestoneSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(255),
  dueDate: z.string().datetime(),
  completionPercentage: z.number().min(0).max(100).default(0),
  predecessorId: z.string().uuid().optional().nullable(),
});
export type CreateMilestoneDto = z.infer<typeof createMilestoneSchema>;

// Time Tracking
export const createTimeLogSchema = z.object({
  taskId: z.string().uuid(),
  userId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional().nullable(),
  durationHours: z.number().nonnegative().optional().nullable(),
  isBillable: z.boolean().default(true),
  notes: z.string().optional().nullable(),
});
export type CreateTimeLogDto = z.infer<typeof createTimeLogSchema>;

export const timesheetStatusSchema = z.enum([
  "DRAFT",
  "SUBMITTED",
  "APPROVED",
  "REJECTED",
]);
export const createTimesheetSchema = z.object({
  userId: z.string().uuid(),
  periodStartDate: z.string().datetime(),
  periodEndDate: z.string().datetime(),
  status: timesheetStatusSchema.default("DRAFT"),
});
export type CreateTimesheetDto = z.infer<typeof createTimesheetSchema>;

// Risk Register
export const riskProbabilitySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "VERY_HIGH",
]);
export const riskImpactSchema = z.enum(["LOW", "MEDIUM", "HIGH", "SEVERE"]);
export const createProjectRiskSchema = z.object({
  projectId: z.string().uuid(),
  description: z.string().min(1).max(500),
  probability: riskProbabilitySchema,
  impact: riskImpactSchema,
  mitigationPlan: z.string().optional().nullable(),
  ownerId: z.string().uuid().optional().nullable(),
});
export type CreateProjectRiskDto = z.infer<typeof createProjectRiskSchema>;

// Change Request
export const changeRequestStatusSchema = z.enum([
  "PENDING",
  "APPROVED",
  "REJECTED",
]);
export const createChangeRequestSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string(),
  impactAnalysis: z.string().optional().nullable(),
  status: changeRequestStatusSchema.default("PENDING"),
});
export type CreateChangeRequestDto = z.infer<typeof createChangeRequestSchema>;

// Templates
export const createProjectTemplateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional().nullable(),
  structure: z.any(), // JSON representation of tasks/milestones
});
export type CreateProjectTemplateDto = z.infer<
  typeof createProjectTemplateSchema
>;
