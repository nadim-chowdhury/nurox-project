import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";
import type { 
  DepartmentDto, 
  CreateDepartmentDto, 
  UpdateDepartmentDto 
} from "@repo/shared-schemas";

/**
 * HR API — RTK Query endpoints for HR management (Employees, Departments).
 */

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  department: any; // Hierarchical department
  designation: any;
  status: "ACTIVE" | "ON_LEAVE" | "PROBATION" | "SUSPENDED" | "TERMINATED";
  joinDate: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
  salary?: number;
  managerId?: string;
  avatarUrl?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface EmployeeListResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const hrApi = createApi({
  reducerPath: "hrApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Employee", "Department", "Designation"],
  endpoints: (builder) => ({
    // ─── EMPLOYEES ──────────────────────────────────────────────
    getEmployees: builder.query<EmployeeListResponse, EmployeeListParams>({
      query: (params) => ({
        url: "/hr/employees",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "Employee" as const,
                id,
              })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }],
    }),

    getEmployee: builder.query<Employee, string>({
      query: (id) => `/hr/employees/${id}`,
      providesTags: (_, __, id) => [{ type: "Employee", id }],
    }),

    createEmployee: builder.mutation<Employee, any>({
      query: (body) => ({
        url: "/hr/employees",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),

    updateEmployee: builder.mutation<Employee, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/hr/employees/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Employee", id },
        { type: "Employee", id: "LIST" },
      ],
    }),

    deleteEmployee: builder.mutation<void, string>({
      query: (id) => ({
        url: `/hr/employees/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Employee", id: "LIST" }],
    }),

    // ─── DEPARTMENTS ────────────────────────────────────────────
    getDepartments: builder.query<DepartmentDto[], void>({
      query: () => "/hr/departments",
      providesTags: ["Department"],
    }),

    getDepartment: builder.query<DepartmentDto, string>({
      query: (id) => `/hr/departments/${id}`,
      providesTags: (_, __, id) => [{ type: "Department", id }],
    }),

    createDepartment: builder.mutation<DepartmentDto, CreateDepartmentDto>({
      query: (body) => ({
        url: "/hr/departments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Department"],
    }),

    updateDepartment: builder.mutation<DepartmentDto, { id: string; data: UpdateDepartmentDto }>({
      query: ({ id, data }) => ({
        url: `/hr/departments/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Department", id },
        { type: "Department", id: "LIST" },
      ],
    }),

    deleteDepartment: builder.mutation<void, string>({
      query: (id) => ({
        url: `/hr/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Department"],
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetDepartmentsQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = hrApi;
