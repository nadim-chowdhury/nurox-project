import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";
import type {
  AttendanceRecordDto,
  LeaveRequestDto,
  LeaveBalanceDto,
  HolidayDto,
  ShiftDto,
} from "@repo/shared-schemas";

export const attendanceApi = createApi({
  reducerPath: "attendanceApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Attendance", "LeaveRequest", "LeaveBalance", "Holiday", "Shift"],
  endpoints: (builder) => ({
    getTeamAttendance: builder.query<any[], { date?: string }>({
      query: (params) => ({
        url: "/attendance/team",
        params,
      }),
      providesTags: ["Attendance"],
    }),

    checkIn: builder.mutation<
      any,
      {
        employeeId: string;
        method: string;
        token?: string;
        location?: any;
        timestamp?: string;
      }
    >({
      query: (body) => ({
        url: "/attendance/check-in",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    checkOut: builder.mutation<
      any,
      { employeeId: string; method: string; location?: any; timestamp?: string }
    >({
      query: (body) => ({
        url: "/attendance/check-out",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Attendance"],
    }),

    getCheckInQr: builder.query<{ token: string }, string>({
      query: (employeeId) => ({
        url: "/attendance/qr",
        method: "POST", // Adjusted to match expected client behavior for body use
        body: { employeeId },
      }),
    }),

    bulkImportAttendance: builder.mutation<any, any[]>({
      query: (records) => ({
        url: "/attendance/bulk",
        method: "POST",
        body: records,
      }),
      invalidatesTags: ["Attendance"],
    }),

    getAttendanceReportUrl: builder.query<
      string,
      { month: number; year: number }
    >({
      query: ({ month, year }) =>
        `/attendance/report?month=${month}&year=${year}`,
    }),

    applyLeave: builder.mutation<LeaveRequestDto, any>({
      query: (body) => ({
        url: "/leave/apply",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LeaveRequest"],
    }),

    getLeaveBalances: builder.query<LeaveBalanceDto[], string>({
      query: (employeeId) => `/leave/balances/${employeeId}`,
      providesTags: ["LeaveBalance"],
    }),

    getLeaveRequests: builder.query<any[], void>({
      query: () => "/leave",
      providesTags: ["LeaveRequest"],
    }),

    approveLeave: builder.mutation<
      any,
      { id: string; status: string; approvedBy: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/leave/${id}/approve`,
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
  useBulkImportAttendanceMutation,
  useLazyGetAttendanceReportUrlQuery,
  useApplyLeaveMutation,
  useGetLeaveBalancesQuery,
  useGetLeaveRequestsQuery,
  useApproveLeaveMutation,
} = attendanceApi;
