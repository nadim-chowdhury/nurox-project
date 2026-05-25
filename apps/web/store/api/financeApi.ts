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

    reviewJournal: builder.mutation<any, string>({
      query: (id) => ({
        url: `/finance/journals/${id}/review`,
        method: "POST",
      }),
      invalidatesTags: ["Journal"],
    }),

    approveJournal: builder.mutation<any, string>({
      query: (id) => ({
        url: `/finance/journals/${id}/approve`,
        method: "POST",
      }),
      invalidatesTags: ["Journal"],
    }),

    postJournal: builder.mutation<any, string>({
      query: (id) => ({
        url: `/finance/journals/${id}/post`,
        method: "POST",
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

    getBills: builder.query<any, { page?: number; limit?: number }>({
      query: (params) => ({
        url: "/finance/bills",
        params,
      }),
      providesTags: ["Bill"],
    }),

    createBill: builder.mutation<any, any>({
      query: (body) => ({
        url: "/finance/bills",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Bill"],
    }),

    updateBillStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/finance/bills/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Bill", "Journal", "Account"],
    }),

    getBankAccounts: builder.query<any[], void>({
      query: () => "/finance/bank-accounts",
      providesTags: ["Account"],
    }),

    getBankTransactions: builder.query<any[], string>({
      query: (id) => `/finance/bank-accounts/${id}/transactions`,
      providesTags: ["Journal"],
    }),

    getUnreconciledJournals: builder.query<any[], string>({
      query: (id) => `/finance/bank-accounts/${id}/unreconciled-journals`,
      providesTags: ["Journal"],
    }),

    importBankStatement: builder.mutation<
      any,
      { bankAccountId: string; transactions: any[] }
    >({
      query: ({ bankAccountId, transactions }) => ({
        url: `/finance/banking/${bankAccountId}/import`,
        method: "POST",
        body: { transactions },
      }),
      invalidatesTags: ["Journal", "Account"],
    }),

    reconcileTransaction: builder.mutation<
      any,
      { transactionId: string; journalEntryId: string }
    >({
      query: ({ transactionId, journalEntryId }) => ({
        url: `/finance/banking/reconcile/${transactionId}`,
        method: "POST",
        body: { journalEntryId },
      }),
      invalidatesTags: ["Journal", "Account"],
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

    getAPAgingReport: builder.query<any, void>({
      query: () => "/finance/reports/ap-aging",
      providesTags: ["Report"],
    }),

    getExpenseClaims: builder.query<any[], void>({
      query: () => "/finance/expense-claims",
      providesTags: ["Report"],
    }),

    createExpenseClaim: builder.mutation<any, any>({
      query: (body) => ({
        url: "/finance/expense-claims",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Report"],
    }),

    approveExpenseClaim: builder.mutation<
      any,
      { id: string; approverId: string }
    >({
      query: ({ id, approverId }) => ({
        url: `/finance/expense-claims/${id}/approve`,
        method: "POST",
        body: { approverId },
      }),
      invalidatesTags: ["Report", "Journal", "Account"],
    }),

    getPettyCashFunds: builder.query<any[], void>({
      query: () => "/finance/petty-cash/funds",
      providesTags: ["Account"],
    }),

    createPettyCashFund: builder.mutation<any, any>({
      query: (body) => ({
        url: "/finance/petty-cash/funds",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Account"],
    }),

    getPettyCashTransactions: builder.query<any[], string>({
      query: (id) => `/finance/petty-cash/funds/${id}/transactions`,
      providesTags: ["Journal"],
    }),

    recordPettyCashTransaction: builder.mutation<any, any>({
      query: (body) => ({
        url: "/finance/petty-cash/transactions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Journal", "Account"],
    }),

    getRecurringInvoices: builder.query<any[], void>({
      query: () => "/finance/recurring-invoices",
      providesTags: ["Invoice"],
    }),

    createRecurringInvoice: builder.mutation<any, any>({
      query: (body) => ({
        url: "/finance/recurring-invoices",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Invoice"],
    }),

    getRecurringJournals: builder.query<any[], void>({
      query: () => "/finance/recurring-journals",
      providesTags: ["Journal"],
    }),

    createRecurringJournal: builder.mutation<any, any>({
      query: (body) => ({
        url: "/finance/recurring-journals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Journal"],
    }),

    getPaymentBatches: builder.query<any[], void>({
      query: () => "/finance/payment-batches",
      providesTags: ["Bill"],
    }),

    createPaymentBatch: builder.mutation<any, any>({
      query: (body) => ({
        url: "/finance/payment-batches",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Bill", "Journal", "Account"],
    }),

    getCostCenters: builder.query<any[], void>({
      query: () => "/finance/cost-centers",
      providesTags: ["Report"],
    }),

    getCostCenterPL: builder.query<any, { id: string; startDate: string; endDate: string }>({
      query: ({ id, ...params }) => ({
        url: `/finance/cost-centers/${id}/pl`,
        params,
      }),
      providesTags: ["Report"],
    }),

    getVATReturn: builder.query<any, { startDate: string; endDate: string }>({
      query: (params) => ({
        url: "/finance/reports/vat-return",
        params,
      }),
      providesTags: ["Report"],
    }),

    getTDSReport: builder.query<any, { startDate: string; endDate: string }>({
      query: (params) => ({
        url: "/finance/reports/tds-report",
        params,
      }),
      providesTags: ["Report"],
    }),

    exportInvoicePdf: builder.query<Blob, string>({
      query: (id) => ({
        url: `/finance/invoices/${id}/pdf`,
        responseHandler: (response) => response.blob(),
      }),
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
  useReviewJournalMutation,
  useApproveJournalMutation,
  usePostJournalMutation,
  useGetInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceStatusMutation,
  useGetBillsQuery,
  useCreateBillMutation,
  useUpdateBillStatusMutation,
  useGetBankAccountsQuery,
  useGetBankTransactionsQuery,
  useGetUnreconciledJournalsQuery,
  useImportBankStatementMutation,
  useReconcileTransactionMutation,
  useGetTaxRatesQuery,
  useCreateTaxRateMutation,
  useClosePeriodMutation,
  useGetTrialBalanceQuery,
  useGetIncomeStatementQuery,
  useGetBalanceSheetQuery,
  useGetCashFlowQuery,
  useGetBudgetVsActualQuery,
  useGetARAgingReportQuery,
  useGetAPAgingReportQuery,
  useGetExpenseClaimsQuery,
  useCreateExpenseClaimMutation,
  useApproveExpenseClaimMutation,
  useGetPettyCashFundsQuery,
  useCreatePettyCashFundMutation,
  useGetPettyCashTransactionsQuery,
  useRecordPettyCashTransactionMutation,
  useGetRecurringInvoicesQuery,
  useCreateRecurringInvoiceMutation,
  useGetRecurringJournalsQuery,
  useCreateRecurringJournalMutation,
  useGetPaymentBatchesQuery,
  useCreatePaymentBatchMutation,
  useGetCostCentersQuery,
  useGetCostCenterPLQuery,
  useGetVATReturnQuery,
  useGetTDSReportQuery,
  useExportInvoicePdfQuery,
  useLazyExportInvoicePdfQuery,
  useGetGeneralLedgerQuery,
} = financeApi;
