import Message from "../models/Message.js";
import User from "../models/User.js";

const onlineUsers = new Map();
const socketUsers = new Map();

const addUserSocket = (userId, socketId) => {
  const activeSockets = onlineUsers.get(userId) || new Set();
  activeSockets.add(socketId);
  onlineUsers.set(userId, activeSockets);
  socketUsers.set(socketId, userId);
};

const removeUserSocket = (socketId) => {
  const userId = socketUsers.get(socketId);

  if (!userId) {
    return null;
  }

  const activeSockets = onlineUsers.get(userId);

  if (activeSockets) {
    activeSockets.delete(socketId);

    if (activeSockets.size === 0) {
      onlineUsers.delete(userId);
    } else {
      onlineUsers.set(userId, activeSockets);
    }
  }

  socketUsers.delete(socketId);

  return userId;
};

const initializeChatSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("user_online", async (userId) => {
      if (!userId) {
        return;
      }

      try {
        addUserSocket(userId, socket.id);
        socket.join(userId);

        await User.findByIdAndUpdate(userId, {
          status: "online",
          lastSeen: new Date()
        });

        io.emit("user_presence", {
          userId,
          socketId: socket.id,
          status: "online"
        });
        io.emit("user_online", {
          userId,
          socketId: socket.id,
          status: "online"
        });
      } catch (error) {
        socket.emit("socket_error", { message: error.message });
      }
    });

    socket.on("send_message", async (payload) => {
      const { senderId, receiverId, content } = payload || {};

      if (!senderId || !receiverId || !content?.trim()) {
        socket.emit("socket_error", {
          message: "senderId, receiverId, and content are required"
        });
        return;
      }

      try {
        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content: content.trim(),
          timestamp: new Date(),
          read: false
        });

        const populatedMessage = await message.populate([
          { path: "sender", select: "username email status lastSeen" },
          { path: "receiver", select: "username email status lastSeen" }
        ]);

        io.to(receiverId).emit("receive_message", populatedMessage);
        io.to(senderId).emit("receive_message", populatedMessage);
      } catch (error) {
        socket.emit("socket_error", { message: error.message });
      }
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      if (!senderId || !receiverId) {
        return;
      }

      io.to(receiverId).emit("typing", { senderId, receiverId });
    });

    socket.on("stop_typing", ({ senderId, receiverId }) => {
      if (!senderId || !receiverId) {
        return;
      }

      io.to(receiverId).emit("stop_typing", { senderId, receiverId });
    });

    socket.on("messages_read", ({ senderId, receiverId }) => {
      if (!senderId || !receiverId) {
        return;
      }

      io.to(receiverId).emit("messages_read", { senderId, receiverId });
    });

    socket.on("disconnect", async () => {
      const userId = removeUserSocket(socket.id);

      if (!userId) {
        return;
      }

      if (onlineUsers.has(userId)) {
        return;
      }

      try {
        await User.findByIdAndUpdate(userId, {
          status: "offline",
          lastSeen: new Date()
        });

        io.emit("user_presence", {
          userId,
          status: "offline",
          lastSeen: new Date().toISOString()
        });
      } catch (error) {
        console.error(`Socket disconnect error: ${error.message}`);
      }
    });
  });
};

export default initializeChatSocket;
