import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query/react';

import authReducer from './auth/auth.slice';
import uiReducer from './ui/ui.slice';

import presenceReducer from './chat/presence.slice';
import typingReducer from './chat/typing.slice';
import callsReducer from './chat/calls.slice';
import messagesReducer from './chat/messages.slice';
import { rtkApi } from './api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,

    messages: messagesReducer,
    presence: presenceReducer,
    typing: typingReducer,
    calls: callsReducer,

    /* ---------- RTK Query (SINGLE) ---------- */
    [rtkApi.reducerPath]: rtkApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(rtkApi.middleware),

  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
