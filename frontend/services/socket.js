import { io } from "socket.io-client";

let socket;

const normalizeUrl = (value) => {
  if (!value) {
    return "http://localhost:5001";
  }

  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  return withProtocol.replace(/\/api(?:\/.*)?$/i, "").replace(/\/+$/, "");
};

export const connectSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  if (!socket) {
    socket = io(normalizeUrl(process.env.NEXT_PUBLIC_SOCKET_URL), {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    socket.off("connect");
    socket.off("connect_error");
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.log("❌ Socket error:", err.message);
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
  // Do NOT nullify the socket instance to avoid re-creating multiple connections
  // socket = null;
};
