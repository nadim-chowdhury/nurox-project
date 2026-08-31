import { baseApi } from "./baseApi";

export interface TaxCalculationResult {
  jurisdiction: string;
  totalTax: number;
  lines: Array<{
    lineId: string;
    taxableAmount: number;
    taxRate: number;
    taxAmount: number;
    taxType: string;
  }>;
}

export interface VatReturnResult {
  id: string;
  period: string;
  totalSales: number;
  totalVat: number;
  totalVds: number;
  netPayable: number;
  status: string;
}

export const complianceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    calculateTax: builder.mutation<TaxCalculationResult, any>({
      query: (body) => ({
        url: "/compliance/tax/calculate",
        method: "POST",
        body,
      }),
    }),
    checkFilingReadiness: builder.query<
      { isReady: boolean; issues: string[]; summary: any },
      string
    >({
      query: (period) => `/compliance/tax/readiness/${period}`,
      providesTags: ["TaxReturn"],
    }),
    generateMushak63: builder.mutation<any, any>({
      query: (body) => ({
        url: "/compliance/tax/mushak-63",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TaxReturn"],
    }),
    generateMushak66: builder.mutation<any, any>({
      query: (body) => ({
        url: "/compliance/tax/mushak-66",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TaxReturn"],
    }),
    generateVatReturn: builder.mutation<VatReturnResult, any>({
      query: (body) => ({
        url: "/compliance/tax/vat-return",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TaxReturn"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCalculateTaxMutation,
  useCheckFilingReadinessQuery,
  useGenerateMushak63Mutation,
  useGenerateMushak66Mutation,
  useGenerateVatReturnMutation,
} = complianceApi;
