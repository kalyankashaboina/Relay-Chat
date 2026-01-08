import { api } from '@/store/api';
import type { Message } from '@/types/chat';

/* ===============================
   API RESPONSE TYPES
================================ */

export interface MessagesResponse {
  success: boolean;
  data: Message[];
  nextCursor: string | null;
  hasMore: boolean;
}

/* ===============================
   MESSAGES API
================================ */

export const messagesApi = api.injectEndpoints({
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
                type: 'Messages' as const,
                id: m.id,
              })),
              { type: 'Messages', id: conversationId },
            ]
          : [{ type: 'Messages', id: conversationId }],
    }),
  }),
  overrideExisting: false,
});

export const { useGetConversationMessagesQuery, useLazyGetConversationMessagesQuery } = messagesApi;
