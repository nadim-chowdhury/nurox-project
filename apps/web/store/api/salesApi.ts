import { baseApi } from "./baseApi";
import type {
  CreateQuotationDto,
  CreateAccountDto,
  InvoiceFromSalesOrderDto,
} from "@repo/shared-schemas";

export interface ApiEnvelope<T> {
  data: T;
  statusCode?: number;
  timestamp?: string;
}

function unwrap<T>(response: ApiEnvelope<T> | T): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    (response as ApiEnvelope<T>).data !== undefined
  ) {
    return (response as ApiEnvelope<T>).data;
  }
  return response as T;
}

export interface SalesAccount {
  id: string;
  name: string;
  taxBin?: string | null;
  billingAddress?: string | null;
}

export interface SalesLine {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxPercent: number;
}

export interface QuotationRecord {
  id: string;
  quotationNumber: string;
  accountId: string | null;
  account?: SalesAccount | null;
  status: string;
  issueDate: string;
  validUntil: string;
  currency: string;
  lines?: SalesLine[];
}

export interface SalesOrderRecord {
  id: string;
  soNumber: string;
  accountId: string;
  account?: SalesAccount | null;
  status: string;
  orderDate: string;
  currency: string;
  subTotal?: number;
  vatTotal?: number;
  taxTotal?: number;
  totalAmount?: number;
  financeInvoiceId?: string | null;
  mushak63Id?: string | null;
  lines?: SalesLine[];
}

export interface CreateInvoiceResult {
  salesOrderId: string;
  financeInvoiceId: string;
  mushak63Id: string;
  invoiceNumber: string;
  salesOrder: SalesOrderRecord;
}

/** Bangladesh-style line total (SD on base, VAT on base+SD). */
export function calcSalesLineTotal(line: {
  quantity: number;
  unitPrice: number;
  discountPercent?: number;
  taxPercent?: number;
  sdPercent?: number;
}): number {
  const qty = Number(line.quantity);
  const price = Number(line.unitPrice);
  const disc = Number(line.discountPercent ?? 0);
  const vat = Number(line.taxPercent ?? 0);
  const sd = Number(line.sdPercent ?? 0);
  const sub = qty * price * (1 - disc / 100);
  const sdAmt = sub * (sd / 100);
  const vatAmt = (sub + sdAmt) * (vat / 100);
  return Math.round((sub + sdAmt + vatAmt) * 100) / 100;
}

export function quotationDisplayTotal(q: QuotationRecord): number {
  if (!q.lines?.length) return 0;
  return q.lines.reduce((sum, line) => sum + calcSalesLineTotal(line), 0);
}

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSalesAccounts: builder.query<SalesAccount[], void>({
      query: () => "/sales/accounts",
      transformResponse: (res: ApiEnvelope<SalesAccount[]>) => unwrap(res),
      providesTags: ["Customer"],
    }),

    createSalesAccount: builder.mutation<SalesAccount, CreateAccountDto>({
      query: (body) => ({
        url: "/sales/accounts",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiEnvelope<SalesAccount>) => unwrap(res),
      invalidatesTags: ["Customer"],
    }),

    getQuotations: builder.query<QuotationRecord[], void>({
      query: () => "/sales/quotations",
      transformResponse: (res: ApiEnvelope<QuotationRecord[]>) => unwrap(res),
      providesTags: ["Quotation"],
    }),

    getQuotation: builder.query<QuotationRecord, string>({
      query: (id) => `/sales/quotations/${id}`,
      transformResponse: (res: ApiEnvelope<QuotationRecord>) => unwrap(res),
      providesTags: (_r, _e, id) => [{ type: "Quotation", id }],
    }),

    createQuotation: builder.mutation<QuotationRecord, CreateQuotationDto>({
      query: (body) => ({
        url: "/sales/quotations",
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiEnvelope<QuotationRecord>) => unwrap(res),
      invalidatesTags: ["Quotation", "SalesOrder"],
    }),

    sendQuotation: builder.mutation<QuotationRecord, string>({
      query: (id) => ({
        url: `/sales/quotations/${id}/send`,
        method: "POST",
      }),
      transformResponse: (res: ApiEnvelope<QuotationRecord>) => unwrap(res),
      invalidatesTags: ["Quotation", "SalesOrder"],
    }),

    convertQuotation: builder.mutation<SalesOrderRecord, string>({
      query: (id) => ({
        url: `/sales/quotations/${id}/convert`,
        method: "POST",
      }),
      transformResponse: (res: ApiEnvelope<SalesOrderRecord>) => unwrap(res),
      invalidatesTags: ["Quotation", "SalesOrder"],
    }),

    getSalesOrders: builder.query<SalesOrderRecord[], void>({
      query: () => "/sales/sales-orders",
      transformResponse: (res: ApiEnvelope<SalesOrderRecord[]>) => unwrap(res),
      providesTags: ["SalesOrder"],
    }),

    getSalesOrder: builder.query<SalesOrderRecord, string>({
      query: (id) => `/sales/sales-orders/${id}`,
      transformResponse: (res: ApiEnvelope<SalesOrderRecord>) => unwrap(res),
      providesTags: (_r, _e, id) => [{ type: "SalesOrder", id }],
    }),

    confirmSalesOrder: builder.mutation<SalesOrderRecord, string>({
      query: (id) => ({
        url: `/sales/sales-orders/${id}/confirm`,
        method: "POST",
      }),
      transformResponse: (res: ApiEnvelope<SalesOrderRecord>) => unwrap(res),
      invalidatesTags: (_r, _e, id) => [
        { type: "SalesOrder", id },
        "SalesOrder",
      ],
    }),

    createInvoiceFromSalesOrder: builder.mutation<
      CreateInvoiceResult,
      { id: string; body: InvoiceFromSalesOrderDto }
    >({
      query: ({ id, body }) => ({
        url: `/sales/sales-orders/${id}/create-invoice`,
        method: "POST",
        body,
      }),
      transformResponse: (res: ApiEnvelope<CreateInvoiceResult>) => unwrap(res),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "SalesOrder", id },
        "SalesOrder",
        "Invoice",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSalesAccountsQuery,
  useCreateSalesAccountMutation,
  useGetQuotationsQuery,
  useGetQuotationQuery,
  useCreateQuotationMutation,
  useSendQuotationMutation,
  useConvertQuotationMutation,
  useGetSalesOrdersQuery,
  useGetSalesOrderQuery,
  useConfirmSalesOrderMutation,
  useCreateInvoiceFromSalesOrderMutation,
} = salesApi;
