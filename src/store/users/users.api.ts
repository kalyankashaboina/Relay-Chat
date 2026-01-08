import { api } from "@/store/api";
import type { User } from "@/types/chat";

interface UsersResponse {
  data: User[];
}

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], void>({
      query: () => "/api/users",
      transformResponse: (response: UsersResponse) => response.data,
      providesTags: ["Users"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetUsersQuery } = usersApi;
