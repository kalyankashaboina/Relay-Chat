import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';

import { authService } from '@/features/auth/authService';
import type { AuthUser, Language } from '@/features/chat/types';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  language: Language;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isInitialized: false,
  language: 'en',
};

// Validates cookie on app mount
export const initAuth = createAsyncThunk('auth/init', async () => authService.getMe());

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await authService.login(email, password);
    } catch (err: unknown) {
      return rejectWithValue(authService.extractErrorMessage(err));
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    { name, email, password }: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      return await authService.register(name, email, password);
    } catch (err: unknown) {
      return rejectWithValue(authService.extractErrorMessage(err));
    }
  }
);

export const forgotPasswordAction = createAsyncThunk(
  'auth/forgotPassword',
  async ({ email }: { email: string }, { rejectWithValue }) => {
    try {
      await authService.forgotPassword(email);
      return true;
    } catch (err: unknown) {
      return rejectWithValue(authService.extractErrorMessage(err));
    }
  }
);

export const logoutUserAsync = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isInitialized = true;
    },
    clearUser(state) {
      state.user = null;
    },
    setLanguage(state, action: PayloadAction<Language>) {
      state.language = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload;
      })
      .addCase(initAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPasswordAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPasswordAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(forgotPasswordAction.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(logoutUserAsync.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const {
  setUser,
  clearUser,
  setLanguage,
  logoutUser: _logoutUser,
} = {
  ...authSlice.actions,
  logoutUser: authSlice.actions.clearUser,
};
export const logoutUser = authSlice.actions.clearUser;
export default authSlice.reducer;

export const selectAuth = (s: { auth: AuthState }) => s.auth;
export const selectUser = (s: { auth: AuthState }) => s.auth.user;
export const selectIsAuthenticated = (s: { auth: AuthState }) => !!s.auth.user;
export const selectAuthLoading = (s: { auth: AuthState }) => s.auth.isLoading;
export const selectAuthLanguage = (s: { auth: AuthState }) => s.auth.language;
export const selectIsInitialized = (s: { auth: AuthState }) => s.auth.isInitialized;
