import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";
import type { 
  ProductDto, 
  WarehouseDto, 
  ZoneDto, 
  RackDto, 
  BinDto, 
  StockMovementDto,
  StockAdjustmentDto,
  StockCountDto,
} from "@repo/shared-schemas";

export const inventoryApi = createApi({
  reducerPath: "inventoryApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Warehouse", "Stock", "StockCount"],
  endpoints: (builder) => ({
    // ─── PRODUCTS ──────────────────────────────────────────────
    getProducts: builder.query<any, any>({
      query: (params) => ({
        url: "/inventory/products",
        params,
      }),
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation<any, ProductDto>({
      query: (body) => ({
        url: "/inventory/products",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product"],
    }),

    // ─── WAREHOUSES ────────────────────────────────────────────
    getWarehouses: builder.query<WarehouseDto[], void>({
      query: () => "/inventory/warehouses",
      providesTags: ["Warehouse"],
    }),

    createWarehouse: builder.mutation<any, WarehouseDto>({
      query: (body) => ({
        url: "/inventory/warehouses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Warehouse"],
    }),

    // ─── STOCK OPERATIONS ────────────────────────────────────────
    receiveStock: builder.mutation<any, any>({
      query: (body) => ({
        url: "/inventory/stock/receive",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stock"],
    }),

    issueStock: builder.mutation<any, any>({
      query: (body) => ({
        url: "/inventory/stock/issue",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stock"],
    }),

    transferStock: builder.mutation<any, any>({
      query: (body) => ({
        url: "/inventory/stock/transfer",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stock"],
    }),

    adjustStock: builder.mutation<any, StockAdjustmentDto>({
      query: (body) => ({
        url: "/inventory/stock/adjust",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Stock"],
    }),

    // ─── ANALYTICS ──────────────────────────────────────────────
    getStockLevels: builder.query<any[], { productId?: string; warehouseId?: string }>({
      query: (params) => ({
        url: "/inventory/stock/levels",
        params,
      }),
      providesTags: ["Stock"],
    }),

    getStockAlerts: builder.query<any[], void>({
      query: () => "/inventory/stock/alerts",
      providesTags: ["Stock"],
    }),

    getInventoryAging: builder.query<any[], void>({
      query: () => "/inventory/stock/aging",
      providesTags: ["Stock"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useCreateProductMutation,
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useReceiveStockMutation,
  useIssueStockMutation,
  useTransferStockMutation,
  useAdjustStockMutation,
  useGetStockLevelsQuery,
  useGetStockAlertsQuery,
  useGetInventoryAgingQuery,
} = inventoryApi;
