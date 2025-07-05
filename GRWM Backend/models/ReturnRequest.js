const mongoose = require("mongoose");

const returnRequestSchema = new mongoose.Schema({
  customerName: String,
  phoneNumber: String,
  email: String,
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    bankName: String,
  },
  product: String, // product name or title
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product", // make sure you have a Product model
    required: true,
  },
  productDescription: String,
  sellerName: String,
  reason: String,
  paymentScreenshots: [String], // multiple image URLs
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  requestTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ReturnRequest", returnRequestSchema);
