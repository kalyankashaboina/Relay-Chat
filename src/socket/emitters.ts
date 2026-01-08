import { getSocket } from './socket';

/* =========================
   MESSAGES
========================= */

export function emitSendMessage(payload: {
  conversationId: string;
  content: string;
  tempId: string;
}) {
  const socket = getSocket();
  if (!socket) {
    console.warn('[SOCKET][emit] message:send → no socket');
    return;
  }

  console.log('[SOCKET][emit] message:send', payload);
  socket.emit('message:send', payload);
}

export function emitDeleteMessage(messageId: string) {
  const socket = getSocket();
  if (!socket) {
    console.warn('[SOCKET][emit] message:delete → no socket');
    return;
  }

  console.log('[SOCKET][emit] message:delete', { messageId });
  socket.emit('message:delete', { messageId });
}

/* =========================
   TYPING
========================= */

export function emitTypingStart(conversationId: string) {
  const socket = getSocket();
  if (!socket) {
    console.warn('[SOCKET][emit] typing:start → no socket');
    return;
  }

  console.log('[SOCKET][emit] typing:start', { conversationId });
  socket.emit('typing:start', { conversationId });
}

export function emitTypingStop(conversationId: string) {
  const socket = getSocket();
  if (!socket) {
    console.warn('[SOCKET][emit] typing:stop → no socket');
    return;
  }

  console.log('[SOCKET][emit] typing:stop', { conversationId });
  socket.emit('typing:stop', { conversationId });
}

/* =========================
   READ RECEIPTS
========================= */

export function emitConversationRead(conversationId: string) {
  const socket = getSocket();
  if (!socket) {
    console.warn('[SOCKET][emit] conversation:read → no socket');
    return;
  }

  console.log('[SOCKET][emit] conversation:read', { conversationId });
  socket.emit('conversation:read', { conversationId });
}

/* =========================
   CALLS
========================= */

export function emitCallInitiate(payload: { toUserId: string; type: 'audio' | 'video' }) {
  const socket = getSocket();
  if (!socket) {
    console.warn('[SOCKET][emit] call:initiate → no socket');
    return;
  }

  console.log('[SOCKET][emit] call:initiate', payload);
  socket.emit('call:initiate', payload);
}

/* =========================
   CONVERSATIONS
========================= */

export function emitJoinConversation(conversationId: string) {
  const socket = getSocket();
  if (!socket) {
    console.warn('[SOCKET][emit] conversation:join → no socket');
    return;
  }

  console.log('[SOCKET][emit] conversation:join', { conversationId });
  socket.emit('conversation:join', { conversationId });
}
