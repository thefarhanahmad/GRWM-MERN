const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String }, // Optional
  icon: { type: String }, // Optional, can store badge URL
  popupSeen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }, // Auto add timestamp
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const Achievement = mongoose.model("Achievement", achievementSchema);
module.exports = Achievement;
