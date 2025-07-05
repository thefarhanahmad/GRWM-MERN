const Item = require("../models/ItemType");

// Create a new item
exports.createItem = async (req, res) => {
  try {
    const { itemName, priority, categories } = req.body;

    // Validate required fields
    if (!itemName || typeof itemName !== "string" || itemName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "itemName is required and must be a non-empty string.",
      });
    }

    if (!priority || typeof priority !== "number" || priority <= 0) {
      return res.status(400).json({
        success: false,
        message: "priority is required and must be a positive number.",
      });
    }

    // Check if priority or itemName already exists
    const existingItem = await Item.findOne({
      $or: [{ priority }, { itemName: itemName.trim() }],
    });

    if (existingItem) {
      if (existingItem.priority === priority) {
        return res.status(400).json({
          success: false,
          message: "An item with this priority already exists.",
        });
      }
      if (
        existingItem.itemName.trim().toLowerCase() ===
        itemName.trim().toLowerCase()
      ) {
        return res.status(400).json({
          success: false,
          message: "An item with this itemName already exists.",
        });
      }
    }

    // Create and save new item
    const newItem = new Item({
      itemName: itemName.trim(),
      priority,
      categories,
    });
    await newItem.save();

    res.status(201).json({
      success: true,
      message: "Item created successfully.",
      data: newItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create item.",
      error: error.message,
    });
  }
};

// Get all items (with optional search query)
// exports.getItems = async (req, res) => {
//   try {
//     const searchQuery = req.query.search || "";

//     const items = await Item.aggregate([
//       {
//         $lookup: {
//           from: "categories",
//           localField: "categories",
//           foreignField: "_id",
//           as: "categories",
//         },
//       },
//       {
//         $unwind: {
//           path: "$categories",
//           preserveNullAndEmptyArrays: true,
//         },
//       },
//       {
//         $lookup: {
//           from: "subcategories",
//           localField: "categories.subcategories",
//           foreignField: "_id",
//           as: "categories.subcategories",
//         },
//       },
//       {
//         $match: {
//           $or: [
//             { itemName: { $regex: searchQuery, $options: "i" } },
//             { "categories.categoryName": { $regex: searchQuery, $options: "i" } },
//             { "categories.subcategories.subcategoryName": { $regex: searchQuery, $options: "i" } },
//           ],
//         },
//       },
//       {
//         $group: {
//           _id: "$_id",
//           itemName: { $first: "$itemName" },
//           priority: { $first: "$priority" },
//           categories: { $first: "$categories" },
//         },
//       },
//       {
//         $sort: { priority: 1 },
//       },
//     ]);

//     res.status(200).json({
//       success: true,
//       message: "Items retrieved successfully.",
//       data: items,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to retrieve items.",
//       error: error.message,
//     });
//   }
// };

exports.getItems = async (req, res) => {
  try {
    const items = await Item.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categories",
          foreignField: "_id",
          as: "categories",
        },
      },
      {
        $unwind: {
          path: "$categories",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "categories.subcategories",
          foreignField: "_id",
          as: "categories.subcategories",
        },
      },
      {
        $group: {
          _id: "$_id",
          itemName: { $first: "$itemName" },
          priority: { $first: "$priority" },
          categories: { $push: "$categories" },
        },
      },
      {
        $sort: { priority: 1 },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Items retrieved successfully.",
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve items.",
      error: error.message,
    });
  }
};

exports.getItemByName = async (req, res) => {
  try {
    const { itemName } = req.query;

    if (!itemName || typeof itemName !== "string") {
      return res.status(400).json({
        success: false,
        message: "itemName query parameter is required and must be a string.",
      });
    }

    // Find items with an exact, case-insensitive match for itemName
    const items = await Item.find({
      itemName: { $regex: `^${itemName}$`, $options: "i" },
    }).populate({
      path: "categories",
      select: "categoryName subcategories",
      populate: {
        path: "subcategories",
        select: "subcategoryName", // Adjust the fields you want to show for subcategories
      },
    });

    res.status(200).json({
      success: true,
      message: "Items retrieved successfully.",
      data: items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve items.",
      error: error.message,
    });
  }
};

// Get single item by ID
exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required.",
      });
    }

    const item = await Item.findById(id).populate("categories");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item retrieved successfully.",
      data: item,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve item.",
      error: error.message,
    });
  }
};

// Update item by ID
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, priority, categories } = req.body;

    // Validate ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required.",
      });
    }

    // Validate itemName
    if (!itemName || typeof itemName !== "string" || itemName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "itemName is required and must be a non-empty string.",
      });
    }

    // Validate priority
    if (!priority || typeof priority !== "number" || priority <= 0) {
      return res.status(400).json({
        success: false,
        message: "priority is required and must be a positive number.",
      });
    }

    // Check if itemName or priority already exists (excluding the current item)
    const existingItem = await Item.findOne({
      $or: [{ priority }, { itemName: itemName.trim() }],
      _id: { $ne: id }, // Exclude the current item being updated
    });

    if (existingItem) {
      if (existingItem.priority === priority) {
        return res.status(400).json({
          success: false,
          message: "An item with this priority already exists.",
        });
      }
      if (
        existingItem.itemName.trim().toLowerCase() ===
        itemName.trim().toLowerCase()
      ) {
        return res.status(400).json({
          success: false,
          message: "An item with this itemName already exists.",
        });
      }
    }

    // Update item
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      { itemName: itemName.trim(), priority, categories },
      { new: true, runValidators: true }
    ).populate("categories");

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item updated successfully.",
      data: updatedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update item.",
      error: error.message,
    });
  }
};

// Delete item by ID
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Item ID is required.",
      });
    }

    const deletedItem = await Item.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Item deleted successfully.",
      data: deletedItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete item.",
      error: error.message,
    });
  }
};
