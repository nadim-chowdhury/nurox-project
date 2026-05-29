import { z } from "zod";

/**
 * Shift Types
 */
export const shiftTypeEnum = z.enum([
  "MORNING",
  "EVENING",
  "NIGHT",
  "ROTATING",
]);
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
export const attendanceMethodEnum = z.enum([
  "MANUAL",
  "QR",
  "BIOMETRIC",
  "GEO_FENCED",
]);

export const attendanceRecordSchema = z.object({
  id: z.string().uuid().optional(),
  employeeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
  checkIn: z.string().datetime().nullable(),
  checkOut: z.string().datetime().nullable(),
  method: attendanceMethodEnum.default("MANUAL"),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      address: z.string().optional(),
    })
    .optional(),
  status: z
    .enum(["PRESENT", "ABSENT", "LATE", "EARLY_EXIT", "ON_LEAVE", "HALF_DAY"])
    .default("PRESENT"),
  isOvertime: z.boolean().default(false),
  overtimeMinutes: z.number().int().default(0),
});

export type AttendanceRecordDto = z.infer<typeof attendanceRecordSchema>;

export const regularizationRequestSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
  checkIn: z.string().datetime().optional().nullable(),
  checkOut: z.string().datetime().optional().nullable(),
  reason: z.string().min(1, "Reason is required").max(500),
});

export type RegularizationRequestDto = z.infer<
  typeof regularizationRequestSchema
>;

export const manualAttendanceEntrySchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format YYYY-MM-DD"),
  checkIn: z.string().datetime().optional().nullable(),
  checkOut: z.string().datetime().optional().nullable(),
  reason: z.string().min(1, "Reason is required").max(500),
});

export type ManualAttendanceEntryDto = z.infer<
  typeof manualAttendanceEntrySchema
>;

export const checkInSchema = z.object({
  employeeId: z.string().uuid().optional(),
  method: attendanceMethodEnum,
  token: z.string().optional(),
  location: z.any().optional(),
  timestamp: z.string().datetime().optional(),
});

export type CheckInDto = z.infer<typeof checkInSchema>;

export const checkOutSchema = z.object({
  employeeId: z.string().uuid(),
  method: attendanceMethodEnum,
  location: z.any().optional(),
  timestamp: z.string().datetime().optional(),
});

export type CheckOutDto = z.infer<typeof checkOutSchema>;

/**
 * Manual Attendance Entry (UI)
 */
export const manualAttendanceSchema = z.object({
  employeeId: z.string().uuid("Please select an employee"),
  type: z.enum(["IN", "OUT"]),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
});

export type ManualAttendanceDto = z.infer<typeof manualAttendanceSchema>;

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

export const grantCompensatoryLeaveSchema = z.object({
  employeeId: z.string().uuid("Invalid employee ID"),
  days: z.number().min(0.5, "Minimum 0.5 days required"),
  expiryDate: z.string().datetime("Invalid expiry date"),
  reason: z.string().min(1, "Reason is required").max(500),
});

export type GrantCompensatoryLeaveDto = z.infer<
  typeof grantCompensatoryLeaveSchema
>;

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
