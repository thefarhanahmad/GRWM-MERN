const mongoose = require("mongoose");

const BoostProductSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  products: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  ],

  plan: {
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
  },

  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
});

// Automatically set endDate based on duration
BoostProductSchema.pre("save", function (next) {
  this.endDate = new Date(this.startDate);
  this.endDate.setDate(this.endDate.getDate() + this.plan.duration);
  next();
});

module.exports = mongoose.model("BoostProduct", BoostProductSchema);
