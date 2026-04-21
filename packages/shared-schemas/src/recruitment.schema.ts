import { z } from "zod";
import { employmentTypeEnum } from "./hr.schema";

export const jobStatusEnum = z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "OPEN", "PAUSED", "CLOSED", "CANCELLED"]);
export type JobStatus = z.infer<typeof jobStatusEnum>;

export const applicantStatusEnum = z.enum(["APPLIED", "SCREENED", "INTERVIEW", "OFFER", "HIRED", "REJECTED", "WITHDRAWN"]);
export type ApplicantStatus = z.infer<typeof applicantStatusEnum>;

export const interviewStatusEnum = z.enum(["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"]);
export type InterviewStatus = z.infer<typeof interviewStatusEnum>;

export const jobRequisitionSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1, "Job title is required"),
  description: z.string().min(1, "Job description is required"),
  departmentId: z.string().uuid("Invalid department"),
  designationId: z.string().uuid("Invalid designation"),
  location: z.string().min(1, "Location is required"),
  employmentType: employmentTypeEnum,
  vacancies: z.number().int().min(1).default(1),
  minSalary: z.number().optional().nullable(),
  maxSalary: z.number().optional().nullable(),
  currency: z.string().default("USD"),
  status: jobStatusEnum.default("DRAFT"),
  approvalChain: z.array(z.object({
    userId: z.string().uuid(),
    status: z.enum(["PENDING", "APPROVED", "REJECTED"]).default("PENDING"),
    comment: z.string().optional(),
    updatedAt: z.string().datetime().optional(),
  })).optional(),
});

export type JobRequisitionDto = z.infer<typeof jobRequisitionSchema>;

export const candidateSchema = z.object({
  id: z.string().uuid().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  resumeUrl: z.string().url().optional(),
  source: z.string().optional(), // LinkedIn, Referral, etc.
  skills: z.array(z.string()).optional(),
});

export type CandidateDto = z.infer<typeof candidateSchema>;

export const applicationSchema = z.object({
  id: z.string().uuid().optional(),
  jobId: z.string().uuid(),
  candidateId: z.string().uuid(),
  status: applicantStatusEnum.default("APPLIED"),
  appliedDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export type ApplicationDto = z.infer<typeof applicationSchema>;

export const interviewSchema = z.object({
  id: z.string().uuid().optional(),
  applicationId: z.string().uuid(),
  interviewerIds: z.array(z.string().uuid()),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().optional(), // Meeting link or physical location
  status: interviewStatusEnum.default("SCHEDULED"),
  feedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export type InterviewDto = z.infer<typeof interviewSchema>;

export const offerLetterSchema = z.object({
  id: z.string().uuid().optional(),
  applicationId: z.string().uuid(),
  baseSalary: z.number().min(0),
  currency: z.string().default("USD"),
  joiningDate: z.string().datetime(),
  expiryDate: z.string().datetime(),
  status: z.enum(["DRAFT", "SENT", "ACCEPTED", "REJECTED", "EXPIRED"]).default("DRAFT"),
  signedUrl: z.string().url().optional().nullable(),
});

export type OfferLetterDto = z.infer<typeof offerLetterSchema>;

export const onboardingTaskSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().datetime().optional().nullable(),
  assignedToId: z.string().uuid().optional().nullable(),
});

export const onboardingChecklistSchema = z.object({
  id: z.string().uuid().optional(),
  candidateId: z.string().uuid(),
  tasks: z.array(onboardingTaskSchema),
  progress: z.number().min(0).max(100).default(0),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]).default("NOT_STARTED"),
});

export type OnboardingChecklistDto = z.infer<typeof onboardingChecklistSchema>;
