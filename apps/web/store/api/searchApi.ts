import { baseApi } from "./baseApi";

export interface SearchResult {
  indexUid: string;
  hits: any[];
  totalHits: number;
  processingTimeMs: number;
  limit: number;
  offset: number;
  estimatedTotalHits: number;
}

export interface MultiSearchResponse {
  results: SearchResult[];
  searchId?: string;
}

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    globalSearch: builder.query<MultiSearchResponse, string>({
      query: (q) => ({
        url: `/search/global`,
        params: { q },
      }),
    }),
    trackClick: builder.mutation<void, { queryId: string; entityId: string }>({
      query: ({ queryId, entityId }) => ({
        url: `/search/click/${queryId}`,
        method: "POST",
        params: { entityId },
      }),
    }),
  }),
});

export const { useLazyGlobalSearchQuery, useTrackClickMutation } = searchApi;
