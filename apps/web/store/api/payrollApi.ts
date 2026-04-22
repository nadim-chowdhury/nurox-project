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
    // ─── SALARY STRUCTURES ──────────────────────────────────────
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

    assignStructure: builder.mutation<void, { employeeId: string; structureId: string }>({
      query: (body) => ({
        url: "/payroll/assignments",
        method: "POST",
        body,
      }),
    }),

    // ─── PAYROLL RUNS ──────────────────────────────────────────
    getPayrollRuns: builder.query<PayrollRunDto[], void>({
      query: () => "/payroll/runs",
      providesTags: ["PayrollRun"],
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

    // ─── PAYSLIPS ──────────────────────────────────────────────
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

    // ─── TAX CONFIGURATION ──────────────────────────────────────
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
  }),
});

export const {
  useGetStructuresQuery,
  useCreateStructureMutation,
  useAssignStructureMutation,
  useGetPayrollRunsQuery,
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
} = payrollApi;
