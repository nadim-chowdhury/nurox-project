import { z } from "zod";

/**
 * Employment types supported by Nurox ERP
 */
export const employmentTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERN",
  "PROBATION",
]);

export type EmploymentType = z.infer<typeof employmentTypeEnum>;

/**
 * Employee lifecycle status
 */
export const employeeStatusEnum = z.enum([
  "ACTIVE",
  "INACTIVE",
  "SUSPENDED",
  "TERMINATED",
  "RESIGNED",
  "RETIRED",
  "DECEASED",
  "PENDING_INVITE",
]);

export type EmployeeStatus = z.infer<typeof employeeStatusEnum>;

/**
 * Employee Personal Information (Step 1 of Wizard)
 */
export const employeePersonalSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100).trim(),
  lastName: z.string().min(1, "Last name is required").max(100).trim(),
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  phone: z.string().min(1, "Phone is required").max(20).trim(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  address: z.string().max(500).trim().optional(),
  avatarUrl: z.string().url("Invalid URL").optional(),
});

/**
 * Employment Details (Step 2 of Wizard)
 */
export const employmentDetailsSchema = z.object({
  employeeCode: z.string().min(1, "Employee code is required").max(20).trim(),
  departmentId: z.string().uuid("Invalid department"),
  designationId: z.string().uuid("Invalid designation"),
  managerId: z.string().uuid().optional().nullable(),
  employmentType: employmentTypeEnum.default("FULL_TIME"),
  joinDate: z.string().datetime("Join date is required"),
  probationEndDate: z.string().datetime().optional().nullable(),
  contractUrl: z.string().url().optional().nullable(),
  contractExpiryDate: z.string().datetime().optional().nullable(),
  branchId: z.string().uuid("Branch is required"),
});

/**
 * Compensation Details (Step 3 of Wizard)
 */
export const compensationDetailsSchema = z.object({
  baseSalary: z.number().min(0, "Base salary must be positive"),
  currency: z.string().min(1).max(3).default("USD"),
  paymentFrequency: z.enum(["MONTHLY", "WEEKLY", "BI_WEEKLY"]).default("MONTHLY"),
  bankName: z.string().max(255).trim().optional().nullable(),
  accountNumber: z.string().max(50).trim().optional().nullable(),
  routingNumber: z.string().max(20).trim().optional().nullable(),
  taxId: z.string().max(50).trim().optional().nullable(),
});

/**
 * Transfer Employee Schema
 */
export const transferEmployeeSchema = z.object({
  departmentId: z.string().uuid(),
  designationId: z.string().uuid(),
  effectiveDate: z.string().datetime(),
  comments: z.string().max(500).optional(),
});

export type TransferEmployeeDto = z.infer<typeof transferEmployeeSchema>;

/**
 * Terminate/Resign Employee Schema
 */
export const terminationSchema = z.object({
  endDate: z.string().datetime(),
  reason: z.enum(["RESIGNED", "TERMINATED", "RETIRED", "DECEASED"]),
  comments: z.string().max(500).optional(),
  clearanceChecklist: z.array(z.string()).optional(),
});

export type TerminationDto = z.infer<typeof terminationSchema>;

/**
 * 360 Degree Review Schema
 */
export const threeSixtyReviewSchema = z.object({
  objective: z.string().min(1).max(500),
  period: z.string().max(20),
  selfRating: z.number().min(0).max(5),
  peerRating: z.number().min(0).max(5).optional(),
  managerRating: z.number().min(0).max(5).optional(),
  comments: z.string().max(1000).optional(),
});

export type ThreeSixtyReviewDto = z.infer<typeof threeSixtyReviewSchema>;

/**
 * Performance Improvement Plan (PIP) Schema
 */
export const pipSchema = z.object({
  objective: z.string().min(1).max(500),
  period: z.string().max(20),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  documentationUrl: z.string().url().optional().nullable(),
  comments: z.string().max(1000).optional(),
});

export type PipDto = z.infer<typeof pipSchema>;

/**
 * Emergency Contact Details (Step 4 of Wizard)
 */
export const emergencyContactSchema = z.object({
  emergencyContactName: z.string().min(1, "Contact name is required").max(100).trim(),
  emergencyContactPhone: z.string().min(1, "Contact phone is required").max(20).trim(),
  emergencyContactRelation: z.enum(["SPOUSE", "PARENT", "SIBLING", "FRIEND", "OTHER"]).optional(),
});

/**
 * Documents & Contract (Step 5 of Wizard)
 */
export const documentsSchema = z.object({
  contractUrl: z.string().url().optional().nullable(),
  contractExpiryDate: z.string().datetime().optional().nullable(),
});

/**
 * Full Create Employee Schema (Multi-step combination)
 */
export const createEmployeeSchema = employeePersonalSchema
  .merge(employmentDetailsSchema)
  .merge(compensationDetailsSchema)
  .merge(emergencyContactSchema)
  .merge(documentsSchema);

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;

/**
 * Employee Response Schema
 */
export const employeeResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  employeeCode: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string().nullable(),
  designation: z.string(),
  employmentType: employmentTypeEnum,
  status: employeeStatusEnum,
  joinDate: z.string().datetime(),
  probationEndDate: z.string().datetime().nullable(),
  departmentId: z.string().uuid(),
  managerId: z.string().uuid().nullable(),
  avatarUrl: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type EmployeeResponseDto = z.infer<typeof employeeResponseSchema>;

/**
 * OKR (Objectives and Key Results) Schema
 */
export const okrSchema = z.object({
  id: z.string().uuid(),
  employeeId: z.string().uuid(),
  objective: z.string().min(1, "Objective is required").max(500),
  keyResults: z.array(
    z.object({
      id: z.string().uuid(),
      description: z.string().min(1).max(500),
      targetValue: z.number(),
      currentValue: z.number().default(0),
      weight: z.number().min(0).max(100).default(0),
    })
  ),
  period: z.string().max(20), // e.g., "Q1 2026"
  status: z.enum(["DRAFT", "ACTIVE", "COMPLETED", "ABANDONED"]).default("ACTIVE"),
  progress: z.number().min(0).max(100).default(0),
});

export type OkrDto = z.infer<typeof okrSchema>;

/**
 * Training & Certifications
 */
export const trainingSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255),
  provider: z.string().max(255).optional(),
  expiryDate: z.string().datetime().optional().nullable(),
  status: z.enum(["ENROLLED", "IN_PROGRESS", "COMPLETED", "EXPIRED"]).default("ENROLLED"),
  certificateUrl: z.string().url().optional().nullable(),
});

export type TrainingDto = z.infer<typeof trainingSchema>;

/**
 * Skill Matrix
 */
export const skillSchema = z.object({
  skillName: z.string().min(1).max(100),
  proficiency: z.number().int().min(1).max(5), // 1-5 scale
  lastAssessed: z.string().datetime().optional(),
});

export type SkillDto = z.infer<typeof skillSchema>;
