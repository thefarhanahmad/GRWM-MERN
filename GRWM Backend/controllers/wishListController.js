const Wishlist = require("../models/WishList");
const Product = require("../models/Product");
const User = require("../models/User");

// Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user?.userId; // Get userId from authenticated user

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No userId found in request.",
      });
    }

    const user = await User.findById(userId);

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    if (!user.phoneVerified) {
      return res.status(400).json({
        success: false,
        message:
          "Please verify your phone number before adding items to the wishlist.",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required.",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Find or create wishlist for the user
    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, products: [productId] });
    } else {
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({
          success: false,
          message: "Product is already in the wishlist.",
        });
      }
      wishlist.products.push(productId);
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully.",
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add product to wishlist.",
      error: error.message,
    });
  }
};

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No userId found in request.",
      });
    }

    const wishlist = await Wishlist.findOne({ user: userId }).populate(
      "products"
    );

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Wishlist retrieved successfully.",
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve wishlist.",
      error: error.message,
    });
  }
};

// Remove product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No userId found in request.",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "productId is required.",
      });
    }

    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Wishlist not found.",
      });
    }

    wishlist.products = wishlist.products.filter(
      (id) => id.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully.",
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove product from wishlist.",
      error: error.message,
    });
  }
};
