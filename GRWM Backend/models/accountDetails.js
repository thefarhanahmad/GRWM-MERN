const mongoose = require("mongoose");

const AccountDetailsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
    upiId: { type: String },

    // ✅ New Field for Razorpay Route
    razorpayAccountId: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", AccountDetailsSchema);
