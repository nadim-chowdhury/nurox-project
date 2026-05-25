import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "@/lib/api-client";

export interface ChatChannel {
  id: string;
  name: string | null;
  type: "DIRECT" | "GROUP";
  participants: string[];
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  mentions: string[];
  createdAt: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export const chatApi = createApi({
  reducerPath: "chatApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Channel", "Message"],
  endpoints: (builder) => ({
    getChannels: builder.query<ChatChannel[], void>({
      query: () => "/chat/channels",
      providesTags: ["Channel"],
    }),
    getMessages: builder.query<ChatMessage[], string>({
      query: (channelId) => `/chat/channels/${channelId}/messages`,
      providesTags: (result, error, id) => [{ type: "Message", id }],
    }),
    createChannel: builder.mutation<ChatChannel, Partial<ChatChannel>>({
      query: (body) => ({
        url: "/chat/channels",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Channel"],
    }),
  }),
});

export const {
  useGetChannelsQuery,
  useGetMessagesQuery,
  useCreateChannelMutation,
} = chatApi;
