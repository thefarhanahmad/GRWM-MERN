const mongoose = require("mongoose");

// Category Schema
const CategorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true,
  },
  subcategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory", // referencing Subcategory schema
    },
  ],
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item", // referencing Item schema
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Subcategory Schema
const SubcategorySchema = new mongoose.Schema({
  subcategoryName: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // parent category reference
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Category = mongoose.model("Category", CategorySchema);
const Subcategory = mongoose.model("Subcategory", SubcategorySchema);

module.exports = { Category, Subcategory };
