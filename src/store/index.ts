import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query/react";

import authReducer from "./auth/auth.slice";
import { conversationsApi } from "./chat/conversations.api";

export const store = configureStore({
  reducer: {
    auth: authReducer,
      // messages: messagesReducer,
    // presence: presenceReducer,
    // typing: typingReducer,
    // calls: callsReducer,

    // RTK Query reducer
    [conversationsApi.reducerPath]: conversationsApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(conversationsApi.middleware),

  devTools: import.meta.env.DEV,
});

// Enable refetchOnFocus / refetchOnReconnect
setupListeners(store.dispatch);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
