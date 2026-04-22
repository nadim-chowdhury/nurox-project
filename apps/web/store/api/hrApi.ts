import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";
import type {
  DepartmentDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  CreateEmployeeDto,
  EmployeeResponseDto,
  OkrDto,
  TrainingDto,
  SkillDto,
} from "@repo/shared-schemas";

/**
 * HR API — RTK Query endpoints for HR management (Employees, Departments).
 */

export interface Employee extends EmployeeResponseDto {
  department: any;
  designation: any;
  salary?: number;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  contractExpiryDate?: string;
  probationEndDate?: string;
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
  tagTypes: [
    "Employee",
    "Department",
    "Designation",
    "History",
    "Performance",
    "Training",
    "Skill",
  ],
  endpoints: (builder) => ({
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

    createEmployee: builder.mutation<Employee, CreateEmployeeDto>({
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

    updateSalary: builder.mutation<
      Employee,
      { id: string; newSalary: number; reason: string; comments?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/hr/employees/${id}/salary`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Employee", id },
        { type: "History", id },
      ],
    }),

    addOKR: builder.mutation<any, { id: string; data: OkrDto }>({
      query: ({ id, data }) => ({
        url: `/hr/employees/${id}/okr`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Performance", id }],
    }),

    addTraining: builder.mutation<any, { id: string; data: TrainingDto }>({
      query: ({ id, data }) => ({
        url: `/hr/employees/${id}/training`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Training", id }],
    }),

    addSkill: builder.mutation<any, { id: string; data: SkillDto }>({
      query: ({ id, data }) => ({
        url: `/hr/employees/${id}/skill`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Skill", id }],
    }),

    submit360Review: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/hr/employees/${id}/360-review`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Performance", id }],
    }),

    initiatePIP: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/hr/employees/${id}/pip`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Performance", id }],
    }),

    getEmployeeHistory: builder.query<any[], string>({
      query: (id) => `/hr/employees/${id}/history`,
      providesTags: (_, __, id) => [{ type: "History", id }],
    }),

    getSalaryHistory: builder.query<any[], string>({
      query: (id) => `/hr/employees/${id}/salary-history`,
      providesTags: (_, __, id) => [{ type: "History", id }],
    }),

    transferEmployee: builder.mutation<Employee, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/hr/employees/${id}/transfer`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Employee", id },
        { type: "History", id },
      ],
    }),

    terminateEmployee: builder.mutation<Employee, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/hr/employees/${id}/terminate`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Employee", id },
        { type: "History", id },
      ],
    }),

    getTrainings: builder.query<any[], void>({
      query: () => "/hr/trainings",
      providesTags: ["Training"],
    }),

    getSkillMatrix: builder.query<any, void>({
      query: () => "/hr/skill-matrix",
      providesTags: ["Skill"],
    }),

    getDepartments: builder.query<DepartmentDto[], void>({
      query: () => "/hr/departments",
      providesTags: ["Department"],
    }),

    getDesignations: builder.query<any[], void>({
      query: () => "/hr/designations",
      providesTags: ["Designation"],
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

    updateDepartment: builder.mutation<
      DepartmentDto,
      { id: string; data: UpdateDepartmentDto }
    >({
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
  useUpdateSalaryMutation,
  useAddOKRMutation,
  useAddTrainingMutation,
  useAddSkillMutation,
  useSubmit360ReviewMutation,
  useInitiatePIPMutation,
  useGetEmployeeHistoryQuery,
  useGetSalaryHistoryQuery,
  useTransferEmployeeMutation,
  useTerminateEmployeeMutation,
  useGetTrainingsQuery,
  useGetSkillMatrixQuery,
  useGetDepartmentsQuery,
  useGetDesignationsQuery,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = hrApi;
