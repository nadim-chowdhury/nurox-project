import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Assuming standard unified Response Wrapper pattern from the backend: { data: T, statusCode, timestamp }
export interface UnifiedResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    prepareHeaders: (headers, { getState }) => {
      // In a real app, attach JWT here if not relying entirely on httpOnly cookies
      return headers;
    },
  }),
  tagTypes: ["Project", "Task"],
  endpoints: (builder) => ({
    getProjects: builder.query<UnifiedResponse<any[]>, void>({
      query: () => "/projects",
      providesTags: ["Project"],
    }),
    createProject: builder.mutation<UnifiedResponse<any>, Partial<any>>({
      query: (body) => ({
        url: "/projects",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Project"],
    }),
    createTask: builder.mutation<UnifiedResponse<any>, Partial<any>>({
      query: (body) => ({
        url: "/projects/tasks",
        method: "POST",
        body,
      }),
      // Invalidates project because adding a task changes project progress score
      invalidatesTags: ["Project", "Task"],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useCreateTaskMutation,
} = projectsApi;
