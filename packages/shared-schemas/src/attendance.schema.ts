import { z } from "zod";

/**
 * Shift Types
 */
export const shiftTypeEnum = z.enum(["MORNING", "EVENING", "NIGHT", "ROTATING"]);
export type ShiftType = z.infer<typeof shiftTypeEnum>;

export const shiftSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format HH:mm"),
  type: shiftTypeEnum.default("MORNING"),
  gracePeriodMinutes: z.number().int().min(0).default(15),
});

export type ShiftDto = z.infer<typeof shiftSchema>;

/**
 * Attendance Records
 */
export const attendanceMethodEnum = z.enum(["MANUAL", "QR", "BIOMETRIC", "GEO_FENCED"]);

export const attendanceRecordSchema = z.object({
  id: z.string().uuid().optional(),
  employeeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
  checkIn: z.string().datetime().nullable(),
  checkOut: z.string().datetime().nullable(),
  method: attendanceMethodEnum.default("MANUAL"),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string().optional(),
  }).optional(),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EARLY_EXIT", "ON_LEAVE"]).default("PRESENT"),
  isOvertime: z.boolean().default(false),
  overtimeMinutes: z.number().int().default(0),
});

export type AttendanceRecordDto = z.infer<typeof attendanceRecordSchema>;

/**
 * Leave Management
 */
export const leaveTypeEnum = z.enum([
  "ANNUAL",
  "SICK",
  "CASUAL",
  "MATERNITY",
  "PATERNITY",
  "UNPAID",
  "COMPENSATORY",
]);

export const leaveRequestStatusEnum = z.enum([
  "PENDING",
  "APPROVED_BY_MANAGER",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
]);

export const leaveRequestSchema = z.object({
  id: z.string().uuid().optional(),
  employeeId: z.string().uuid(),
  leaveType: leaveTypeEnum,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  reason: z.string().min(1).max(500),
  status: leaveRequestStatusEnum.default("PENDING"),
  appliedAt: z.string().datetime().optional(),
  approvedById: z.string().uuid().optional().nullable(),
});

export type LeaveRequestDto = z.infer<typeof leaveRequestSchema>;

export const leaveBalanceSchema = z.object({
  employeeId: z.string().uuid(),
  leaveType: leaveTypeEnum,
  totalDays: z.number().min(0),
  usedDays: z.number().min(0),
  remainingDays: z.number().min(0),
  fiscalYear: z.string(),
});

export type LeaveBalanceDto = z.infer<typeof leaveBalanceSchema>;

/**
 * Public Holidays
 */
export const holidaySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
  branchId: z.string().uuid().optional().nullable(), // Null means global for all branches
  isRecurring: z.boolean().default(true),
});

export type HolidayDto = z.infer<typeof holidaySchema>;
