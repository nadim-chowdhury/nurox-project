import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Assuming standard unified Response Wrapper pattern from the backend: { data: T, statusCode, timestamp }
export interface UnifiedResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  status: string;
  team: string[];
  tasks: { total: number; done: number };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
}

export const projectsApi = createApi({
  reducerPath: "projectsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    prepareHeaders: (headers) => {
      // In a real app, attach JWT here if not relying entirely on httpOnly cookies
      return headers;
    },
  }),
  tagTypes: ["Project", "Task"],
  endpoints: (builder) => ({
    getProjects: builder.query<UnifiedResponse<Project[]>, void>({
      query: () => "/projects",
      providesTags: ["Project"],
    }),
    createProject: builder.mutation<UnifiedResponse<Project>, Partial<Project>>(
      {
        query: (body) => ({
          url: "/projects",
          method: "POST",
          body,
        }),
        invalidatesTags: ["Project"],
      },
    ),
    createTask: builder.mutation<UnifiedResponse<Task>, Partial<Task>>({
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
