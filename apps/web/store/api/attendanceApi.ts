import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";
import type { 
  AttendanceRecordDto,
  LeaveRequestDto,
  LeaveBalanceDto,
  HolidayDto,
  ShiftDto
} from "@repo/shared-schemas";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Attendance", "LeaveRequest", "LeaveBalance", "Holiday", "Shift"],
  endpoints: (builder) => ({
    // ─── ATTENDANCE ─────────────────────────────────────────────
    getTeamAttendance: builder.query<any[], { date?: string }>({
      query: (params) => ({
        url: "/hr/attendance/team",
        params,
      }),
      providesTags: ["Attendance"],
    }),

    checkIn: builder.mutation<any, { employeeId: string; method: string; token?: string; location?: any }>({
      query: (body) => ({
        url: "/hr/attendance/check-in",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    checkOut: builder.mutation<any, { employeeId: string; method: string; location?: any }>({
      query: (body) => ({
        url: "/hr/attendance/check-out",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    getCheckInQr: builder.query<{ token: string }, string>({
      query: (employeeId) => ({
        url: "/hr/attendance/qr",
        method: "POST", // In controller it's GET but uses body, changed to handle appropriately
        body: { employeeId }
      }),
    }),

    // ─── LEAVE MANAGEMENT ────────────────────────────────────────
    applyLeave: builder.mutation<LeaveRequestDto, any>({
      query: (body) => ({
        url: "/hr/leaves/apply",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LeaveRequest"],
    }),

    getLeaveBalances: builder.query<LeaveBalanceDto[], string>({
      query: (employeeId) => `/hr/leaves/balances/${employeeId}`,
      providesTags: ["LeaveBalance"],
    }),

    approveLeave: builder.mutation<any, { id: string; status: string; approvedBy: string }>({
      query: ({ id, ...body }) => ({
        url: `/hr/leaves/${id}/approve`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["LeaveRequest", "LeaveBalance"],
    }),
  }),
});

export const {
  useGetTeamAttendanceQuery,
  useCheckInMutation,
  useCheckOutMutation,
  useLazyGetCheckInQrQuery,
  useApplyLeaveMutation,
  useGetLeaveBalancesQuery,
  useApproveLeaveMutation,
} = attendanceApi;
