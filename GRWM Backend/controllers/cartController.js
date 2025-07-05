const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?.userId;

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
          "Please verify your phone number before adding items to the cart.",
      });
    }

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Product ID and quantity are required, and quantity must be greater than 0.",
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

    // Find or create user's cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [], totalPrice: 0 });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex((item) =>
      item.product.equals(productId)
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item already exists in cart
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price =
        product.price * cart.items[existingItemIndex].quantity;
    } else {
      // Add new item to cart
      cart.items.push({
        product: productId,
        quantity,
        price: product.price * quantity,
      });
    }

    // Calculate total price
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
    cart.updatedAt = Date.now();

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item added to cart successfully.",
      data: cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user?.userId; // Authenticated user's ID

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required.",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found.",
      });
    }

    // Find index of the product in the cart
    const itemIndex = cart.items.findIndex((item) =>
      item.product.equals(productId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart.",
      });
    }

    // Remove the product from the cart
    cart.items.splice(itemIndex, 1);

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price, 0);
    cart.updatedAt = Date.now();

    await cart.save();

    res.status(200).json({
      success: true,
      message: "Item removed from cart successfully.",
      data: cart,
    });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Get all cart items for a user (Grouped by Vendor)
exports.getCartItems = async (req, res) => {
  try {
    const userId = req.user?.userId;

    // Fetch and populate product + vendor info
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "title price images brand vendor size",
      populate: {
        path: "vendor",
        select: "name profileImage",
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Your cart is empty.",
      });
    }

    // Group items by vendor
    const vendorGroups = {};

    cart.items
      .filter((item) => item.product && item.product.vendor) // Ensure valid product & vendor
      .forEach((item) => {
        const vendorId = item.product.vendor._id.toString();

        if (!vendorGroups[vendorId]) {
          vendorGroups[vendorId] = {
            vendorId,
            vendorName: item.product.vendor.name,
            vendorProfileImage: item.product.vendor.profileImage || null,
            items: [],
            vendorTotalPrice: 0,
          };
        }

        const itemData = {
          productId: item.product._id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          totalPrice: item.price,
          brand: item.product.brand,
          image: item.product.images?.[0] || null,
          size: item.product.size,
        };

        vendorGroups[vendorId].items.push(itemData);
        vendorGroups[vendorId].vendorTotalPrice += item.price;
      });

    // Convert object to array
    const groupedCartItems = Object.values(vendorGroups);
    // Calculate total items (across all bundles)
    const totalItems = groupedCartItems.reduce(
      (sum, bundle) => sum + bundle.items.length,
      0
    );

    res.status(200).json({
      success: true,
      message: "Cart items grouped by vendor fetched successfully.",
      data: {
        bundles: groupedCartItems,
        totalPrice: cart.totalPrice,
        totalItems,
      },
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};
