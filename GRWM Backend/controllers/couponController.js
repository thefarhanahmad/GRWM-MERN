const Coupon = require("../models/dicountCoupon");
const Product = require("../models/Product");
const User = require("../models/User");

// ✅ Create Coupon (Admin/Seller)
exports.createCoupon = async (req, res) => {
  try {
    const { code, discount } = req.body;
    const userId = req.user.userId; // Admin/Seller ID

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists. Choose a different code.",
      });
    }

    const newCoupon = new Coupon({
      code,
      discount,
      createdBy: userId,
    });

    await newCoupon.save();

    res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      data: newCoupon,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get Coupons Created by the Logged-in User (Admin/Seller)
exports.getCoupon = async (req, res) => {
  try {
    const userId = req.user.userId; // Get user ID from authenticated request

    // Find coupons created by this user
    const coupons = await Coupon.find({ createdBy: userId });

    res.status(200).json({
      success: true,
      message: "Coupons fetched successfully.",
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Coupon
exports.deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    const userId = req.user.userId; // Logged-in User ID

    // ✅ Check if coupon exists
    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    // ✅ Check if the logged-in user is the creator (or admin)
    if (coupon.createdBy && coupon.createdBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this coupon.",
      });
    }

    // ✅ Delete the coupon
    await Coupon.findByIdAndDelete(couponId);

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode, productId, products } = req.body; // Support both
    const userId = req.user.userId;

    // Find the coupon
    const coupon = await Coupon.findOne({ code: couponCode })
      .populate("createdBy", "role")
      .populate("assignedTo", "_id");

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon code.",
      });
    }

    // Expiry check
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired.",
      });
    }

    // Check assigned user
    if (coupon.assignedTo && coupon.assignedTo._id.toString() !== userId) {
      return res.status(400).json({
        success: false,
        message: "You are not allowed to use this coupon.",
      });
    }

    // 🛍️ Single product path
    if (productId) {
      // Check if product exists
      const product = await Product.findById(productId).select("price vendor");
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found." });
      }

      // Seller restriction
      if (
        coupon.createdBy &&
        coupon.createdBy.role !== "admin" &&
        product.vendor.toString() !== coupon.createdBy._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: "This coupon is only valid for the seller's products.",
        });
      }

      const discountAmount = (product.price * coupon.discount) / 100;

      return res.status(200).json({
        success: true,
        message: "Coupon applied successfully.",
        data: {
          discount: coupon.discount,
          discountedPrice: product.price - discountAmount,
        },
      });
    }

    // 🧺 Multiple products path
    if (Array.isArray(products) && products.length > 0) {
      const productIds = products.map((p) => p.productId);
      const foundProducts = await Product.find({
        _id: { $in: productIds },
      }).select("price vendor");

      if (foundProducts.length !== products.length) {
        return res.status(400).json({
          success: false,
          message: "One or more products not found.",
        });
      }

      // Seller restriction
      if (coupon.createdBy && coupon.createdBy.role !== "admin") {
        const allFromSameSeller = foundProducts.every(
          (p) => p.vendor.toString() === coupon.createdBy._id.toString()
        );

        if (!allFromSameSeller) {
          return res.status(400).json({
            success: false,
            message: "This coupon can only be used on the seller's products.",
          });
        }
      }

      // Calculate total price and discount
      const totalPrice = foundProducts.reduce((acc, p) => acc + p.price, 0);
      const discountAmount = (totalPrice * coupon.discount) / 100;

      return res.status(200).json({
        success: true,
        message: "Coupon applied successfully on multiple products.",
        data: {
          discount: coupon.discount,
          totalBeforeDiscount: totalPrice,
          totalAfterDiscount: totalPrice - discountAmount,
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: "No valid product(s) provided to apply the coupon.",
    });
  } catch (error) {
    console.error("Coupon apply error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};
