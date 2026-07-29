import { baseApi } from "./baseApi";
import { setCredentials, clearAuth, setUser } from "@/store/slices/authSlice";
import type { AuthUser } from "@/store/slices/authSlice";
import type {
  UserSessionDto,
  RoleDto,
  CreateRoleDto,
  MagicLinkLoginDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from "@repo/shared-schemas";

export interface AuthResponse {
  user: AuthUser & {
    isTwoFactorEnabled: boolean;
    forcePasswordChange?: boolean;
  };
  tokens: {
    accessToken: string;
    expiresIn: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  token?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response?.data || response,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const authData = (data as any).data || data;
          if (typeof document !== "undefined") {
            document.cookie = `nurox_refresh_token=true; path=/; max-age=604800; SameSite=Lax`;
          }
          dispatch(
            setCredentials({
              user: authData.user,
              accessToken: authData.tokens.accessToken,
            }),
          );
        } catch {
          // Error handled by component
        }
      },
    }),

    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      transformResponse: (response: any) => response?.data || response,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const authData = (data as any).data || data;
          if (typeof document !== "undefined") {
            document.cookie = `nurox_refresh_token=true; path=/; max-age=604800; SameSite=Lax`;
          }
          dispatch(
            setCredentials({
              user: authData.user,
              accessToken: authData.tokens.accessToken,
            }),
          );
        } catch {
          // Error handled by component
        }
      },
    }),

    changePassword: builder.mutation<{ message: string }, ChangePasswordDto>({
      query: (body) => ({
        url: "/auth/change-password",
        method: "POST",
        body,
      }),
    }),

    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          if (typeof document !== "undefined") {
            document.cookie = `nurox_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
          }
          dispatch(clearAuth());
        }
      },
    }),

    getMe: builder.query<AuthUser, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
      transformResponse: (response: any) => response?.data || response,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const userData = (data as any).data || data;
          dispatch(setUser(userData));
        } catch {
          // Error handled by component
        }
      },
    }),

    getSessions: builder.query<UserSessionDto[], void>({
      query: () => "/auth/sessions",
      providesTags: ["User"],
    }),

    getLoginHistory: builder.query<any[], void>({
      query: () => "/auth/login-history",
      providesTags: ["User"],
    }),

    revokeSession: builder.mutation<{ message: string }, string>({
      query: (sessionId) => ({
        url: `/auth/sessions/${sessionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    getRoles: builder.query<RoleDto[], void>({
      query: () => "/roles",
      providesTags: ["Role"],
    }),

    createRole: builder.mutation<RoleDto, CreateRoleDto>({
      query: (body) => ({
        url: "/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Role"],
    }),

    magicLinkLogin: builder.mutation<AuthResponse, MagicLinkLoginDto>({
      query: (body) => ({
        url: "/auth/magic-link/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              user: data.user,
              accessToken: data.tokens.accessToken,
            }),
          );
        } catch {
          // Error handled by component
        }
      },
    }),

    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),

    resetPassword: builder.mutation<{ message: string }, ResetPasswordDto>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),

    setup2FA: builder.mutation<{ qrCodeDataURL: string; secret: string }, void>(
      {
        query: () => "/auth/2fa/setup",
      },
    ),

    enable2FA: builder.mutation<{ backupCodes: string[] }, { token: string }>({
      query: (body) => ({
        url: "/auth/2fa/enable",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useGetMeQuery,
  useGetLoginHistoryQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useGetRolesQuery,
  useCreateRoleMutation,
  useMagicLinkLoginMutation,
  useSetup2FAMutation,
  useEnable2FAMutation,
} = authApi;
