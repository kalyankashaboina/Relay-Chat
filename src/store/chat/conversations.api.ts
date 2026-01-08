import { api } from '@/store/api';
import type { Conversation } from '@/types/chat';

/* ===============================
   API RESPONSE TYPES
================================ */

export interface SidebarConversationsResponse {
  success: boolean;
  data: Conversation[];
  nextCursor: string | null;
  hasMore: boolean;
}

interface CreateGroupPayload {
  name: string;
  memberIds: string[];
}

/* ===============================
   CONVERSATIONS API
================================ */

export const conversationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /* ---------- Sidebar conversations ---------- */
    getSidebarConversations: builder.query<SidebarConversationsResponse, void>({
      query: () => '/api/conversations',
      providesTags: ['Conversations'],
    }),

    /* ---------- Sidebar search (SERVER-SIDE) ---------- */
    searchSidebarConversations: builder.query<SidebarConversationsResponse, { q: string }>({
      query: ({ q }) => `/api/conversations/search?q=${q}`,
      providesTags: ['Conversations'], // ✅ IMPORTANT FIX
    }),

    /* ---------- Direct chat (get-or-create DM) ---------- */
    createConversation: builder.mutation<
      { success: boolean; data: Conversation },
      { userId: string }
    >({
      query: (body) => ({
        url: '/api/conversations',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Conversations'],
    }),

    /* ---------- Group chat (OPTIMISTIC UI) ---------- */
    createGroupConversation: builder.mutation<
      { success: boolean; data: Conversation },
      CreateGroupPayload
    >({
      query: (body) => ({
        url: '/api/conversations/group',
        method: 'POST',
        body,
      }),

      async onQueryStarted({ name, memberIds }, { dispatch, queryFulfilled, getState }) {
        const state = getState() as any;
        const currentUser = state.auth.user;

        if (!currentUser) return;

        const tempId = `temp-group-${Date.now()}`;

        /* ---------- OPTIMISTIC CONVERSATION ---------- */
        const optimisticConversation: Conversation = {
          id: tempId,
          isGroup: true,
          groupName: name,

          users: [
            {
              id: currentUser.id,
              username: currentUser.username,
              email: currentUser.email ?? 'pending@local',
              avatar: currentUser.avatar ?? '',
              isOnline: true,
            },
            ...memberIds.map((id) => ({
              id,
              username: 'Loading...',
              email: 'pending@local',
              avatar: '',
              isOnline: false,
            })),
          ],

          unreadCount: 0,
          lastMessage: null,
          updatedAt: new Date().toISOString(),
        };

        /* ---------- INSERT IMMEDIATELY ---------- */
        const patchResult = dispatch(
          conversationsApi.util.updateQueryData('getSidebarConversations', undefined, (draft) => {
            draft.data.unshift(optimisticConversation);
          }),
        );

        try {
          const { data } = await queryFulfilled;

          /* ---------- REPLACE TEMP WITH SERVER DATA ---------- */
          dispatch(
            conversationsApi.util.updateQueryData('getSidebarConversations', undefined, (draft) => {
              const index = draft.data.findIndex((c) => c.id === tempId);
              if (index !== -1) {
                draft.data[index] = data.data;
              }
            }),
          );
        } catch {
          /* ---------- ROLLBACK ---------- */
          patchResult.undo();
        }
      },

      invalidatesTags: ['Conversations'],
    }),
  }),

  overrideExisting: false,
});

/* ===============================
   EXPORT HOOKS
================================ */

export const {
  useGetSidebarConversationsQuery,
  useSearchSidebarConversationsQuery,
  useCreateConversationMutation,
  useCreateGroupConversationMutation,
} = conversationsApi;
