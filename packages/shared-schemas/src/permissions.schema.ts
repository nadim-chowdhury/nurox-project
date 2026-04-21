import { z } from "zod";

export enum Permission {
  // HR
  HR_VIEW_EMPLOYEES = 'hr:view_employees',
  HR_CREATE_EMPLOYEE = 'hr:create_employee',
  HR_UPDATE_EMPLOYEE = 'hr:update_employee',
  HR_DELETE_EMPLOYEE = 'hr:delete_employee',

  HR_VIEW_DEPARTMENTS = 'hr:view_departments',
  HR_MANAGE_DEPARTMENTS = 'hr:manage_departments',

  HR_MANAGE_PERFORMANCE = 'hr:manage_performance',
  HR_MANAGE_TRAINING = 'hr:manage_training',
  HR_MANAGE_SKILLS = 'hr:manage_skills',
  HR_VIEW_HISTORY = 'hr:view_history',

  // Finance
  FINANCE_VIEW_ACCOUNTS = 'finance:view_accounts',
  FINANCE_MANAGE_ACCOUNTS = 'finance:manage_accounts',
  FINANCE_VIEW_INVOICES = 'finance:view_invoices',
  FINANCE_MANAGE_INVOICES = 'finance:manage_invoices',

  // Inventory
  INVENTORY_VIEW = 'inventory:view',
  INVENTORY_MANAGE = 'inventory:manage',

  // Sales
  SALES_VIEW_LEADS = 'sales:view_leads',
  SALES_MANAGE_LEADS = 'sales:manage_leads',
  SALES_VIEW_DEALS = 'sales:view_deals',
  SALES_MANAGE_DEALS = 'sales:manage_deals',

  // Projects
  PROJECTS_VIEW = 'projects:view',
  PROJECTS_MANAGE = 'projects:manage',

  // System
  SYSTEM_ADMIN_ACCESS = 'system:admin_access',
}

export const RolePermissions: Record<string, Permission[]> = {
  ADMIN: Object.values(Permission), // Admins get everything
  HR_MANAGER: [
    Permission.HR_VIEW_EMPLOYEES,
    Permission.HR_CREATE_EMPLOYEE,
    Permission.HR_UPDATE_EMPLOYEE,
    Permission.HR_DELETE_EMPLOYEE,
    Permission.HR_VIEW_DEPARTMENTS,
    Permission.HR_MANAGE_DEPARTMENTS,
    Permission.HR_MANAGE_PERFORMANCE,
    Permission.HR_MANAGE_TRAINING,
    Permission.HR_MANAGE_SKILLS,
    Permission.HR_VIEW_HISTORY,
  ],
  ACCOUNTANT: [
    Permission.FINANCE_VIEW_ACCOUNTS,
    Permission.FINANCE_MANAGE_ACCOUNTS,
    Permission.FINANCE_VIEW_INVOICES,
    Permission.FINANCE_MANAGE_INVOICES,
  ],
  SALES_REP: [
    Permission.SALES_VIEW_LEADS,
    Permission.SALES_MANAGE_LEADS,
    Permission.SALES_VIEW_DEALS,
    Permission.SALES_MANAGE_DEALS,
  ],
  PROJECT_MANAGER: [
    Permission.PROJECTS_VIEW,
    Permission.PROJECTS_MANAGE,
    Permission.HR_VIEW_EMPLOYEES, // To assign tasks
  ],
  EMPLOYEE: [
    Permission.HR_VIEW_EMPLOYEES, // Read-only access to directory
    Permission.HR_VIEW_DEPARTMENTS,
  ],
};

export const roleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Role name is required").max(50),
  description: z.string().max(255).optional(),
  permissions: z.array(z.nativeEnum(Permission)),
  isSystem: z.boolean().optional(),
});

export type RoleDto = z.infer<typeof roleSchema>;

export const createRoleSchema = roleSchema.omit({ id: true, isSystem: true });
export type CreateRoleDto = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = createRoleSchema.partial();
export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
