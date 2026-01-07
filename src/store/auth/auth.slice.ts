import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export type AuthStatus =
  | "idle"
  | "loading"
  | "authenticated"
  | "unauthenticated";

interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart(state) {
      state.status = "loading";
      state.error = null;
    },

    authSuccess(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = "authenticated";
      state.error = null;
    },

    authFailure(state, action: PayloadAction<string | undefined>) {
      state.user = null;
      state.status = "unauthenticated";
      state.error = action.payload ?? null;
    },

    logoutSuccess(state) {
      state.user = null;
      state.status = "unauthenticated";
      state.error = null;
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  logoutSuccess,
} = authSlice.actions;

export default authSlice.reducer;
