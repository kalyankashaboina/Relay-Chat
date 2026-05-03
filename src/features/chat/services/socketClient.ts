import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '@/config';
import { apiClient } from '@/shared/api/client';

// ── Re-export event types so existing useSocket.ts imports still work ────────

export type SocketEventType =
  | 'message:received'
  | 'message:status'
  | 'message:new'
  | 'message:sent'
  | 'message:confirmed'
  | 'message:delivered'
  | 'message:read'
  | 'message:deleted'
  | 'message:edited'
  | 'message:failed'
  | 'typing:start'
  | 'typing:stop'
  | 'user:online'
  | 'user:offline'
  | 'reaction:added'
  | 'reaction:removed'
  | 'read:receipt'
  | 'connection:status'
  | 'presence:init'
  | 'conversation:new'
  | 'call:incoming'
  | 'call:accepted'
  | 'call:rejected'
  | 'call:ended'
  | 'call:busy'
  | 'webrtc:offer'
  | 'webrtc:answer'
  | 'webrtc:ice';

export interface SocketEvent<T = unknown> {
  type: SocketEventType;
  payload: T;
  timestamp: Date;
}

export interface MessageReceivedPayload {
  conversationId: string;
  message: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
  };
}

export interface MessageStatusPayload {
  messageId: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface TypingPayload {
  conversationId: string;
  userId?: string;
  userName: string;
}

export interface UserPresencePayload {
  userId: string;
  userName?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ReadReceiptPayload {
  conversationId: string;
  messageId: string;
  userId: string;
  userName: string;
  readAt: Date;
}

export interface ReactionPayload {
  conversationId: string;
  messageId: string;
  userId: string;
  userName: string;
  emoji: string;
}

export interface ConnectionStatusPayload {
  connected: boolean;
  latency?: number;
}

// ── Socket singleton ──────────────────────────────────────────────────────────

class RealSocket {
  private socket: Socket | null = null;
  private _connected = false;
  private connectionListeners: ((connected: boolean) => void)[] = [];

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected, skipping connect()');
      return;
    }

    console.log('[Socket] Starting connection sequence...');
    console.log('[Socket] SOCKET_URL =', SOCKET_URL);

    let token: string | undefined;
    try {
      console.log('[Socket] Fetching socket token from /auth/socket-token...');
      const { data } = await apiClient.get<{ success: boolean; token: string }>(
        '/auth/socket-token'
      );
      token = data.token;
      console.log('[Socket] ✅ Socket token acquired');
    } catch (err: any) {
      console.error('[Socket] ❌ Failed to get socket token');
      console.error('[Socket] Error:', err?.response?.status, err?.response?.data ?? err?.message);
      return;
    }

    console.log('[Socket] Initialising io() with transports: websocket, polling');

    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
    });

    this.socket.on('connect', () => {
      this._connected = true;
      console.log(
        '[Socket] ✅ Connected | id:',
        this.socket?.id,
        '| transport:',
        (this.socket?.io as any)?.engine?.transport?.name
      );
      this.connectionListeners.forEach((cb) => cb(true));
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] ❌ connect_error:', err.message);
      console.error('[Socket] connect_error details:', (err as any)?.data ?? err);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected | reason:', reason);
      this._connected = false;
      this.connectionListeners.forEach((cb) => cb(false));
    });

    this.socket.on('reconnect_attempt', (attempt) => {
      console.log(`[Socket] Reconnect attempt #${attempt}`);
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`[Socket] ✅ Reconnected after ${attempt} attempt(s)`);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[Socket] ❌ Reconnect failed after all attempts');
    });

    // log every incoming event for debugging
    this.socket.onAny((event, ...args) => {
      console.log(`[Socket] ⬇ INCOMING | event: "${event}" | payload:`, ...args);
    });

    // log every outgoing event for debugging
    this.socket.onAnyOutgoing((event, ...args) => {
      console.log(`[Socket] ⬆ OUTGOING | event: "${event}" | payload:`, ...args);
    });
  }

  disconnect(): void {
    console.log('[Socket] disconnect() called');
    this.socket?.disconnect();
    this.socket = null;
    this._connected = false;
    this.connectionListeners.forEach((cb) => cb(false));
  }

  reconnect(): void {
    console.log('[Socket] Manual reconnect() called');
    this.socket?.connect();
  }

  getConnectionStatus(): boolean {
    return this.socket?.connected ?? false;
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.push(callback);
    callback(this._connected);
    return () => {
      this.connectionListeners = this.connectionListeners.filter((cb) => cb !== callback);
    };
  }

  // ── Subscribe ─────────────────────────────────────────────────────────────

  on<T = unknown>(event: SocketEventType, callback: (event: SocketEvent<T>) => void): () => void {
    if (!this.socket) {
      console.warn(`[Socket] on("${event}") called but socket is null`);
      return () => {};
    }

    const handler = (payload: T) => {
      callback({ type: event, payload, timestamp: new Date() });
    };

    this.socket.on(event, handler);
    return () => {
      this.socket?.off(event, handler);
    };
  }

  // ── Emit helpers ──────────────────────────────────────────────────────────

  sendMessage(payload: {
    conversationId: string;
    content: string;
    tempId: string;
    replyTo?: unknown;
  }): void {
    console.log(
      '[Socket] sendMessage | tempId:',
      payload.tempId,
      '| convId:',
      payload.conversationId,
      '| content:',
      payload.content
    );
    if (!this.socket?.connected) {
      console.error('[Socket] sendMessage called but socket is not connected!');
    }
    this.socket?.emit(SOCKET_EVENTS.MSG_SEND, payload);
  }

  deleteMessage(messageId: string): void {
    console.log('[Socket] deleteMessage | messageId:', messageId);
    this.socket?.emit(SOCKET_EVENTS.MSG_DELETE, { messageId });
  }

  editMessage(messageId: string, content: string): void {
    console.log('[Socket] editMessage | messageId:', messageId, '| content:', content);
    this.socket?.emit(SOCKET_EVENTS.MSG_EDIT, { messageId, content });
  }

  react(messageId: string, emoji: string, conversationId: string): void {
    console.log(
      '[Socket] react | messageId:',
      messageId,
      '| emoji:',
      emoji,
      '| convId:',
      conversationId
    );
    this.socket?.emit(SOCKET_EVENTS.MSG_REACT, { messageId, emoji, conversationId });
  }

  unreact(messageId: string, emoji: string, conversationId: string): void {
    console.log(
      '[Socket] unreact | messageId:',
      messageId,
      '| emoji:',
      emoji,
      '| convId:',
      conversationId
    );
    this.socket?.emit(SOCKET_EVENTS.MSG_UNREACT, { messageId, emoji, conversationId });
  }

  typingStart(conversationId: string): void {
    console.log('[Socket] typingStart | convId:', conversationId);
    this.socket?.emit(SOCKET_EVENTS.TYPING_START, { conversationId });
  }

  typingStop(conversationId: string): void {
    console.log('[Socket] typingStop | convId:', conversationId);
    this.socket?.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
  }

  markRead(conversationId: string): void {
    console.log('[Socket] markRead | convId:', conversationId);
    this.socket?.emit(SOCKET_EVENTS.CONV_READ, { conversationId });
  }

  initiateCall(toUserId: string, type: 'audio' | 'video'): void {
    console.log('[Socket] initiateCall | toUserId:', toUserId, '| type:', type);
    this.socket?.emit(SOCKET_EVENTS.CALL_INITIATE, { toUserId, type });
  }

  acceptCall(fromUserId: string): void {
    console.log('[Socket] acceptCall | fromUserId:', fromUserId);
    this.socket?.emit(SOCKET_EVENTS.CALL_ACCEPT, { fromUserId });
  }

  rejectCall(fromUserId: string): void {
    console.log('[Socket] rejectCall | fromUserId:', fromUserId);
    this.socket?.emit(SOCKET_EVENTS.CALL_REJECT, { fromUserId });
  }

  endCall(toUserId: string): void {
    console.log('[Socket] endCall | toUserId:', toUserId);
    this.socket?.emit(SOCKET_EVENTS.CALL_END, { toUserId });
  }

  sendWebRTCOffer(toUserId: string, offer: RTCSessionDescriptionInit): void {
    console.log('[Socket] sendWebRTCOffer | toUserId:', toUserId);
    this.socket?.emit(SOCKET_EVENTS.WEBRTC_OFFER, { toUserId, offer });
  }

  sendWebRTCAnswer(toUserId: string, answer: RTCSessionDescriptionInit): void {
    console.log('[Socket] sendWebRTCAnswer | toUserId:', toUserId);
    this.socket?.emit(SOCKET_EVENTS.WEBRTC_ANSWER, { toUserId, answer });
  }

  sendICECandidate(toUserId: string, candidate: RTCIceCandidateInit): void {
    console.log('[Socket] sendICECandidate | toUserId:', toUserId);
    this.socket?.emit(SOCKET_EVENTS.WEBRTC_ICE, { toUserId, candidate });
  }

  // ── Legacy compat stubs ───────────────────────────────────────────────────

  triggerTyping(conversationId: string, _userId: string, _userName: string): void {
    this.typingStart(conversationId);
  }

  triggerMessageReceived(_conversationId: string, _message: unknown): void {
    /* server-driven */
  }

  triggerReadReceipt(
    conversationId: string,
    _messageId: string,
    _userId: string,
    _userName: string
  ): void {
    this.markRead(conversationId);
  }

  triggerReaction(
    conversationId: string,
    messageId: string,
    _userId: string,
    _userName: string,
    emoji: string,
    added: boolean
  ): void {
    if (added) this.react(messageId, emoji, conversationId);
    else this.unreact(messageId, emoji, conversationId);
  }

  queueMessageStatusUpdate(_messageId: string): void {
    /* server handles status */
  }
}

export const socketClient = new RealSocket();
