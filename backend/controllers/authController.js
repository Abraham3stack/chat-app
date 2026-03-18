import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const formatUserResponse = (user, includeToken = false) => {
  const payload = {
    _id: user._id,
    username: user.username,
    email: user.email,
    about: user.about,
    status: user.status,
    lastSeen: user.lastSeen,
    createdAt: user.createdAt
  };

  if (includeToken) {
    payload.token = generateToken(user._id);
  }

  return payload;
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password, about = "" } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: "Username already exists" });
      }

      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      about,
      status: "offline",
      lastSeen: new Date()
    });

    return res.status(201).json(formatUserResponse(user, true));
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({
        message: duplicateField === "username" ? "Username already exists" : "Email already exists"
      });
    }

    return res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { identifier, email, username, password } = req.body;
    const loginIdentifier = identifier || email || username;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        message: "Username or email and password are required"
      });
    }

    const normalizedIdentifier = loginIdentifier.toLowerCase();
    const user = await User.findOne({
      $or: [{ email: normalizedIdentifier }, { username: loginIdentifier }]
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid username/email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid username/email or password" });
    }

    user.status = "online";
    user.lastSeen = new Date();
    await user.save();

    return res.status(200).json(formatUserResponse(user, true));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMe = async (req, res) => {
  return res.status(200).json(formatUserResponse(req.user));
};

export { registerUser, loginUser, getMe };
