import express from "express";
import {
  getMessages,
  markMessagesAsRead,
  sendMessage
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.patch("/read/:userId", protect, markMessagesAsRead);
router.get("/:userId", protect, getMessages);

export default router;
