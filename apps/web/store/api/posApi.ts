import { baseApi } from "./baseApi";
import type {
  CreatePosSessionDto,
  CreatePosOrderDto,
} from "@repo/shared-schemas";

export interface PosSession {
  id: string;
  tenantId: string;
  cashierId: string;
  openingFloat: number;
  closingCash?: number;
  openedAt: string;
  closedAt?: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
}

export interface PosOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface PosOrder {
  id: string;
  tenantId: string;
  sessionId: string;
  totalAmount: number;
  amountTendered: number;
  changeDue: number;
  paymentMethod: "CASH" | "CARD" | "MOBILE" | "SPLIT";
  items: PosOrderItem[];
  createdAt: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export const posApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentSession: builder.query<PosSession | null, void>({
      query: () => "/pos/sessions/current",
      providesTags: ["Product"],
    }),

    getSessions: builder.query<
      PaginatedResponse<PosSession>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/pos/sessions",
        params: params || undefined,
      }),
      providesTags: ["Product"],
    }),

    openSession: builder.mutation<PosSession, CreatePosSessionDto>({
      query: (body) => ({
        url: "/pos/sessions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    closeSession: builder.mutation<
      PosSession,
      { id: string; closingCash: number }
    >({
      query: ({ id, closingCash }) => ({
        url: `/pos/sessions/${id}/close`,
        method: "POST",
        body: { closingCash },
      }),
      invalidatesTags: ["Product"],
    }),

    getOrders: builder.query<
      PaginatedResponse<PosOrder>,
      { sessionId?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/pos/orders",
        params: params || undefined,
      }),
      providesTags: ["Product"],
    }),

    createOrder: builder.mutation<PosOrder, CreatePosOrderDto>({
      query: (body) => ({
        url: "/pos/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product", "Stock"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetCurrentSessionQuery,
  useGetSessionsQuery,
  useOpenSessionMutation,
  useCloseSessionMutation,
  useGetOrdersQuery,
  useCreateOrderMutation,
} = posApi;
