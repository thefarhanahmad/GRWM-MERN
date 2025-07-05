const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema({
  brandName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  brandLogo: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Brand = mongoose.model("Brand", BrandSchema);
module.exports = Brand;
