import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";
import type { 
  UserResponseDto, 
  InviteUserDto, 
  UpdateUserDto, 
  UserListQueryDto 
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

export const usersApi = createApi({
  reducerPath: "usersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Users"],
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
                type: "Users" as const,
                id,
              })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }],
    }),

    getUser: builder.query<UserResponseDto, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Users", id }],
    }),

    getProfile: builder.query<UserResponseDto, void>({
      query: () => "/users/profile",
      providesTags: ["Users"],
    }),

    inviteUser: builder.mutation<UserResponseDto, InviteUserDto>({
      query: (body) => ({
        url: "/users/invite",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
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
        { type: "Users", id },
        { type: "Users", id: "LIST" },
      ],
    }),

    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    bulkCreateUsers: builder.mutation<UserResponseDto[], any[]>({
      query: (body) => ({
        url: "/users/bulk",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Users", id: "LIST" }],
    }),

    getAvatarUploadUrl: builder.query<{ uploadUrl: string; key: string }, string>({
      query: (contentType) => ({
        url: "/users/avatar-upload-url",
        params: { contentType },
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserQuery,
  useGetProfileQuery,
  useInviteUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkCreateUsersMutation,
  useLazyGetAvatarUploadUrlQuery,
} = usersApi;
