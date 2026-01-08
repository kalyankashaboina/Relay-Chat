import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl:import.meta.env.VITE_API_BASE_URL,          // matches your Express app.use("/api")
    credentials: "include",   // 🔑 REQUIRED for cookie auth
  }),
  tagTypes: ["Users", "Conversations", "Messages"],
  endpoints: () => ({}),
});
