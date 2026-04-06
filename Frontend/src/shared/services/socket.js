import { io } from "socket.io-client";

let socket;

const resolveSocketUrl = () => {
  const configured = import.meta.env.VITE_SOCKET_URL;
  if (configured) return configured;

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:3000";
};

export function getSocket() {
  if (!socket) {
    socket = io(resolveSocketUrl(), {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
  }

  return socket;
}

export function closeSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}
