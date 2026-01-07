import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface Conversation {
  id: string;
  isGroup: boolean;
  name?: string;
  participants: string[];
  lastMessage?: {
    id: string;
    content: string;
    createdAt: string;
  };
}

export const conversationsApi = createApi({
  reducerPath: "conversationsApi",

  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: "include", // REQUIRED for cookies
  }),

  tagTypes: ["Conversation"],

  endpoints: (builder) => ({
    getConversations: builder.query<Conversation[], void>({
      query: () => "/api/conversations",
      providesTags: ["Conversation"],
    }),
  }),
});

export const {
  useGetConversationsQuery,
} = conversationsApi;
