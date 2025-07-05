const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  pickupLocationName: {
    type: String,
    default: "Default",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Address", addressSchema);
