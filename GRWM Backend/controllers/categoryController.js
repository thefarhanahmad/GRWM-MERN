const { Category, Subcategory } = require("../models/Category");
const Item = require("../models/ItemType");

// Add a new category with item association

exports.createCategory = async (req, res) => {
  try {
    const { categoryName, itemId } = req.body;

    if (
      !categoryName ||
      typeof categoryName !== "string" ||
      categoryName.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Category name is required and must be a non-empty string.",
      });
    }

    if (!itemId || typeof itemId !== "string" || itemId.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Valid item ID is required." });
    }

    const item = await Item.findById(itemId).populate("categories");
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    // Check if item already has a category with the same name
    const duplicateCategory = item.categories.find(
      (cat) =>
        cat.categoryName.toLowerCase().trim() ===
        categoryName.toLowerCase().trim()
    );

    if (duplicateCategory) {
      return res.status(400).json({
        success: false,
        message: "This category already exists for the given item.",
      });
    }

    // Create new category
    const newCategory = new Category({
      categoryName: categoryName.trim(),
      items: [itemId],
    });
    await newCategory.save();

    item.categories.push(newCategory._id);
    await item.save();

    res.status(201).json({
      success: true,
      message: "Category created and associated with item successfully.",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all categories with populated subcategories and items
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate("subcategories", "subcategoryName")
      .populate("items", "itemName");

    if (!categories.length) {
      return res
        .status(404)
        .json({ success: false, message: "No categories found." });
    }

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Get category by Id with populated subcategories and items
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id)
      .populate("subcategories", "subcategoryName")
      .populate("items", "itemName");

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit an existing category and update items
exports.editCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { categoryName, itemId } = req.body;

    // Validate category name
    if (
      !categoryName ||
      typeof categoryName !== "string" ||
      categoryName.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Category name is required and must be a non-empty string.",
      });
    }

    // Find category
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found.",
      });
    }

    // If itemId is provided, update item references
    if (itemId) {
      const newItem = await Item.findById(itemId);
      if (!newItem) {
        return res.status(404).json({
          success: false,
          message: "New item not found.",
        });
      }

      // Remove category from previous item's categories
      await Item.updateMany(
        { categories: categoryId },
        { $pull: { categories: categoryId } }
      );

      // Add category to new item's categories if not already present
      if (!newItem.categories.includes(categoryId)) {
        newItem.categories.push(categoryId);
        await newItem.save();
      }
    }

    // Update category name
    category.categoryName = categoryName.trim();
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete category and remove reference from items
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found." });
    }

    await Item.updateMany({ categories: id }, { $pull: { categories: id } });
    await Category.findByIdAndDelete(id);

    res
      .status(200)
      .json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//**********  Subcategories **********

// Add a new subcategory
exports.createSubcategory = async (req, res) => {
  try {
    const { subcategoryName, categoryId } = req.body;

    if (
      !subcategoryName ||
      typeof subcategoryName !== "string" ||
      subcategoryName.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Subcategory name is required and must be a non-empty string.",
      });
    }

    const category = await Category.findById(categoryId).populate(
      "subcategories"
    );
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found.",
      });
    }

    // Check if subcategory with same name already exists in this category
    const duplicateSubcategory = category.subcategories.find(
      (subcat) =>
        subcat.subcategoryName.toLowerCase().trim() ===
        subcategoryName.toLowerCase().trim()
    );

    if (duplicateSubcategory) {
      return res.status(400).json({
        success: false,
        message: "This subcategory already exists in the given category.",
      });
    }

    const newSubcategory = new Subcategory({
      subcategoryName: subcategoryName.trim(),
      category: categoryId,
    });

    await newSubcategory.save();

    // Add subcategory to parent category's subcategories array
    category.subcategories.push(newSubcategory._id);
    await category.save();

    res.status(201).json({
      success: true,
      message: "Subcategory created successfully.",
      data: newSubcategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all subcategories
exports.getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find().populate(
      "category",
      "categoryName"
    );

    if (!subcategories.length) {
      return res.status(404).json({
        success: false,
        message: "No subcategories found.",
      });
    }

    res.status(200).json({
      success: true,
      data: subcategories,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get subcategory by Id
exports.getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findById(id).populate(
      "category",
      "categoryName"
    );

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Edit an existing subcategory
exports.editSubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const { subcategoryName, categoryId } = req.body;

    // Validate inputs
    if (
      !subcategoryId ||
      typeof subcategoryId !== "string" ||
      subcategoryId.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid subcategory ID is required.",
      });
    }

    if (
      !subcategoryName ||
      typeof subcategoryName !== "string" ||
      subcategoryName.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Subcategory name is required and must be a non-empty string.",
      });
    }

    if (
      !categoryId ||
      typeof categoryId !== "string" ||
      categoryId.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid category ID is required.",
      });
    }

    // Check if subcategory exists
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found.",
      });
    }

    // Check if parent category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found.",
      });
    }

    // Check if subcategory name is already taken
    const existingSubcategory = await Subcategory.findOne({
      subcategoryName: subcategoryName.trim(),
    });
    if (
      existingSubcategory &&
      existingSubcategory._id.toString() !== subcategoryId
    ) {
      return res.status(400).json({
        success: false,
        message: "Subcategory name already exists.",
      });
    }

    // Update subcategory
    subcategory.subcategoryName = subcategoryName.trim();
    subcategory.category = categoryId;
    await subcategory.save();

    res.status(200).json({
      success: true,
      message: "Subcategory updated successfully.",
      data: subcategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found.",
      });
    }

    // Remove subcategory reference from parent category
    await Category.findByIdAndUpdate(subcategory.category, {
      $pull: { subcategories: id },
    });

    await Subcategory.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
