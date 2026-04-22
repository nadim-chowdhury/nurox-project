import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";
import { setAccessToken, clearAuth } from "@/store/slices/authSlice";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/**
 * Base fetch configured with:
 * - Credentials: include (sends httpOnly cookies for refresh)
 * - Authorization header from Redux auth state
 */
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Wrapper that intercepts 401s and attempts a silent token refresh
 * using the httpOnly refresh cookie.
 *
 * Flow:
 * 1. Request fails with 401
 * 2. Call POST /auth/refresh (cookie sent automatically)
 * 3. If refresh succeeds → update access token → retry original request
 * 4. If refresh fails → clear auth → redirect to login
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Attempt silent refresh
    const refreshResult = await baseQuery(
      { url: "/auth/refresh", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const data = refreshResult.data as {
        accessToken: string;
        expiresIn: number;
      };
      // Store new access token
      api.dispatch(setAccessToken(data.accessToken));
      // Retry original request with new token
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Refresh failed — clear auth state
      api.dispatch(clearAuth());
    }
  }

  return result;
};
