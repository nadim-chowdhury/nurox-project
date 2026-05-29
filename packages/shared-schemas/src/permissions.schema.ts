import { z } from "zod";

export enum Permission {
  // System & Platform
  SYSTEM_ADMIN_ACCESS = "system:admin_access",
  SYSTEM_MANAGE_SETTINGS = "system:manage_settings",
  SYSTEM_VIEW_AUDIT_LOGS = "system:view_audit_logs",

  // HR (Human Resources)
  HR_VIEW_EMPLOYEES = "hr:view_employees",
  HR_CREATE_EMPLOYEE = "hr:create_employee",
  HR_UPDATE_EMPLOYEE = "hr:update_employee",
  HR_DELETE_EMPLOYEE = "hr:delete_employee",
  HR_VIEW_DEPARTMENTS = "hr:view_departments",
  HR_MANAGE_DEPARTMENTS = "hr:manage_departments",
  HR_MANAGE_PERFORMANCE = "hr:manage_performance",
  HR_MANAGE_TRAINING = "hr:manage_training",
  HR_MANAGE_SKILLS = "hr:manage_skills",
  HR_VIEW_HISTORY = "hr:view_history",

  // Payroll
  PAYROLL_VIEW = "payroll:view",
  PAYROLL_MANAGE = "payroll:manage",
  PAYROLL_PROCESS = "payroll:process",
  PAYROLL_VIEW_PAYSLIPS = "payroll:view_payslips",

  // Attendance & Leave
  ATTENDANCE_VIEW = "attendance:view",
  ATTENDANCE_MANAGE = "attendance:manage",
  LEAVE_VIEW = "leave:view",
  LEAVE_MANAGE = "leave:manage",
  LEAVE_APPROVE = "leave:approve",

  // Recruitment
  RECRUITMENT_VIEW_JOBS = "recruitment:view_jobs",
  RECRUITMENT_MANAGE_JOBS = "recruitment:manage_jobs",
  RECRUITMENT_VIEW_CANDIDATES = "recruitment:view_candidates",
  RECRUITMENT_MANAGE_CANDIDATES = "recruitment:manage_candidates",

  // Finance & Accounting
  FINANCE_VIEW_ACCOUNTS = "finance:view_accounts",
  FINANCE_MANAGE_ACCOUNTS = "finance:manage_accounts",
  FINANCE_VIEW_INVOICES = "finance:view_invoices",
  FINANCE_MANAGE_INVOICES = "finance:manage_invoices",
  FINANCE_VIEW_JOURNALS = "finance:view_journals",
  FINANCE_MANAGE_JOURNALS = "finance:manage_journals",
  FINANCE_VIEW_REPORTS = "finance:view_reports",

  // Inventory
  INVENTORY_VIEW = "inventory:view",
  INVENTORY_MANAGE = "inventory:manage",
  INVENTORY_TRANSFER = "inventory:transfer",

  // Procurement & Purchase
  PROCUREMENT_VIEW_POS = "procurement:view_pos",
  PROCUREMENT_MANAGE_POS = "procurement:manage_pos",
  PROCUREMENT_VIEW_VENDORS = "procurement:view_vendors",
  PROCUREMENT_MANAGE_VENDORS = "procurement:manage_vendors",

  // Sales & CRM
  SALES_VIEW_LEADS = "sales:view_leads",
  SALES_MANAGE_LEADS = "sales:manage_leads",
  SALES_VIEW_DEALS = "sales:view_deals",
  SALES_MANAGE_DEALS = "sales:manage_deals",
  SALES_VIEW_CUSTOMERS = "sales:view_customers",
  SALES_MANAGE_CUSTOMERS = "sales:manage_customers",

  // Projects
  PROJECTS_VIEW = "projects:view",
  PROJECTS_MANAGE = "projects:manage",
  PROJECTS_MANAGE_TASKS = "projects:manage_tasks",

  // Assets
  ASSETS_READ = "assets:read",
  ASSETS_WRITE = "assets:write",
  ASSETS_MANAGE_MAINTENANCE = "assets:manage_maintenance",

  // Documents
  DOCUMENT_READ = "documents:read",
  DOCUMENT_WRITE = "documents:write",
  DOCUMENT_DELETE = "documents:delete",

  // Support & Help Desk
  SUPPORT_VIEW_TICKETS = "support:view_tickets",
  SUPPORT_MANAGE_TICKETS = "support:manage_tickets",
  SUPPORT_VIEW_KB = "support:view_kb",
  SUPPORT_MANAGE_KB = "support:manage_kb",

  // Manufacturing
  MANUFACTURING_VIEW_BOM = "manufacturing:view_bom",
  MANUFACTURING_MANAGE_BOM = "manufacturing:manage_bom",
  MANUFACTURING_VIEW_WORK_ORDERS = "manufacturing:view_work_orders",
  MANUFACTURING_MANAGE_WORK_ORDERS = "manufacturing:manage_work_orders",

  // Logistics & Fleet
  FLEET_VIEW = "fleet:view",
  FLEET_MANAGE = "fleet:manage",
  LOGISTICS_VIEW = "logistics:view",
  LOGISTICS_MANAGE = "logistics:manage",

  // POS
  POS_ACCESS = "pos:access",
  POS_MANAGE_SESSIONS = "pos:manage_sessions",

  // AI & Automation
  AI_ACCESS = "ai:access",
  AUTOMATION_MANAGE_RULES = "automation:manage_rules",

  // Reports
  REPORTS_READ = "reports:read",
  REPORTS_WRITE = "reports:write",

  // Admin (General)
  ADMIN_READ = "admin:read",
  ADMIN_WRITE = "admin:write",

  // Billing (SaaS)
  BILLING_VIEW = "billing:view",
  BILLING_MANAGE = "billing:manage",
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
