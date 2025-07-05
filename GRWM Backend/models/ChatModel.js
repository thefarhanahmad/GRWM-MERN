const mongoose = require("mongoose");

// ✅ Chat Schema (One entry per sender-recipient pair)
const chatSchema = new mongoose.Schema(
  {
    chatId: { type: String, unique: true, required: true }, // Unique ID for sender & receiver pair
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        receiver: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        seen: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
