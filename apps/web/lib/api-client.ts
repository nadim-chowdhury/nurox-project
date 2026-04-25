import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";
import { setAccessToken, clearAuth } from "@/store/slices/authSlice";
import { notification } from "antd";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/**
 * Base fetch configured with:
 * - Credentials: include (sends httpOnly cookies for refresh)
 * - Authorization header from Redux auth state
 * - x-tenant-id header from cookie
 */
const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    // 1. Set Authorization Header
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // 2. Set Tenant ID Header
    // Read from cookie (set by middleware)
    if (typeof document !== 'undefined') {
      const tenantId = document.cookie
        .split('; ')
        .find(row => row.startsWith('nurox_tenant_id='))
        ?.split('=')[1];
      
      if (tenantId) {
        headers.set("x-tenant-id", tenantId);
      }
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

  if (result.error) {
    if (result.error.status === 401) {
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
    } else if (result.error.status === 429) {
      const retryAfterStr = result.meta?.response?.headers.get("retry-after");
      const retryAfter = retryAfterStr ? parseInt(retryAfterStr, 10) : 60;
      
      notification.error({
        message: "Rate Limit Exceeded",
        description: `Too many requests. Please try again in ${retryAfter} seconds.`,
        key: "rate-limit-warning",
        duration: 5,
      });
    } else if (result.error.status === 503) {
      const data = result.error.data as any;
      notification.warning({
        message: "System Maintenance",
        description: data?.message || "The system is currently undergoing maintenance. Please try again later.",
        duration: 0, // Persistent
        key: "maintenance-warning",
      });
    }
  }

  return result;
};
