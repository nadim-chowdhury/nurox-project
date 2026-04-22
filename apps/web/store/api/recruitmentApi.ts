import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";

export const recruitmentApi = createApi({
  reducerPath: "recruitmentApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Job", "Application", "Candidate", "Interview", "Offer", "Onboarding"],
  endpoints: (builder) => ({
    // Jobs
    getJobs: builder.query<any[], void>({
      query: () => "/recruitment/jobs",
      providesTags: ["Job"],
    }),
    createJob: builder.mutation<any, any>({
      query: (body) => ({ url: "/recruitment/jobs", method: "POST", body }),
      invalidatesTags: ["Job"],
    }),
    submitJobForApproval: builder.mutation<any, { id: string; approverIds: string[] }>({
      query: ({ id, ...body }) => ({
        url: `/recruitment/jobs/${id}/submit`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Job"],
    }),
    approveJobStep: builder.mutation<any, { id: string; userId: string; comment?: string }>({
      query: ({ id, ...body }) => ({
        url: `/recruitment/jobs/${id}/approve`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Job"],
    }),
    openJob: builder.mutation<any, string>({
      query: (id) => ({ url: `/recruitment/jobs/${id}/open`, method: "PUT" }),
      invalidatesTags: ["Job"],
    }),
    updateJobStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, ...body }) => ({
        url: `/recruitment/jobs/${id}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Job"],
    }),

    // Applications
    getApplications: builder.query<any[], void>({
      query: () => "/recruitment/applications",
      providesTags: ["Application"],
    }),
    getApplication: builder.query<any, string>({
      query: (id) => `/recruitment/applications/${id}`,
      providesTags: (_, __, id) => [{ type: "Application", id }],
    }),
    updateApplicationStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, ...body }) => ({
        url: `/recruitment/applications/${id}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Application", id }, "Application"],
    }),

    // Candidates
    getCandidates: builder.query<any[], void>({
      query: () => "/recruitment/candidates",
      providesTags: ["Candidate"],
    }),
    createCandidate: builder.mutation<any, any>({
      query: (body) => ({ url: "/recruitment/candidates", method: "POST", body }),
      invalidatesTags: ["Candidate"],
    }),
    getCandidate: builder.query<any, string>({
      query: (id) => `/recruitment/candidates/${id}`,
      providesTags: (_, __, id) => [{ type: "Candidate", id }],
    }),
    getResumeUploadUrl: builder.mutation<any, { id: string; fileName: string; contentType: string }>({
      query: ({ id, ...body }) => ({
        url: `/recruitment/candidates/${id}/resume-url`,
        method: "POST",
        body,
      }),
    }),

    // Interviews
    getInterviews: builder.query<any[], void>({
      query: () => "/recruitment/interviews",
      providesTags: ["Interview"],
    }),
    scheduleInterview: builder.mutation<any, any>({
      query: (body) => ({ url: "/recruitment/interviews", method: "POST", body }),
      invalidatesTags: ["Interview", "Application"],
    }),
    submitInterviewFeedback: builder.mutation<any, { id: string; feedback: string; rating: number }>({
      query: ({ id, ...body }) => ({
        url: `/recruitment/interviews/${id}/feedback`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Interview"],
    }),

    // Offers
    createOffer: builder.mutation<any, any>({
      query: (body) => ({ url: "/recruitment/offers", method: "POST", body }),
      invalidatesTags: ["Offer", "Application"],
    }),
    generateOfferPdf: builder.mutation<any, string>({
      query: (id) => ({ url: `/recruitment/offers/${id}/generate-pdf`, method: "POST" }),
      invalidatesTags: ["Offer"],
    }),
    signOffer: builder.mutation<any, { id: string; signature: string }>({
      query: ({ id, ...body }) => ({
        url: `/recruitment/offers/${id}/sign`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Offer", "Onboarding"],
    }),

    // Onboarding
    getOnboarding: builder.query<any, string>({
      query: (candidateId) => `/recruitment/onboarding/candidate/${candidateId}`,
      providesTags: ["Onboarding"],
    }),
    updateOnboardingTask: builder.mutation<any, { id: string; taskTitle: string; isCompleted: boolean }>({
      query: ({ id, ...body }) => ({
        url: `/recruitment/onboarding/${id}/tasks`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),
  }),
});

export const {
  useGetJobsQuery,
  useCreateJobMutation,
  useSubmitJobForApprovalMutation,
  useApproveJobStepMutation,
  useOpenJobMutation,
  useUpdateJobStatusMutation,
  useGetApplicationsQuery,
  useGetApplicationQuery,
  useUpdateApplicationStatusMutation,
  useGetCandidatesQuery,
  useCreateCandidateMutation,
  useGetCandidateQuery,
  useGetResumeUploadUrlMutation,
  useGetInterviewsQuery,
  useScheduleInterviewMutation,
  useSubmitInterviewFeedbackMutation,
  useCreateOfferMutation,
  useGenerateOfferPdfMutation,
  useSignOfferMutation,
  useGetOnboardingQuery,
  useUpdateOnboardingTaskMutation,
} = recruitmentApi;
