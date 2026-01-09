import type { User } from '@/types/chat';
import { rtkApi } from '../api';

export interface PaginatedUsersResponse {
  data: User[];
  nextCursor: string | null;
  hasMore: boolean;
}

/* ===============================
   QUERY ARG TYPES
================================ */

export interface GetUsersArgs {
  q?: string; // search (optional)
  cursor?: string; // pagination cursor
  limit?: number; // page size
}

/* ===============================
   USERS API (SINGLE ENDPOINT)
================================ */

export const usersApi = rtkApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET /api/users
     * - list users
     * - search via `q`
     * - cursor pagination
     */
    getUsers: builder.query<PaginatedUsersResponse, GetUsersArgs>({
      query: ({ q = '', cursor, limit = 20 }) => ({
        url: '/api/users',
        params: {
          q,
          cursor,
          limit,
        },
      }),
      providesTags: ['Users'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUsersQuery } = usersApi;
