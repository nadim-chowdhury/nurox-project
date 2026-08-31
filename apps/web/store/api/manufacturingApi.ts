import { baseApi } from "./baseApi";

export interface Workcenter {
  id: string;
  name: string;
  machineCostPerHour: number;
  laborCostPerHour: number;
  overheadCostPerHour: number;
  createdAt: string;
}

export interface Machine {
  id: string;
  workcenterId: string;
  code: string;
  name: string;
  capacityPerHour: number | null;
  status: "AVAILABLE" | "IN_USE" | "MAINTENANCE" | "OFFLINE";
}

export interface BomItem {
  id: string;
  componentProductId: string;
  quantity: number;
  unitOfMeasure: string;
  componentProduct?: {
    id: string;
    name: string;
    sku: string;
  };
}

export interface Bom {
  id: string;
  finishedProductId: string;
  version: string;
  isActive: boolean;
  items: BomItem[];
  finishedProduct?: {
    id: string;
    name: string;
    sku: string;
  };
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  bomId: string;
  targetQuantity: number;
  producedQuantity: number;
  scrappedQuantity: number;
  status:
    | "DRAFT"
    | "RELEASED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CLOSED"
    | "CANCELLED";
  plannedStartAt: string | null;
  plannedEndAt: string | null;
  actualStartAt: string | null;
  actualEndAt: string | null;
  bom?: Bom;
  stages?: any[];
  createdAt: string;
}

export const manufacturingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkcenters: builder.query<Workcenter[], void>({
      query: () => "/manufacturing/workcenters",
      providesTags: ["WorkOrder"],
    }),
    createWorkcenter: builder.mutation<Workcenter, Partial<Workcenter>>({
      query: (body) => ({
        url: "/manufacturing/workcenters",
        method: "POST",
        body,
      }),
      invalidatesTags: ["WorkOrder"],
    }),
    getMachines: builder.query<Machine[], string | void>({
      query: (workcenterId) => ({
        url: "/manufacturing/machines",
        params: workcenterId ? { workcenterId } : undefined,
      }),
      providesTags: ["WorkOrder"],
    }),
    createMachine: builder.mutation<
      Machine,
      {
        workcenterId: string;
        code: string;
        name: string;
        capacityPerHour?: number;
      }
    >({
      query: (body) => ({
        url: "/manufacturing/machines",
        method: "POST",
        body,
      }),
      invalidatesTags: ["WorkOrder"],
    }),
    getBoms: builder.query<Bom[], void>({
      query: () => "/manufacturing/boms",
      providesTags: ["BOM"],
    }),
    createBom: builder.mutation<
      Bom,
      {
        finishedProductId: string;
        version?: string;
        items: {
          componentProductId: string;
          quantity: number;
          unitOfMeasure: string;
        }[];
      }
    >({
      query: (body) => ({
        url: "/manufacturing/boms",
        method: "POST",
        body,
      }),
      invalidatesTags: ["BOM"],
    }),
    getWorkOrders: builder.query<WorkOrder[], void>({
      query: () => "/manufacturing/work-orders",
      providesTags: ["WorkOrder"],
    }),
    getWorkOrderById: builder.query<WorkOrder, string>({
      query: (id) => `/manufacturing/work-orders/${id}`,
      providesTags: (_res, _err, id) => [{ type: "WorkOrder", id }],
    }),
    createWorkOrder: builder.mutation<
      WorkOrder,
      {
        bomId: string;
        targetQuantity: number;
        workcenterId?: string;
        plannedStartAt?: string;
        plannedEndAt?: string;
      }
    >({
      query: (body) => ({
        url: "/manufacturing/work-orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["WorkOrder"],
    }),
    releaseWorkOrder: builder.mutation<WorkOrder, string>({
      query: (id) => ({
        url: `/manufacturing/work-orders/${id}/release`,
        method: "POST",
      }),
      invalidatesTags: ["WorkOrder"],
    }),
    logProduction: builder.mutation<
      any,
      {
        workOrderId: string;
        stageId?: string;
        quantityProduced: number;
        quantityScrapped?: number;
        notes?: string;
      }
    >({
      query: (body) => ({
        url: `/manufacturing/work-orders/${body.workOrderId}/log-production`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WorkOrder"],
    }),
    completeWorkOrder: builder.mutation<
      WorkOrder,
      { id: string; targetWarehouseId: string; notes?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/manufacturing/work-orders/${id}/complete`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["WorkOrder"],
    }),
    getManufacturingAnalytics: builder.query<
      {
        totalWorkOrders: number;
        activeWorkOrders: number;
        completedWorkOrders: number;
        overallOee: number;
      },
      void
    >({
      query: () => "/manufacturing/analytics",
      providesTags: ["WorkOrder"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWorkcentersQuery,
  useCreateWorkcenterMutation,
  useGetMachinesQuery,
  useCreateMachineMutation,
  useGetBomsQuery,
  useCreateBomMutation,
  useGetWorkOrdersQuery,
  useGetWorkOrderByIdQuery,
  useCreateWorkOrderMutation,
  useReleaseWorkOrderMutation,
  useLogProductionMutation,
  useCompleteWorkOrderMutation,
  useGetManufacturingAnalyticsQuery,
} = manufacturingApi;
