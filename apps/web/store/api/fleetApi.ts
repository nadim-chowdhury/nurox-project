import { baseApi } from "./baseApi";
import type {
  CreateVehicleDto,
  CreateFuelLogDto,
  CreateTripLogDto,
} from "@repo/shared-schemas";

export interface Vehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  fuelType: "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
  capacityKg: number;
  insuranceExpiry?: string;
  roadTaxExpiry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  odometer: number;
  fuelQuantity: number;
  cost: number;
  vehicle?: Vehicle;
  createdAt: string;
}

export interface TripLog {
  id: string;
  vehicleId: string;
  driverId: string;
  origin: string;
  destination: string;
  distanceKm: number;
  vehicle?: Vehicle;
  createdAt: string;
}

export interface RouteOptimizationResult {
  status: string;
  optimizedOrder: number[];
  estimatedTotalDistanceKm: number;
  estimatedTotalMinutes: number;
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

export const fleetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getVehicles: builder.query<
      PaginatedResponse<Vehicle>,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/fleet/vehicles",
        params: params || undefined,
      }),
      providesTags: (result) =>
        result && Array.isArray(result.data)
          ? [
              ...result.data.map(({ id }) => ({
                type: "Vehicle" as const,
                id,
              })),
              { type: "Vehicle", id: "LIST" },
            ]
          : [{ type: "Vehicle", id: "LIST" }],
    }),

    createVehicle: builder.mutation<Vehicle, CreateVehicleDto>({
      query: (body) => ({
        url: "/fleet/vehicles",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Vehicle", id: "LIST" }],
    }),

    getFuelLogs: builder.query<
      PaginatedResponse<FuelLog>,
      { vehicleId?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/fleet/fuel-logs",
        params: params || undefined,
      }),
      providesTags: ["Vehicle"],
    }),

    createFuelLog: builder.mutation<FuelLog, CreateFuelLogDto>({
      query: (body) => ({
        url: "/fleet/fuel-logs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vehicle"],
    }),

    getTripLogs: builder.query<
      PaginatedResponse<TripLog>,
      { vehicleId?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/fleet/trip-logs",
        params: params || undefined,
      }),
      providesTags: ["Vehicle"],
    }),

    createTripLog: builder.mutation<TripLog, CreateTripLogDto>({
      query: (body) => ({
        url: "/fleet/trip-logs",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Vehicle"],
    }),

    optimizeRoute: builder.mutation<
      RouteOptimizationResult,
      { stops: string[] }
    >({
      query: (body) => ({
        url: "/fleet/optimize-route",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVehiclesQuery,
  useCreateVehicleMutation,
  useGetFuelLogsQuery,
  useCreateFuelLogMutation,
  useGetTripLogsQuery,
  useCreateTripLogMutation,
  useOptimizeRouteMutation,
} = fleetApi;
