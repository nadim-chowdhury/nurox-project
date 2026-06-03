import { baseApi } from "./baseApi";

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Tickets
    getTickets: builder.query<
      any[],
      { status?: string; requesterId?: string } | void
    >({
      query: (params) => ({
        url: "/support/tickets",
        params: params || {},
      }),
      providesTags: ["Ticket"],
    }),
    getTicket: builder.query<any, string>({
      query: (id) => `/support/tickets/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Ticket", id }],
    }),
    createTicket: builder.mutation<any, any>({
      query: (body) => ({
        url: "/support/tickets",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Ticket"],
    }),
    addTicketMessage: builder.mutation<
      any,
      { id: string; content: string; isInternal?: boolean }
    >({
      query: ({ id, ...body }) => ({
        url: `/support/tickets/${id}/messages`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Ticket", id }],
    }),
    resolveTicket: builder.mutation<any, string>({
      query: (id) => ({
        url: `/support/tickets/${id}/resolve`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Ticket", id }],
    }),
    analyzeTicket: builder.mutation<any, string>({
      query: (id) => ({
        url: `/support/tickets/${id}/analyze`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [{ type: "Ticket", id }],
    }),
    getSuggestedReply: builder.query<{ reply: string }, string>({
      query: (id) => `/support/tickets/${id}/suggested-reply`,
    }),

    // Knowledge Base
    getKbArticles: builder.query<any[], { q?: string } | void>({
      query: (params) => ({
        url: "/support/kb/search",
        params: params || {},
      }),
      providesTags: ["KnowledgeBase"],
    }),
    createKbArticle: builder.mutation<any, any>({
      query: (body) => ({
        url: "/support/kb",
        method: "POST",
        body,
      }),
      invalidatesTags: ["KnowledgeBase"],
    }),
    publishKbArticle: builder.mutation<any, string>({
      query: (id) => ({
        url: `/support/kb/${id}/publish`,
        method: "POST",
      }),
      invalidatesTags: ["KnowledgeBase"],
    }),

    // Gap Analysis
    analyzeKbGaps: builder.mutation<
      { suggestions: any[]; message?: string; error?: string },
      void
    >({
      query: () => ({
        url: "/support/kb/gap-analysis",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useAddTicketMessageMutation,
  useResolveTicketMutation,
  useAnalyzeTicketMutation,
  useGetSuggestedReplyQuery,
  useGetKbArticlesQuery,
  useCreateKbArticleMutation,
  usePublishKbArticleMutation,
  useAnalyzeKbGapsMutation,
} = supportApi;
