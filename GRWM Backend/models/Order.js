const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  deliveryStatus: {
    type: String,
    enum: ["pending", "shipped", "delivered", "rejected", "cancelled"],
    default: "pending",
  },
  status: {
    type: String,
    enum: ["pending", "paid", "cancelled"],
    default: "pending",
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  phonepe_transaction_id: {
    type: String,
    default: null,
  },
  deliveryAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["online", "cod"],
  },

  shiprocket_order_id: {
    type: String,
    default: null,
  },
  awb_code: {
    type: String,
    default: null,
  },
  shipment_status: {
    type: String,
    enum: [
      "NEW",
      "PROCESSING",
      "IN_TRANSIT",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
    ],
    default: null,
  },
  tracking_url: {
    type: String,
    default: null,
  },
  label_url: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", orderSchema);
