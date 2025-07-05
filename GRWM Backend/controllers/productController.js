const Product = require("../models/Product");
const { Category, Subcategory } = require("../models/Category");
const Item = require("../models/ItemType");
const Brand = require("../models/Brand");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Wishlist = require("../models/WishList");
const Order = require("../models/Order");

// =======================
// Create a new product
// =======================
exports.createProduct = async (req, res) => {
  console.log("req body : ", req.body);
  try {
    const {
      title,
      description,
      size,
      brand,
      itemType,
      category,
      subcategory,
      price,
      originalPrice,
      finalPrice,
      color,
      occasion,
      condition,
    } = req.body;

    const normalizedBrand = brand && brand !== "" ? brand : null;
    const normalizedSubcategory =
      subcategory && subcategory !== "" ? subcategory : null;

    const vendor = req.user?.userId;
    const user = await User.findById(vendor);

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    if (!user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your phone number before adding products.",
      });
    }

    // Validate required fields
    if (
      !title ||
      !description ||
      !itemType ||
      !category ||
      !price ||
      !vendor ||
      !condition
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields (including itemType) are required.",
      });
    }

    // Validate price
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number.",
      });
    }

    // Optional: Validate finalPrice
    if (finalPrice && (isNaN(finalPrice) || finalPrice < 0)) {
      return res.status(400).json({
        success: false,
        message: "Final price must be a positive number.",
      });
    }

    // Check if itemType and category exist
    const [itemExists, categoryExists] = await Promise.all([
      Item.findById(itemType),
      Category.findById(category),
    ]);

    if (!itemExists) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid itemType." });
    }
    if (!categoryExists) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid category." });
    }

    // Subcategory check
    let subcategoryExists = null;
    if (normalizedSubcategory) {
      subcategoryExists = await Subcategory.findById(normalizedSubcategory);
      if (
        !subcategoryExists ||
        subcategoryExists.category.toString() !== category
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Invalid subcategory or subcategory does not belong to the provided category.",
        });
      }
    }

    // Brand check
    let brandExists = null;
    if (normalizedBrand) {
      brandExists = await Brand.findById(normalizedBrand);
      if (!brandExists) {
        return res.status(404).json({
          success: false,
          message: "Invalid brand.",
        });
      }
    }

    // Handle image uploads
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please upload at least one product image.",
      });
    }

    // Create and save the new product.
    const newProduct = new Product({
      title: title.trim(),
      description: description.trim(),
      size,
      brand: normalizedBrand,
      vendor,
      itemType,
      category,
      ssubcategory: normalizedSubcategory,
      price,
      originalPrice,
      finalPrice,
      condition,
      color: color ? color.trim() : null,
      occasion: occasion && occasion.trim() !== "" ? occasion : null,
      images: imageUrls,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: newProduct,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// =======================
// Get all products
// =======================
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({
      soldStatus: { $ne: true }, // Exclude sold-out products
    })
      .populate("vendor", "name profileImage")
      .populate("category", "categoryName")
      .populate("subcategory", "subcategoryName")
      .sort({ createdAt: -1 });

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found.",
      });
    }

    res.status(200).json({
      success: true,
      length: products.length,
      message: "Products fetched successfully.",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// =======================
// Get product by ID
// =======================
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("vendor", "name profileImage ratings")
      .populate("category", "categoryName")
      .populate("subcategory", "subcategoryName")
      .populate("brand", "brandName");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product fetched successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// =======================
// Update product
// =======================
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      size,
      brand,
      category,
      condition,
      subcategory,
      price,
      color,
      originalPrice,
      finalPrice,
      occasion,
    } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Agar image upload nahi ho rahi, to purani image hi rehni chahiye
    let imageUrls = product.images;
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map((file) => file.path);
    }

    product.title = title || product.title;
    product.condition = condition || product.condition;
    product.description = description || product.description;
    product.size = size || product.size;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.subcategory = subcategory || product.subcategory;
    product.price = price || product.price;
    product.originalPrice = originalPrice || product.originalPrice;
    product.finalPrice = finalPrice || product.finalPrice;
    product.color = color || product.color;
    product.occasion = occasion || product.occasion;
    product.images = imageUrls;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// =======================
// Delete product
// =======================

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Delete product from the Product collection
    await Product.findByIdAndDelete(id);

    // Remove product from all carts
    await Cart.updateMany(
      {},
      {
        $pull: {
          items: { product: id },
        },
      }
    );

    // Remove product from all wishlists
    await Wishlist.updateMany(
      {},
      {
        $pull: {
          products: id,
        },
      }
    );

    // Delete orders related to the deleted product
    await Order.deleteMany({ product_id: id });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully from all collections.",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// =======================
// Get Product by Vendors
// =======================
exports.getProductsByVendor = async (req, res) => {
  try {
    const vendorId = req.user?.userId; // Get vendor ID from authenticated user

    if (!vendorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Vendor ID is missing.",
      });
    }

    // Find products associated with the vendor
    const products = await Product.find({ vendor: vendorId })
      .populate("itemType")
      .populate("category")
      .populate("subcategory")
      .populate("vendor", "name")
      .sort({ createdAt: -1 });

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found for this vendor.",
      });
    }

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products by vendor:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// =======================
// Get Product by queries
// =======================
exports.getProductsByQuery = async (req, res) => {
  try {
    const {
      item,
      category,
      subCategory,
      brand,
      priceUnder,
      minPrice,
      maxPrice,
      size,
      color,
      occasion,
    } = req.query;

    // Build dynamic query object
    const query = {};

    // Add filters only if they exist in the query params
    if (item) {
      const itemDoc = await Item.findOne({ itemName: item.trim() });
      if (!itemDoc) {
        return res.status(404).json({
          success: false,
          message: "Item not found.",
        });
      }
      query.itemType = itemDoc._id;
    }

    if (category) {
      const categoryDoc = await Category.findOne({
        categoryName: category.trim(),
      });
      if (!categoryDoc) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }
      query.category = categoryDoc._id;
    }

    if (subCategory) {
      const subCategoryDoc = await Subcategory.findOne({
        subcategoryName: subCategory.trim(),
      });
      if (!subCategoryDoc) {
        return res.status(404).json({
          success: false,
          message: "Subcategory not found.",
        });
      }
      query.subcategory = subCategoryDoc._id;
    }

    if (brand) {
      const brandDoc = await Brand.findOne({ brandName: brand.trim() });
      if (!brandDoc) {
        return res.status(404).json({
          success: false,
          message: "Brand not found.",
        });
      }
      query.brand = brandDoc._id;
    }

    // Price filter
    if (priceUnder) {
      const priceLimit = parseFloat(priceUnder);
      if (isNaN(priceLimit) || priceLimit <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid price value.",
        });
      }
      query.price = { $lte: priceLimit };
    }

    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) {
        const min = parseFloat(minPrice);
        if (isNaN(min) || min < 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid minPrice value.",
          });
        }
        priceFilter.$gte = min;
      }

      if (maxPrice) {
        const max = parseFloat(maxPrice);
        if (isNaN(max) || max <= 0) {
          return res.status(400).json({
            success: false,
            message: "Invalid maxPrice value.",
          });
        }
        priceFilter.$lte = max;
      }

      // Merge with existing price filter if it exists
      query.price = { ...query.price, ...priceFilter };
    }

    // ✅ Size Filter (Case-insensitive match)
    if (size) {
      query.size = { $regex: new RegExp(`^${size.trim()}$`, "i") };
    }

    // ✅ Color Filter (Case-insensitive match)
    if (color) {
      query.color = { $regex: new RegExp(color.trim(), "i") };
    }

    // ✅ Occasion Filter (Case-insensitive exact match)
    if (occasion) {
      query.occasion = { $regex: new RegExp(`^${occasion.trim()}$`, "i") };
    }

    // Find products based on dynamic query
    const products = await Product.find({
      ...query,
      soldStatus: { $ne: true },
    })
      .populate("itemType", "itemName")
      .populate("category", "categoryName")
      .populate("subcategory", "subcategoryName")
      .populate("brand", "brandName")
      .populate("vendor", "name profileImage holidayMode")
      .sort({ createdAt: -1 });

    const activeProducts = products.filter(
      (product) => !product.vendor?.holidayMode
    );

    if (activeProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found matching the criteria.",
      });
    }

    res.status(200).json({
      success: true,
      length: activeProducts.length,
      message: "Products retrieved successfully.",
      data: activeProducts,
    });
  } catch (error) {
    console.error("Error fetching products by query:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// =======================
// Related Cat&SubCat
// =======================
exports.getCategoriesAndSubcategoriesByItemType = async (req, res) => {
  try {
    const { itemType } = req.params;

    if (!itemType) {
      return res.status(400).json({
        success: false,
        message: "itemType parameter is required.",
      });
    }

    // Find products by itemType and exclude sold-out products
    const products = await Product.find({
      itemType,
      soldStatus: { $ne: true }, // Exclude sold-out products
    })
      .select("category subcategory")
      .populate("category", "categoryName")
      .populate("subcategory", "subcategoryName");

    if (!products.length) {
      return res.status(404).json({
        success: false,
        message: "No products found for this itemType.",
      });
    }

    // Extract unique categories and their subcategories
    const categoryMap = new Map();

    products.forEach((product) => {
      const category = product.category;
      const subcategory = product.subcategory;

      if (!category) return; // Skip if no category

      const categoryId = category._id.toString();

      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          categoryId: category._id,
          categoryName: category.categoryName,
          subcategories: new Map(),
        });
      }

      if (subcategory) {
        const subcategoryId = subcategory._id.toString();
        categoryMap
          .get(categoryId)
          .subcategories.set(subcategoryId, subcategory.subcategoryName);
      }
    });

    // Format the result
    const result = Array.from(categoryMap.values()).map((item) => ({
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      subcategories: Array.from(item.subcategories, ([id, name]) => ({
        subcategoryId: id,
        subcategoryName: name,
      })),
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching categories and subcategories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// =======================
// Related Products
// =======================
exports.getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find the product to get its attributes
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Define query for related products
    const relatedProducts = await Product.find({
      _id: { $ne: productId }, // Exclude the current product
      soldStatus: false, // Exclude sold-out products
      $or: [
        { category: product.category }, // Same category
        { brand: product.brand }, // Same brand
        { itemType: product.itemType }, // Same itemType (like Men/Women)
        { subcategory: product.subcategory }, // Same subcategory
        { price: { $gte: product.price * 0.8, $lte: product.price * 1.2 } }, // Price range ±20%
        { size: product.size }, // Same size
        { color: product.color }, // Same color
        { occasion: product.occasion }, // Same occasion
      ],
    })
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(10) // Limit number of suggestions
      .select("title price images vendor soldStatus")
      .populate("vendor", "name profileImage holidayMode");

    const activeRelatedProducts = relatedProducts.filter(
      (product) => !product.vendor?.holidayMode
    );

    res.status(200).json({
      success: true,
      length: activeRelatedProducts.length,
      data: activeRelatedProducts,
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// =======================
// Followed Sellers Products
// =======================
exports.getFollowedSellersProducts = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId; // Get logged-in user's ID

    // Find the logged-in user and get their followed sellers
    const user = await User.findById(loggedInUserId).select("following");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const followedSellers = user.following;

    if (!followedSellers || followedSellers.length === 0) {
      return res.status(200).json({
        success: true,
        message: "You are not following any sellers.",
        data: [],
      });
    }

    // Fetch products from followed sellers sorted by latest createdAt
    const products = await Product.find({
      vendor: { $in: followedSellers }, // Fetch products from followed sellers
      soldStatus: { $ne: true }, // Exclude sold-out products
    })
      .sort({ createdAt: -1 })
      .populate("vendor", "name profileImage holidayMode"); // Optional: populate vendor details like name

    const activeProducts = products.filter(
      (product) => !product.vendor?.holidayMode
    );

    res.status(200).json({
      success: true,
      message: "Products from followed sellers fetched successfully.",
      data: activeProducts,
    });
  } catch (error) {
    console.error("Error fetching followed sellers products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Fetch products of the logged-in vendor filtered by occasion
exports.getOwnProductsByOccasion = async (req, res) => {
  console.log("req query  :", req.query);
  try {
    const { occasion } = req.query; // Get the occasion from query params
    const userId = req.user.userId; // Get logged-in user ID

    // Ensure occasion is provided
    if (!occasion) {
      return res.status(400).json({
        success: false,
        message: "Occasion is required.",
        data: null,
      });
    }

    // Fix the query to ensure proper filtering
    const products = await Product.find({ vendor: userId, occasion: occasion })
      .populate("brand", "name")
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("itemType", "name")
      .sort({ createdAt: -1 });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for this occasion.",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.getUserProductsByOccasion = async (req, res) => {
  console.log("req query  :", req.query);
  try {
    const { occasion } = req.query; // Get the occasion from query params
    const { userId } = req.params; // ✅ Get user ID from request params

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
        data: null,
      });
    }

    // Ensure occasion is provided
    if (!occasion) {
      return res.status(400).json({
        success: false,
        message: "Occasion is required.",
        data: null,
      });
    }

    // Fix the query to ensure proper filtering
    const products = await Product.find({ vendor: userId, occasion: occasion })
      .populate("brand", "name")
      .populate("category", "name")
      .populate("subcategory", "name")
      .populate("itemType", "name")
      .sort({ createdAt: -1 });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found for this occasion.",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Products fetched successfully.",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Search Product
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    let queryObj = {};

    if (q && q.trim() !== "") {
      const searchQuery = q.trim();

      // First check for related models using text (brand/category/subcategory/itemType)
      const [brands, categories, subcategories, itemTypes] = await Promise.all([
        Brand.find({ brandName: { $regex: searchQuery, $options: "i" } }),
        Category.find({ categoryName: { $regex: searchQuery, $options: "i" } }),
        Subcategory.find({
          subcategoryName: { $regex: searchQuery, $options: "i" },
        }),
        Item.find({ itemName: { $regex: searchQuery, $options: "i" } }),
      ]);

      queryObj = {
        $or: [
          { title: { $regex: searchQuery, $options: "i" } },
          { description: { $regex: searchQuery, $options: "i" } },
          { color: { $regex: searchQuery, $options: "i" } },
          { condition: { $regex: searchQuery, $options: "i" } },
          { brand: { $in: brands.map((b) => b._id) } },
          { category: { $in: categories.map((c) => c._id) } },
          { subcategory: { $in: subcategories.map((sc) => sc._id) } },
          { itemType: { $in: itemTypes.map((i) => i._id) } },
        ],
      };
    }

    const products = await Product.find(queryObj)
      .populate("brand", "brandName")
      .populate("category", "categoryName")
      .populate("subcategory", "subcategoryName")
      .populate("itemType", "itemName")
      .populate("vendor", "name email profileImage profileImage")
      .sort({ createdAt: -1 });

    const activeProducts = products.filter(
      (product) => !product.vendor?.holidayMode
    );

    res.status(200).json({
      success: true,
      count: activeProducts.length,
      message: q ? `Results for "${q}"` : "All products",
      data: activeProducts,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching products",
      error: error.message,
    });
  }
};

exports.getOccasionsWithLatestImages = async (req, res) => {
  try {
    const results = await Product.aggregate([
      {
        $match: {
          occasion: { $ne: null },
        },
      },
      {
        $sort: {
          createdAt: -1, // Get latest product first
        },
      },
      {
        $group: {
          _id: "$occasion",
          image: { $first: { $arrayElemAt: ["$images", 0] } }, // first image of latest product
        },
      },
      {
        $project: {
          _id: 0,
          occasion: "$_id",
          image: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Occasions with images fetched successfully.",
      data: results,
    });
  } catch (error) {
    console.error("Error fetching occasions with images:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};
