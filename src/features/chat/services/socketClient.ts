import { io, type Socket } from 'socket.io-client';
import { SOCKET_URL, SOCKET_EVENTS } from '@/config';

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

export interface TypingPayload {
  conversationId: string;
  userId?: string;
  userName: string;
}
export interface ReactionPayload {
  conversationId: string;
  messageId: string;
  userId: string;
  userName: string;
  emoji: string;
}
export interface MessageReceivedPayload {
  conversationId: string;
  message: unknown;
}
export interface MessageStatusPayload {
  messageId: string;
  status: string;
  conversationId?: string;
}
export interface UserPresencePayload {
  userId: string;
  isOnline?: boolean;
  onlineUsers?: string[];
}
export interface ReadReceiptPayload {
  conversationId: string;
  messageIds: string[];
  userId: string;
  readAt: string;
}
export interface ConnectionStatusPayload {
  connected: boolean;
}

class SocketClient {
  private socket: Socket | null = null;
  private _connected = false;
  private connectionListeners: ((connected: boolean) => void)[] = [];

  connect(): void {
    if (this.socket?.connected) return;

    // Cookie (relay_token) is sent automatically — no manual token fetch needed.
    // Server socket.auth.ts reads the cookie from handshake headers.
    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000,
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      this._connected = true;
      this.connectionListeners.forEach((cb) => cb(true));
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] connect_error:', err.message);
      this._connected = false;
      this.connectionListeners.forEach((cb) => cb(false));
    });

    this.socket.on('disconnect', (reason) => {
      this._connected = false;
      this.connectionListeners.forEach((cb) => cb(false));
      console.warn('[Socket] Disconnected:', reason);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this._connected = false;
    this.connectionListeners.forEach((cb) => cb(false));
  }

  reconnect(): void {
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

  on<T = unknown>(event: SocketEventType, callback: (event: SocketEvent<T>) => void): () => void {
    if (!this.socket) return () => undefined;
    const handler = (payload: T) => callback({ type: event, payload, timestamp: new Date() });
    this.socket.on(event, handler);
    return () => {
      this.socket?.off(event, handler);
    };
  }

  sendMessage(payload: {
    conversationId: string;
    content: string;
    tempId: string;
    replyTo?: unknown;
  }): void {
    this.socket?.emit(SOCKET_EVENTS.MSG_SEND, payload);
  }

  deleteMessage(messageId: string): void {
    this.socket?.emit(SOCKET_EVENTS.MSG_DELETE, { messageId });
  }
  editMessage(messageId: string, content: string): void {
    this.socket?.emit(SOCKET_EVENTS.MSG_EDIT, { messageId, content });
  }
  react(messageId: string, emoji: string, conversationId: string): void {
    this.socket?.emit(SOCKET_EVENTS.MSG_REACT, { messageId, emoji, conversationId });
  }
  unreact(messageId: string, emoji: string, conversationId: string): void {
    this.socket?.emit(SOCKET_EVENTS.MSG_UNREACT, { messageId, emoji, conversationId });
  }
  typingStart(conversationId: string): void {
    this.socket?.emit(SOCKET_EVENTS.TYPING_START, { conversationId });
  }
  typingStop(conversationId: string): void {
    this.socket?.emit(SOCKET_EVENTS.TYPING_STOP, { conversationId });
  }
  markRead(conversationId: string): void {
    this.socket?.emit(SOCKET_EVENTS.CONV_READ, { conversationId });
  }
  initiateCall(toUserId: string, type: 'audio' | 'video'): void {
    this.socket?.emit(SOCKET_EVENTS.CALL_INITIATE, { toUserId, type });
  }
  acceptCall(fromUserId: string): void {
    this.socket?.emit(SOCKET_EVENTS.CALL_ACCEPT, { fromUserId });
  }
  rejectCall(fromUserId: string): void {
    this.socket?.emit(SOCKET_EVENTS.CALL_REJECT, { fromUserId });
  }
  endCall(toUserId: string): void {
    this.socket?.emit(SOCKET_EVENTS.CALL_END, { toUserId });
  }
  sendWebRTCOffer(toUserId: string, offer: RTCSessionDescriptionInit): void {
    this.socket?.emit(SOCKET_EVENTS.WEBRTC_OFFER, { toUserId, offer });
  }
  sendWebRTCAnswer(toUserId: string, answer: RTCSessionDescriptionInit): void {
    this.socket?.emit(SOCKET_EVENTS.WEBRTC_ANSWER, { toUserId, answer });
  }
  sendICECandidate(toUserId: string, candidate: RTCIceCandidateInit): void {
    this.socket?.emit(SOCKET_EVENTS.WEBRTC_ICE, { toUserId, candidate });
  }

  // Legacy compat stubs
  triggerTyping(conversationId: string, _userId: string, _userName: string): void {
    this.typingStart(conversationId);
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
  triggerMessageReceived(_conversationId: string, _message: unknown): void {
    /* server-driven */
  }
  queueMessageStatusUpdate(_messageId: string): void {
    /* server handles status */
  }
}

export const socketClient = new SocketClient();
