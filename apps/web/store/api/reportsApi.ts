import { baseApi } from "./baseApi";

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  entityName: string;
  config: {
    fields: string[];
    filters?: Array<{ field: string; operator: string; value: any }>;
    joins?: Array<{ entity: string; condition: string }>;
    groupBy?: string[];
    orderBy?: Array<{ field: string; direction: "ASC" | "DESC" }>;
  };
  scheduleCron?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportTemplateDto {
  name: string;
  description?: string;
  entityName: string;
  config: {
    fields: string[];
    filters?: Array<{ field: string; operator: string; value: any }>;
    joins?: Array<{ entity: string; condition: string }>;
  };
  scheduleCron?: string;
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTemplates: builder.query<ReportTemplate[], void>({
      query: () => "/reports/templates",
      providesTags: ["Report"],
    }),

    createTemplate: builder.mutation<ReportTemplate, CreateReportTemplateDto>({
      query: (body) => ({
        url: "/reports/templates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Report"],
    }),

    executeReport: builder.mutation<
      any[],
      { templateId: string; filters?: any[] }
    >({
      query: ({ templateId, filters }) => ({
        url: `/reports/execute/${templateId}`,
        method: "POST",
        body: { filters },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTemplatesQuery,
  useCreateTemplateMutation,
  useExecuteReportMutation,
} = reportsApi;
