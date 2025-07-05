const mongoose = require("mongoose");

const SliderSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, "Image URL is required"],
  },
  caption: {
    type: String,
    trim: true,
  },
  link: {
    type: String,
    trim: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Slider", SliderSchema);
