import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { Message } from "@/types/chat";

export interface MessagesResponse {
  success: boolean;
  data: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const messagesApi = createApi({
  reducerPath: "messagesApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include",
  }),

  tagTypes: ["Messages"],

  endpoints: (builder) => ({
    /* ---------- Get messages for a conversation ---------- */

    getConversationMessages: builder.query<
      MessagesResponse,
      { conversationId: string; cursor?: string }
    >({
      query: ({ conversationId, cursor }) => ({
        url: `/api/conversations/${conversationId}/messages`,
        params: cursor ? { cursor } : undefined,
      }),

      providesTags: (result, _err, { conversationId }) =>
        result
          ? [
              ...result.data.map((m) => ({
                type: "Messages" as const,
                id: m.id,
              })),
              { type: "Messages", id: conversationId },
            ]
          : [{ type: "Messages", id: conversationId }],
    }),
  }),
});

export const {
  useGetConversationMessagesQuery,
  useLazyGetConversationMessagesQuery,
} = messagesApi;
