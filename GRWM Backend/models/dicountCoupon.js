const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discount: { type: Number, required: true },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  },

  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Coupon", couponSchema);
