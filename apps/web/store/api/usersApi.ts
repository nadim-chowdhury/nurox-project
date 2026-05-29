import { baseApi } from "./baseApi";
import type {
  UserResponseDto,
  InviteUserDto,
  UpdateUserDto,
  UserListQueryDto,
} from "@repo/shared-schemas";

export interface PaginatedUsersResponse {
  data: UserResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedUsersResponse, UserListQueryDto>({
      query: (params) => ({
        url: "/users",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: "User" as const,
                id,
              })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    getUser: builder.query<UserResponseDto, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    getProfile: builder.query<UserResponseDto, void>({
      query: () => "/users/profile",
      providesTags: ["User"],
    }),

    getPreferences: builder.query<Record<string, any>, void>({
      query: () => "/users/preferences",
      providesTags: ["Preference"],
    }),

    getDashboardWidgets: builder.query<any[], void>({
      query: () => "/users/dashboard-widgets",
      providesTags: ["DashboardWidget"],
    }),

    saveDashboardWidgets: builder.mutation<void, any[]>({
      query: (widgets) => ({
        url: "/users/dashboard-widgets",
        method: "POST",
        body: { widgets },
      }),
      invalidatesTags: ["DashboardWidget"],
    }),

    setPreference: builder.mutation<void, { key: string; value: any }>({
      query: ({ key, value }) => ({
        url: `/users/preferences/${key}`,
        method: "PATCH",
        body: { value },
      }),
      invalidatesTags: ["Preference"],
    }),

    inviteUser: builder.mutation<UserResponseDto, InviteUserDto>({
      query: (body) => ({
        url: "/users/invite",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    updateUser: builder.mutation<
      UserResponseDto,
      { id: string; data: UpdateUserDto }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    bulkCreateUsers: builder.mutation<UserResponseDto[], any[]>({
      query: (body) => ({
        url: "/users/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    getAvatarUploadUrl: builder.query<
      { uploadUrl: string; key: string },
      string
    >({
      query: (contentType) => ({
        url: "/users/avatar-upload-url",
        params: { contentType },
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useGetProfileQuery,
  useGetPreferencesQuery,
  useGetDashboardWidgetsQuery,
  useSaveDashboardWidgetsMutation,
  useSetPreferenceMutation,
  useInviteUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkCreateUsersMutation,
  useLazyGetAvatarUploadUrlQuery,
} = usersApi;
