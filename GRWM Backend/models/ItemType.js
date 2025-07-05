const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    trim: true,
  },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  priority: {
    type: Number,
    required: true,
  },
});

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;
