import { io, Socket } from 'socket.io-client';
import { store } from '@/store';
import { registerSocketListeners } from './registerListeners';

let socket: Socket | null = null;

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

export function connectSocket(): Socket {
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket'],
    autoConnect: true,
  });

  console.log('[FE][SOCKET] connected', socket.id);

  registerSocketListeners(socket, store.dispatch);

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    console.log('[FE][SOCKET] disconnecting');
    socket.disconnect();
    socket = null;
  }
}
