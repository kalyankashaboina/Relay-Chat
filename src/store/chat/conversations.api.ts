import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Conversation } from "@/types/chat";

/* ===============================
   API RESPONSE TYPES
================================ */

export interface SidebarConversationsResponse {
  success: boolean;
  data: Conversation[];
  nextCursor: string | null;
  hasMore: boolean;
}

/* ===============================
   CONVERSATIONS API
================================ */

export const conversationsApi = createApi({
  reducerPath: "conversationsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include",
  }),

  tagTypes: ["Conversations"],

  endpoints: (builder) => ({
    /* ---------- Sidebar conversations ---------- */

    getSidebarConversations: builder.query<
      SidebarConversationsResponse,
      void
    >({
      query: () => "/api/conversations",
      providesTags: ["Conversations"],
    }),

    searchSidebarConversations: builder.query<
      SidebarConversationsResponse,
      { q: string }
    >({
      query: ({ q }) => `/api/conversations/search?q=${q}`,
    }),

    createConversation: builder.mutation<
      Conversation,
      { userId: string }
    >({
      query: (body) => ({
        url: "/api/conversations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conversations"],
    }),
  }),
});

export const {
  useGetSidebarConversationsQuery,
  useSearchSidebarConversationsQuery,
  useCreateConversationMutation,
} = conversationsApi;
