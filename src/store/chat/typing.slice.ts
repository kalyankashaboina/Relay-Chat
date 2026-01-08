import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TypingState {
  byConversation: Record<string, string[]>; // conversationId → userIds[]
}

const initialState: TypingState = {
  byConversation: {},
};

const typingSlice = createSlice({
  name: 'typing',
  initialState,
  reducers: {
    typingStarted(state, action: PayloadAction<{ conversationId: string; userId: string }>) {
      const { conversationId, userId } = action.payload;

      if (!state.byConversation[conversationId]) {
        state.byConversation[conversationId] = [];
      }

      if (!state.byConversation[conversationId].includes(userId)) {
        state.byConversation[conversationId].push(userId);
      }
    },

    typingStopped(state, action: PayloadAction<{ conversationId: string; userId: string }>) {
      const { conversationId, userId } = action.payload;
      const users = state.byConversation[conversationId];
      if (!users) return;

      state.byConversation[conversationId] = users.filter((id) => id !== userId);
    },

    clearTypingForConversation(state, action: PayloadAction<{ conversationId: string }>) {
      delete state.byConversation[action.payload.conversationId];
    },

    resetTyping() {
      return initialState;
    },
  },
});

export const { typingStarted, typingStopped, clearTypingForConversation, resetTyping } =
  typingSlice.actions;

export default typingSlice.reducer;
