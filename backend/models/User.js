import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    about: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["online", "offline"],
      default: "offline"
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;
