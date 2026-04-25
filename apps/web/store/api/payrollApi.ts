import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";
import type {
  SalaryStructureDto,
  PayrollRunDto,
  PayslipDto,
} from "@repo/shared-schemas";

export const payrollApi = createApi({
  reducerPath: "payrollApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["PayrollRun", "Payslip", "SalaryStructure", "TaxConfig"],
  endpoints: (builder) => ({
    getStructures: builder.query<SalaryStructureDto[], void>({
      query: () => "/payroll/structures",
      providesTags: ["SalaryStructure"],
    }),

    createStructure: builder.mutation<SalaryStructureDto, SalaryStructureDto>({
      query: (body) => ({
        url: "/payroll/structures",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SalaryStructure"],
    }),

    assignStructure: builder.mutation<
      void,
      { employeeId: string; structureId: string }
    >({
      query: (body) => ({
        url: "/payroll/assignments",
        method: "POST",
        body,
      }),
    }),

    getPayrollRuns: builder.query<PayrollRunDto[], void>({
      query: () => "/payroll/runs",
      providesTags: ["PayrollRun"],
    }),

    getPayrollRun: builder.query<PayrollRunDto, string>({
      query: (id) => `/payroll/runs/${id}`,
      providesTags: (_, __, id) => [{ type: "PayrollRun", id }],
    }),

    createPayrollRun: builder.mutation<PayrollRunDto, { period: string }>({
      query: (body) => ({
        url: "/payroll/runs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PayrollRun"],
    }),

    processPayrollRun: builder.mutation<PayrollRunDto, string>({
      query: (id) => ({
        url: `/payroll/runs/${id}/process`,
        method: "POST",
      }),
      invalidatesTags: ["PayrollRun"],
    }),

    approvePayrollRun: builder.mutation<PayrollRunDto, string>({
      query: (id) => ({
        url: `/payroll/runs/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["PayrollRun"],
    }),

    finalizePayrollRun: builder.mutation<PayrollRunDto, string>({
      query: (id) => ({
        url: `/payroll/runs/${id}/finalize`,
        method: "POST",
      }),
      invalidatesTags: ["PayrollRun"],
    }),

    publishPayslips: builder.mutation<void, string>({
      query: (id) => ({
        url: `/payroll/runs/${id}/publish`,
        method: "POST",
      }),
      invalidatesTags: ["PayrollRun", "Payslip"],
    }),

    getPayslipsByRun: builder.query<PayslipDto[], string>({
      query: (runId) => `/payroll/payslips/run/${runId}`,
      providesTags: ["Payslip"],
    }),

    getMyPayslips: builder.query<PayslipDto[], { employeeId: string }>({
      query: (params) => ({
        url: "/payroll/me/payslips",
        params,
      }),
      providesTags: ["Payslip"],
    }),

    getPayslipDownloadUrl: builder.query<{ url: string }, string>({
      query: (id) => `/payroll/payslips/${id}/download`,
    }),

    getTaxConfigs: builder.query<any[], void>({
      query: () => "/payroll/tax-configs",
      providesTags: ["TaxConfig"],
    }),

    createTaxConfig: builder.mutation<any, any>({
      query: (body) => ({
        url: "/payroll/tax-configs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TaxConfig"],
    }),

    createOffCycleRun: builder.mutation<PayrollRunDto, { employeeId: string; period: string; type: string }>({
      query: (body) => ({
        url: "/payroll/runs/off-cycle",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PayrollRun"],
    }),

    getPayrollSummary: builder.query<any, string>({
      query: (id) => `/payroll/runs/${id}/summary`,
    }),

    getPayrollComparison: builder.query<any[], { id: string; previousRunId: string }>({
      query: ({ id, previousRunId }) => ({
        url: `/payroll/runs/${id}/comparison`,
        params: { previousRunId },
      }),
    }),

    createAdvanceRequest: builder.mutation<any, any>({
      query: (body) => ({
        url: "/payroll/advance-requests",
        method: "POST",
        body,
      }),
    }),

    updateAdvanceStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, ...body }) => ({
        url: `/payroll/advance-requests/${id}/status`,
        method: "PATCH",
        body,
      }),
    }),
  }),
});

export const {
  useGetStructuresQuery,
  useCreateStructureMutation,
  useAssignStructureMutation,
  useGetPayrollRunsQuery,
  useGetPayrollRunQuery,
  useCreatePayrollRunMutation,
  useProcessPayrollRunMutation,
  useApprovePayrollRunMutation,
  useFinalizePayrollRunMutation,
  usePublishPayslipsMutation,
  useGetPayslipsByRunQuery,
  useGetMyPayslipsQuery,
  useLazyGetPayslipDownloadUrlQuery,
  useGetTaxConfigsQuery,
  useCreateTaxConfigMutation,
  useCreateOffCycleRunMutation,
  useGetPayrollSummaryQuery,
  useGetPayrollComparisonQuery,
  useCreateAdvanceRequestMutation,
  useUpdateAdvanceStatusMutation,
} = payrollApi;
