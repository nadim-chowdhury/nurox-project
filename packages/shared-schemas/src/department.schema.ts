import { z } from "zod";

export interface DepartmentDto {
  id?: string;
  name: string;
  code: string;
  description?: string | null;
  costCenter?: string | null;
  headId?: string | null;
  isActive: boolean;
  parentId?: string | null;
  children?: DepartmentDto[];
}

export const departmentSchema: z.ZodType<DepartmentDto> = z.lazy(() => 
  z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1, "Department name is required").max(100),
    code: z.string().min(1, "Department code is required").max(20),
    description: z.string().max(500).nullable().optional(),
    costCenter: z.string().max(50).nullable().optional(),
    headId: z.string().uuid().nullable().optional(),
    isActive: z.boolean().default(true),
    parentId: z.string().uuid().nullable().optional(),
    children: z.array(departmentSchema).optional(),
  })
);

export const createDepartmentSchema = z.object({
  name: z.string().min(1, "Department name is required").max(100),
  code: z.string().min(1, "Department code is required").max(20),
  description: z.string().max(500).nullable().optional(),
  costCenter: z.string().max(50).nullable().optional(),
  headId: z.string().uuid().nullable().optional(),
  parentId: z.string().uuid().nullable().optional(),
});

export type CreateDepartmentDto = z.infer<typeof createDepartmentSchema>;

export const updateDepartmentSchema = createDepartmentSchema.partial();
export type UpdateDepartmentDto = z.infer<typeof updateDepartmentSchema>;
