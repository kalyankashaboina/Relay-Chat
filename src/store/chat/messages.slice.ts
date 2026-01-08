import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type MessageStatus =
  | "pending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export interface ChatMessage {
  id: string;
  tempId?: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  status: MessageStatus;
  isDeleted?: boolean;
}

interface MessagesState {
  byConversation: Record<string, ChatMessage[]>;
}

const initialState: MessagesState = {
  byConversation: {},
};

const messagesSlice = createSlice({
  name: "messages",
  initialState,
  reducers: {
    /* =====================================================
       ADD MESSAGE (socket + api)
       ===================================================== */
    messageAdded(state, action: PayloadAction<ChatMessage>) {
      const msg = action.payload;

      if (!state.byConversation[msg.conversationId]) {
        state.byConversation[msg.conversationId] = [];
      }

      const messages = state.byConversation[msg.conversationId];

      // 🔁 1. Replace temp message if exists
      if (msg.tempId) {
        const tempIndex = messages.findIndex(
          (m) => m.tempId === msg.tempId
        );

        if (tempIndex !== -1) {
          messages[tempIndex] = {
            ...msg,
            status: "sent",
          };
          return;
        }
      }

      // 🔁 2. Deduplicate by real ID
      const exists = messages.some(
        (m) => m.id === msg.id
      );

      if (exists) return;

      messages.push(msg);
    },

    /* =====================================================
       MESSAGE SENT (server ACK)
       ===================================================== */
    messageSent(
      state,
      action: PayloadAction<{
        tempId: string;
        messageId: string;
        conversationId: string;
        createdAt: string;
      }>
    ) {
      const {
        tempId,
        messageId,
        conversationId,
        createdAt,
      } = action.payload;

      const messages = state.byConversation[conversationId];
      if (!messages) return;

      const msg = messages.find(
        (m) => m.tempId === tempId
      );
      if (!msg) return;

      msg.id = messageId;
      msg.status = "sent";
      msg.createdAt = createdAt;
      delete msg.tempId;
    },

    /* =====================================================
       DELIVERED
       ===================================================== */
    messageDelivered(
      state,
      action: PayloadAction<{
        messageId: string;
        conversationId: string;
      }>
    ) {
      const { messageId, conversationId } =
        action.payload;

      const msg = state.byConversation[
        conversationId
      ]?.find((m) => m.id === messageId);

      if (msg) {
        msg.status = "delivered";
      }
    },

    /* =====================================================
       READ
       ===================================================== */
    messageRead(
      state,
      action: PayloadAction<{
        messageIds: string[];
        conversationId: string;
      }>
    ) {
      const { messageIds, conversationId } =
        action.payload;

      const messages =
        state.byConversation[conversationId];
      if (!messages) return;

      messages.forEach((m) => {
        if (messageIds.includes(m.id)) {
          m.status = "read";
        }
      });
    },

    /* =====================================================
       DELETE
       ===================================================== */
    messageDeleted(
      state,
      action: PayloadAction<{
        messageId: string;
        conversationId: string;
      }>
    ) {
      const { messageId, conversationId } =
        action.payload;

      const msg = state.byConversation[
        conversationId
      ]?.find((m) => m.id === messageId);

      if (msg) {
        msg.isDeleted = true;
        msg.content = "";
      }
    },

    resetMessages() {
      return initialState;
    },
  },
});

export const {
  messageAdded,
  messageSent,
  messageDelivered,
  messageRead,
  messageDeleted,
  resetMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;
