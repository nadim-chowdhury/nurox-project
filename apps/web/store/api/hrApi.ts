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
  manager?: any;
  salary?: number;
  dateOfBirth?: string | null;
  gender?: string | null;
  address?: string | null;
  contractExpiryDate?: string | null;
  probationEndDate: string | null;
  skills?: any[];
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
    "TrainingCourse",
    "SkillCatalog",
    "ENPS",
    "Handbook",
    "Succession",
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

    rehireEmployee: builder.mutation<Employee, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/hr/employees/${id}/rehire`,
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

    getOrgChart: builder.query<any[], void>({
      query: () => "/hr/org-chart",
    }),

    getDepartments: builder.query<DepartmentDto[], void>({
      query: () => "/hr/departments",
      providesTags: ["Department"],
    }),

    getDesignations: builder.query<any[], void>({
      query: () => "/hr/designations",
      providesTags: ["Designation"],
    }),

    getGrades: builder.query<any[], void>({
      query: () => "/hr/grades",
      providesTags: ["Grade"],
    }),

    createGrade: builder.mutation<any, any>({
      query: (body) => ({
        url: "/hr/grades",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Grade"],
    }),

    updateGrade: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/hr/grades/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Grade"],
    }),

    deleteGrade: builder.mutation<void, string>({
      query: (id) => ({
        url: `/hr/grades/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Grade"],
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

    getSalaryRevisions: builder.query<any[], void>({
      query: () => "/hr/salary-revisions",
      providesTags: ["History"],
    }),

    createSalaryRevision: builder.mutation<any, any>({
      query: (body) => ({
        url: "/hr/salary-revisions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["History"],
    }),

    updateSalaryRevisionStatus: builder.mutation<any, { id: string; status: string; comments?: string }>({
      query: ({ id, ...body }) => ({
        url: `/hr/salary-revisions/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["History", "Employee"],
    }),

    extendProbation: builder.mutation<any, { id: string; newEndDate: string; comments: string }>({
      query: ({ id, ...body }) => ({
        url: `/hr/employees/${id}/probation/extend`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Employee", "History"],
    }),

    completeProbation: builder.mutation<any, { id: string; comments: string }>({
      query: ({ id, ...body }) => ({
        url: `/hr/employees/${id}/probation/complete`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Employee", "History"],
    }),

    createProfileChangeRequest: builder.mutation<any, { id: string; changes: any }>({
      query: ({ id, changes }) => ({
        url: `/hr/employees/${id}/profile-change`,
        method: "POST",
        body: changes,
      }),
      invalidatesTags: ["History"],
    }),

    getProfileChangeRequests: builder.query<any[], void>({
      query: () => "/hr/profile-changes",
      providesTags: ["History"],
    }),

    updateProfileChangeRequestStatus: builder.mutation<any, { id: string; status: string; rejectionReason?: string }>({
      query: ({ id, ...body }) => ({
        url: `/hr/profile-changes/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["History", "Employee"],
    }),

    submitResignation: builder.mutation<any, { id: string; requestedLastWorkingDay: string; reason: string }>({
      query: ({ id, ...body }) => ({
        url: `/hr/employees/${id}/resignation`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["History", "Employee"],
    }),

    updateResignationStatus: builder.mutation<any, { id: string; status: string; approvedLastWorkingDay?: string; adminComments?: string }>({
      query: ({ id, ...body }) => ({
        url: `/hr/resignations/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["History", "Employee"],
    }),

    getClearanceChecklist: builder.query<any[], string>({
      query: (id) => `/hr/employees/${id}/clearance`,
      providesTags: ["History"],
    }),

    updateClearanceItem: builder.mutation<any, { id: string; isCleared: boolean; remarks?: string }>({
      query: ({ id, ...body }) => ({
        url: `/hr/clearance/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["History"],
    }),

    submitExitInterview: builder.mutation<any, { id: string; responses: any }>({
      query: ({ id, responses }) => ({
        url: `/hr/employees/${id}/exit-interview`,
        method: "POST",
        body: responses,
      }),
      invalidatesTags: ["History"],
    }),

    getPerformanceReviews: builder.query<any[], { employeeId: string; type?: string }>({
      query: (params) => ({
        url: "/hr/performance-reviews",
        params,
      }),
      providesTags: ["Performance"],
    }),

    addOKRCheckIn: builder.mutation<any, { keyResultId: string; value: number; comment?: string; checkedById: string }>({
      query: (body) => ({
        url: "/hr/okr-checkins",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Performance"],
    }),

    getTrainingCourses: builder.query<any[], void>({
      query: () => "/hr/training-courses",
      providesTags: ["TrainingCourse"],
    }),

    createTrainingCourse: builder.mutation<any, any>({
      query: (body) => ({
        url: "/hr/training-courses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["TrainingCourse"],
    }),

    enrollInTraining: builder.mutation<any, { id: string; courseId: string }>({
      query: ({ id, ...body }) => ({
        url: `/hr/employees/${id}/enroll`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Training", "Employee"],
    }),

    updateEmployeeTrainingStatus: builder.mutation<any, { id: string; status: string; certificateUrl?: string }>({
      query: ({ id, ...body }) => ({
        url: `/hr/trainings/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Training", "Employee"],
    }),

    getSkillCatalog: builder.query<any[], void>({
      query: () => "/hr/skill-catalog",
      providesTags: ["SkillCatalog"],
    }),

    addEmployeeSkill: builder.mutation<any, { id: string; catalogId: string; proficiency: number }>({
      query: ({ id, ...body }) => ({
        url: `/hr/employees/${id}/skills`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Skill", "Employee"],
    }),

    submitReviewFeedback: builder.mutation<any, any>({
      query: (body) => ({
        url: "/hr/review-feedback",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Performance"],
    }),

    getReviewSummary: builder.query<any, string>({
      query: (id) => `/hr/performance-reviews/${id}/summary`,
      providesTags: ["Performance"],
    }),

    getPIPActions: builder.query<any[], string>({
      query: (id) => `/hr/performance-reviews/${id}/pip-actions`,
      providesTags: ["Performance"],
    }),

    createPIPAction: builder.mutation<any, any>({
      query: (body) => ({
        url: "/hr/pip-actions",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Performance"],
    }),

    updatePIPAction: builder.mutation<any, { id: string; isAchieved: boolean; notes?: string }>({
      query: ({ id, ...body }) => ({
        url: `/hr/pip-actions/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Performance"],
    }),

    getENPSSurveys: builder.query<any[], void>({
      query: () => "/hr/enps-surveys",
      providesTags: ["ENPS"],
    }),

    submitENPSResponse: builder.mutation<any, any>({
      query: (body) => ({
        url: "/hr/enps-responses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["ENPS"],
    }),

    getENPSAnalytics: builder.query<any, string>({
      query: (id) => `/hr/enps-surveys/${id}/analytics`,
      providesTags: ["ENPS"],
    }),

    getHandbooks: builder.query<any[], void>({
      query: () => "/hr/handbooks",
      providesTags: ["Handbook"],
    }),

    createHandbook: builder.mutation<any, any>({
      query: (body) => ({
        url: "/hr/handbooks",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Handbook"],
    }),

    acknowledgeHandbook: builder.mutation<any, { id: string; handbookId: string }>({
      query: ({ id, ...body }) => ({
        url: `/hr/employees/${id}/handbook-ack`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Handbook"],
    }),

    createSuccessionPlan: builder.mutation<any, any>({
      query: (body) => ({
        url: "/hr/succession-plans",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Succession"],
    }),

    getSuccessionPlans: builder.query<any[], { designationId?: string; employeeId?: string }>({
      query: (params) => {
        if (params.designationId) return `/hr/designations/${params.designationId}/succession`;
        if (params.employeeId) return `/hr/employees/${params.employeeId}/successor-roles`;
        return "/hr/succession-plans"; // Not implemented but for completeness
      },
      providesTags: ["Succession"],
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
  useRehireEmployeeMutation,
  useGetTrainingsQuery,
  useGetSkillMatrixQuery,
  useGetOrgChartQuery,
  useGetDepartmentsQuery,
  useGetDesignationsQuery,
  useGetGradesQuery,
  useCreateGradeMutation,
  useUpdateGradeMutation,
  useDeleteGradeMutation,
  useGetDepartmentQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetSalaryRevisionsQuery,
  useCreateSalaryRevisionMutation,
  useUpdateSalaryRevisionStatusMutation,
  useExtendProbationMutation,
  useCompleteProbationMutation,
  useCreateProfileChangeRequestMutation,
  useGetProfileChangeRequestsQuery,
  useUpdateProfileChangeRequestStatusMutation,
  useSubmitResignationMutation,
  useUpdateResignationStatusMutation,
  useGetClearanceChecklistQuery,
  useUpdateClearanceItemMutation,
  useSubmitExitInterviewMutation,
  useGetPerformanceReviewsQuery,
  useAddOKRCheckInMutation,
  useGetTrainingCoursesQuery,
  useCreateTrainingCourseMutation,
  useEnrollInTrainingMutation,
  useUpdateEmployeeTrainingStatusMutation,
  useGetSkillCatalogQuery,
  useAddEmployeeSkillMutation,
  useSubmitReviewFeedbackMutation,
  useGetReviewSummaryQuery,
  useGetPIPActionsQuery,
  useCreatePIPActionMutation,
  useUpdatePIPActionMutation,
  useGetENPSSurveysQuery,
  useSubmitENPSResponseMutation,
  useGetENPSAnalyticsQuery,
  useGetHandbooksQuery,
  useCreateHandbookMutation,
  useAcknowledgeHandbookMutation,
  useCreateSuccessionPlanMutation,
  useGetSuccessionPlansQuery,
} = hrApi;
