const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    balance: {
      type: Number,
      default: 0,
    },
    profileImage: {
      type: String,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    holidayMode: {
      type: Boolean,
      default: false,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    ratings: {
      totalRating: { type: Number, default: 0 },
      numberOfRatings: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    totalSold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
