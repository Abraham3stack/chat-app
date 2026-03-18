import mongoose from "mongoose";
import User from "../models/User.js";

const formatUserResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  about: user.about,
  status: user.status,
  lastSeen: user.lastSeen,
  createdAt: user.createdAt
});

const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(formatUserResponse(user));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { username, about } = req.body;

    if (username) {
      const existingUsername = await User.findOne({
        username: username.trim(),
        _id: { $ne: req.user._id }
      });

      if (existingUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      req.user.username = username.trim();
    }

    if (typeof about === "string") {
      req.user.about = about.trim();
    }

    await req.user.save();

    return res.status(200).json(formatUserResponse(req.user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Username already exists" });
    }

    return res.status(500).json({ message: error.message });
  }
};

const searchUsers = async (req, res) => {
  try {
    const query = (req.query.query || "").trim();

    if (!query) {
      return res.status(200).json([]);
    }

    const searchPattern = new RegExp(query, "i");
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ username: searchPattern }, { email: searchPattern }]
    })
      .select("-password")
      .sort({ username: 1 })
      .limit(20);

    return res.status(200).json(users.map(formatUserResponse));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ username: 1 });

    return res.status(200).json(users.map(formatUserResponse));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export { updateProfile, searchUsers, getAllUsers, getUserById };
