import { z } from 'zod';

export const projectStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
]);

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  client: z.string().max(150).optional(),
  description: z.string().optional(),
  status: projectStatusSchema.optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(),
  budget: z.number().nonnegative().optional(),
  managerId: z.string().uuid().optional(),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;

export const taskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export const taskStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'IN_REVIEW',
  'COMPLETED',
  'BLOCKED',
]);

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  assigneeName: z.string().optional(),
  priority: taskPrioritySchema.optional(),
  status: taskStatusSchema.optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().int().nonnegative().optional(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;
export const updateTaskSchema = createTaskSchema.partial();
export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
