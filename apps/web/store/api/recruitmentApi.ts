import { baseApi } from "./baseApi";

export const recruitmentApi = baseApi.injectEndpoints({
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
    submitJobForApproval: builder.mutation<
      any,
      { id: string; approverIds?: string[] }
    >({
      query: ({ id, ...body }) => ({
        url: `/recruitment/jobs/${id}/submit`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Job"],
    }),
    approveJobStep: builder.mutation<
      any,
      { id: string; userId: string; comment?: string }
    >({
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
    updateApplicationStatus: builder.mutation<
      any,
      { id: string; status: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/recruitment/applications/${id}/status`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Application", id },
        "Application",
      ],
    }),
    parseResume: builder.mutation<any, string>({
      query: (id) => ({
        url: `/recruitment/applications/${id}/parse`,
        method: "POST",
      }),
      invalidatesTags: (_, __, id) => [
        { type: "Application", id },
        "Application",
      ],
    }),

    // Candidates
    getCandidates: builder.query<any[], void>({
      query: () => "/recruitment/candidates",
      providesTags: ["Candidate"],
    }),
    createCandidate: builder.mutation<any, any>({
      query: (body) => ({
        url: "/recruitment/candidates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Candidate"],
    }),
    getCandidate: builder.query<any, string>({
      query: (id) => `/recruitment/candidates/${id}`,
      providesTags: (_, __, id) => [{ type: "Candidate", id }],
    }),
    getResumeUploadUrl: builder.mutation<
      any,
      { id: string; fileName: string; contentType: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/recruitment/candidates/${id}/resume-url`,
        method: "POST",
        body,
      }),
    }),
    getDocumentUploadUrl: builder.mutation<
      any,
      { fileName: string; contentType: string }
    >({
      query: (body) => ({
        url: "/recruitment/onboarding/document-url",
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
      query: (body) => ({
        url: "/recruitment/interviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Interview", "Application"],
    }),
    submitInterviewFeedback: builder.mutation<
      any,
      { id: string; feedback: string; rating: number }
    >({
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
      query: (id) => ({
        url: `/recruitment/offers/${id}/generate-pdf`,
        method: "POST",
      }),
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
      query: (candidateId) =>
        `/recruitment/onboarding/candidate/${candidateId}`,
      providesTags: ["Onboarding"],
    }),
    createOnboarding: builder.mutation<
      any,
      { candidateId: string; templateId?: string }
    >({
      query: (body) => ({
        url: "/recruitment/onboarding",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),
    updateOnboardingTask: builder.mutation<
      any,
      { id: string; taskTitle: string; isCompleted: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/recruitment/onboarding/${id}/tasks`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Onboarding"],
    }),

    // Onboarding Templates
    getOnboardingTemplates: builder.query<any[], void>({
      query: () => "/recruitment/onboarding/templates",
      providesTags: ["OnboardingTemplate"],
    }),
    createOnboardingTemplate: builder.mutation<any, any>({
      query: (body) => ({
        url: "/recruitment/onboarding/templates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["OnboardingTemplate"],
    }),
    updateOnboardingTemplate: builder.mutation<any, { id: string } & any>({
      query: ({ id, ...body }) => ({
        url: `/recruitment/onboarding/templates/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["OnboardingTemplate"],
    }),

    // Public Career Portal
    getPublicJobs: builder.query<any[], void>({
      query: () => "/public/recruitment/jobs",
    }),
    getPublicJob: builder.query<any, string>({
      query: (id) => `/public/recruitment/jobs/${id}`,
    }),
    getPublicResumeUploadUrl: builder.mutation<
      any,
      { fileName: string; contentType: string }
    >({
      query: (body) => ({
        url: "/public/recruitment/resume-url",
        method: "POST",
        body,
      }),
    }),
    applyForJob: builder.mutation<any, { candidate: any; application: any }>({
      query: (body) => ({
        url: "/public/recruitment/apply",
        method: "POST",
        body,
      }),
    }),
    getAnalytics: builder.query<any, void>({
      query: () => "/recruitment/analytics",
      providesTags: ["Application", "Candidate", "Interview"],
    }),
  }),
  overrideExisting: false,
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
  useParseResumeMutation,
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
  useGetOnboardingTemplatesQuery,
  useCreateOnboardingTemplateMutation,
  useUpdateOnboardingTemplateMutation,
  useGetDocumentUploadUrlMutation,
  useGetPublicJobsQuery,
  useGetPublicJobQuery,
  useGetPublicResumeUploadUrlMutation,
  useApplyForJobMutation,
  useGetAnalyticsQuery,
} = recruitmentApi;
