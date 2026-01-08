import type { Socket } from "socket.io-client";
import type { AppDispatch } from "@/store";

/* =========================
   PRESENCE
========================= */

import {
  setOnlineUsers,
  userOnline,
  userOffline,
} from "@/store/chat/presence.slice";

/* =========================
   MESSAGES
========================= */

import {
  messageAdded,
  messageSent,
  messageDelivered,
  messageRead,
  messageDeleted,
} from "@/store/chat/messages.slice";

/* =========================
   TYPING
========================= */

import {
  typingStarted,
  typingStopped,
} from "@/store/chat/typing.slice";

/* =========================
   CALLS
========================= */

import {
  callIncoming,
  callEnded,
} from "@/store/chat/calls.slice";

export function registerSocketListeners(
  socket: Socket,
  dispatch: AppDispatch
) {
  console.log("[FE][SOCKET] registering listeners on socket", socket.id);

  // 🔑 VERY IMPORTANT: avoid duplicate handlers on reconnect
  socket.removeAllListeners();

  /* =========================
     PRESENCE
  ========================= */

  socket.on("presence:init", ({ onlineUsers }) => {
    console.log("[FE][presence:init]", onlineUsers);
    dispatch(setOnlineUsers(onlineUsers));
  });

  socket.on("user:online", ({ userId }) => {
    console.log("[FE][user:online]", userId);
    dispatch(userOnline(userId));
  });

  socket.on("user:offline", ({ userId }) => {
    console.log("[FE][user:offline]", userId);
    dispatch(userOffline(userId));
  });

  /* =========================
     MESSAGES
  ========================= */

  socket.on("message:new", payload => {
    console.log("[FE][message:new]", payload);

    dispatch(
      messageAdded({
        id: payload.id,
        tempId: payload.tempId, // may be undefined for receivers
        conversationId: payload.conversationId,
        senderId: payload.senderId,
        content: payload.content,
        createdAt: payload.createdAt,
        status: "sent",
      })
    );
  });

  socket.on("message:sent", payload => {
    console.log("[FE][message:sent]", payload);
    dispatch(messageSent(payload));
  });

  socket.on("message:delivered", payload => {
    console.log("[FE][message:delivered]", payload);
    dispatch(messageDelivered(payload));
  });

  socket.on("message:read", payload => {
    console.log("[FE][message:read]", payload);
    dispatch(messageRead(payload));
  });

  socket.on("message:deleted", payload => {
    console.log("[FE][message:deleted]", payload);
    dispatch(messageDeleted(payload));
  });

  /* =========================
     TYPING
  ========================= */

  socket.on("typing:start", payload => {
    console.log("[FE][typing:start]", payload);

    dispatch(
      typingStarted({
        conversationId: payload.conversationId,
        userId: payload.userName, // backend sends userName
      })
    );
  });

  socket.on("typing:stop", payload => {
    console.log("[FE][typing:stop]", payload);

    dispatch(
      typingStopped({
        conversationId: payload.conversationId,
        userId: payload.userName,
      })
    );
  });

  /* =========================
     CALLS
  ========================= */

  socket.on("call:incoming", payload => {
    console.log("[FE][call:incoming]", payload);
    dispatch(callIncoming(payload));
  });

  socket.on("call:ended", payload => {
    console.log("[FE][call:ended]", payload);
    dispatch(callEnded());
  });

  /* =========================
     DISCONNECT
  ========================= */

  socket.on("disconnect", reason => {
    console.warn("[FE][SOCKET] disconnected:", reason);
  });
}
