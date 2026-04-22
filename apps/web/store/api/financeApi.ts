import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";
import type {
  AccountDto,
  JournalEntryDto,
  InvoiceDto,
  TaxRateDto,
} from "@repo/shared-schemas";

export interface Account extends AccountDto {
  id: string;
  balance: number;
}

export const financeApi = createApi({
  reducerPath: "financeApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Account", "Journal", "Invoice", "Bill", "Tax", "Report"],
  endpoints: (builder) => ({
    getAccounts: builder.query<Account[], void>({
      query: () => "/finance/accounts",
      providesTags: ["Account"],
    }),

    getAccountsTree: builder.query<any[], void>({
      query: () => "/finance/accounts/tree",
      providesTags: ["Account"],
    }),

    createAccount: builder.mutation<Account, AccountDto>({
      query: (body) => ({
        url: "/finance/accounts",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Account"],
    }),

    getJournals: builder.query<any, { page?: number; limit?: number }>({
      query: (params) => ({
        url: "/finance/journals",
        params,
      }),
      providesTags: ["Journal"],
    }),

    createJournal: builder.mutation<any, JournalEntryDto>({
      query: (body) => ({
        url: "/finance/journals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Journal", "Account"],
    }),

    getInvoices: builder.query<any, { page?: number; limit?: number }>({
      query: (params) => ({
        url: "/finance/invoices",
        params,
      }),
      providesTags: ["Invoice"],
    }),

    createInvoice: builder.mutation<any, InvoiceDto>({
      query: (body) => ({
        url: "/finance/invoices",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Invoice"],
    }),

    updateInvoiceStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/finance/invoices/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Invoice", "Journal", "Account"],
    }),

    getTaxRates: builder.query<TaxRateDto[], void>({
      query: () => "/finance/tax-rates",
      providesTags: ["Tax"],
    }),

    createTaxRate: builder.mutation<TaxRateDto, TaxRateDto>({
      query: (body) => ({
        url: "/finance/tax-rates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tax"],
    }),

    closePeriod: builder.mutation<any, string>({
      query: (id) => ({
        url: `/finance/periods/${id}/close`,
        method: "POST",
      }),
      invalidatesTags: ["Report"],
    }),

    getTrialBalance: builder.query<any[], void>({
      query: () => "/finance/reports/trial-balance",
      providesTags: ["Report"],
    }),

    getIncomeStatement: builder.query<
      any,
      { startDate: string; endDate: string }
    >({
      query: (params) => ({
        url: "/finance/reports/income-statement",
        params,
      }),
      providesTags: ["Report"],
    }),

    getBalanceSheet: builder.query<any, { asOfDate: string }>({
      query: (params) => ({
        url: "/finance/reports/balance-sheet",
        params,
      }),
      providesTags: ["Report"],
    }),

    getCashFlow: builder.query<any, { startDate: string; endDate: string }>({
      query: (params) => ({
        url: "/finance/reports/cash-flow",
        params,
      }),
      providesTags: ["Report"],
    }),

    getBudgetVsActual: builder.query<any, { period: string }>({
      query: (params) => ({
        url: "/finance/reports/budget-vs-actual",
        params,
      }),
      providesTags: ["Report"],
    }),

    getARAgingReport: builder.query<any, void>({
      query: () => "/finance/reports/ar-aging",
      providesTags: ["Report"],
    }),

    getGeneralLedger: builder.query<
      any,
      {
        accountId: string;
        page?: number;
        limit?: number;
        startDate?: string;
        endDate?: string;
      }
    >({
      query: ({ accountId, ...params }) => ({
        url: `/finance/reports/general-ledger/${accountId}`,
        params,
      }),
      providesTags: ["Journal"],
    }),
  }),
});

export const {
  useGetAccountsQuery,
  useGetAccountsTreeQuery,
  useCreateAccountMutation,
  useGetJournalsQuery,
  useCreateJournalMutation,
  useGetInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceStatusMutation,
  useGetTaxRatesQuery,
  useCreateTaxRateMutation,
  useClosePeriodMutation,
  useGetTrialBalanceQuery,
  useGetIncomeStatementQuery,
  useGetBalanceSheetQuery,
  useGetCashFlowQuery,
  useGetBudgetVsActualQuery,
  useGetARAgingReportQuery,
  useGetGeneralLedgerQuery,
} = financeApi;
