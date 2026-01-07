import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(): Socket {
  if (socket) {
    return socket; // prevent duplicate connections
  }

  socket = io(import.meta.env.VITE_API_BASE_URL, {
    withCredentials: true,
    autoConnect: false,
  });

  socket.connect();
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket(): Socket | null {
  return socket;
}
