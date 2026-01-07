
import { AppDispatch } from "../index";
import {
  authStart,
  authSuccess,
  authFailure,
  logoutSuccess,
} from "./auth.slice";
import { connectSocket, disconnectSocket } from "@/socket/socket";
import type { AuthUser } from "./auth.slice";
import api from "@/utils/axiosInstance";

/* =========================
   CHECK AUTH (REFRESH)
========================= */

export const checkAuth = () => async (dispatch: AppDispatch) => {
  dispatch(authStart());

  try {
    const { data } = await api.get<AuthUser>("/api/auth/me");
    dispatch(authSuccess(data));
    connectSocket();
  } catch {
    dispatch(authFailure(undefined));
  }
};

/* =========================
   LOGIN
========================= */

export const loginUser =
  (email: string, password: string) =>
  async (dispatch: AppDispatch) => {
    dispatch(authStart());

    try {
      const { data } = await api.post<AuthUser>("/api/auth/login", {
        email,
        password,
      });

      dispatch(authSuccess(data));
      connectSocket();
    } catch (err: any) {
      dispatch(authFailure(err?.response?.data?.message));
      throw err;
    }
  };

/* =========================
   REGISTER
========================= */

export const registerUser =
  (name: string, email: string, password: string) =>
  async (dispatch: AppDispatch) => {
    dispatch(authStart());

    try {
      const { data } = await api.post<AuthUser>("/api/auth/register", {
        name,
        email,
        password,
      });

      dispatch(authSuccess(data));
      connectSocket();
    } catch (err: any) {
      dispatch(authFailure(err?.response?.data?.message));
      throw err;
    }
  };

/* =========================
   LOGOUT
========================= */

export const logout = () => async (dispatch: AppDispatch) => {
  try {
    await api.post("/api/logout");
  } finally {
    disconnectSocket();
    dispatch(logoutSuccess());
  }
};
