import { baseApi } from "./baseApi";

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

export const projectsApi = baseApi.injectEndpoints({
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
  overrideExisting: false,
});

export const {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useCreateTaskMutation,
} = projectsApi;
