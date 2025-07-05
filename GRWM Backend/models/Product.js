const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  size: {
    type: String,
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand", // Refers to the Brand model
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Refers to the User model
    required: true,
  },
  itemType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item", //Like Men,Women,Accessories,Bags
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subcategory",
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  originalPrice: {
    type: Number,
  },
  finalPrice: {
    type: Number,
    required: false,
    min: 0,
  },
  color: {
    type: String,
    trim: true,
  },
  occasion: {
    type: String,
    default: null,
    validate: {
      validator: function (value) {
        return (
          value === null ||
          [
            "Casual",
            "Formal",
            "Party",
            "Wedding",
            "Vacation",
            "Work",
            "Festival",
            "Athleisure ",
            "Smart Casual",
            "Streetwear",
            "Vacation",
          ].includes(value)
        );
      },
      message: (props) => `${props.value} is not a valid occasion.`,
    },
  },
  images: [
    {
      type: String,
      required: true,
      trim: true,
    },
  ],
  soldStatus: {
    type: Boolean,
    default: false,
  },
  condition: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", ProductSchema);
