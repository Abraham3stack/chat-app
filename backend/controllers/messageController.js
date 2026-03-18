import Message from "../models/Message.js";
import User from "../models/User.js";

const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "receiverId and content are required" });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      timestamp: new Date()
    });

    const populatedMessage = await message.populate([
      { path: "sender", select: "username email" },
      { path: "receiver", select: "username email" }
    ]);

    const io = req.app.get("io");
    if (io) {
      io.to(receiverId.toString()).emit("receive_message", populatedMessage);
      io.to(req.user._id.toString()).emit("receive_message", populatedMessage);
    }

    return res.status(201).json(populatedMessage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    const otherUser = await User.findById(userId);

    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        read: false
      },
      {
        $set: {
          read: true
        }
      }
    );

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .sort({ timestamp: 1 })
      .populate("sender", "username email")
      .populate("receiver", "username email");

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    const otherUser = await User.findById(userId);

    if (!otherUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user._id,
        read: false
      },
      {
        $set: {
          read: true
        }
      }
    );

    const io = req.app.get("io");
    if (io) {
      io.to(userId.toString()).emit("messages_read", {
        byUserId: req.user._id.toString(),
        userId: userId.toString()
      });
    }

    return res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { sendMessage, getMessages, markMessagesAsRead };
