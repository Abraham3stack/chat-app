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
  if (!socket) {
    socket = io(normalizeUrl(process.env.NEXT_PUBLIC_SOCKET_URL), {
      transports: ["websocket"],
      autoConnect: true
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
