const mongoose = require("mongoose");

const categoryDataSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],

  description: {
    type: String,
  },
});

const CategoryData = mongoose.model("CategoryData", categoryDataSchema);

module.exports = CategoryData;
