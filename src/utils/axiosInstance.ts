import axios from "axios";
import { store } from "@/store";
import { logoutSuccess } from "@/store/auth/auth.slice";
import { disconnectSocket } from "@/socket/socket";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   RESPONSE INTERCEPTOR
========================= */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Session expired / invalid
    if (status === 401 || status === 403) {
      // Hard logout
      disconnectSocket();
      store.dispatch(logoutSuccess());
    }

    return Promise.reject(error);
  }
);

export default api;
