const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    recommendedProducts: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Product",
      default: [], // product cards to render inline under this assistant message
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null allows anonymous/guest shopping-assistant sessions
    },
    sessionId: {
      type: String,
      required: true,
      index: true, // used to resume a guest conversation without an account
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

conversationSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
