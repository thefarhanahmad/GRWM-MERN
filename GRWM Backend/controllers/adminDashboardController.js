const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Wishlist = require("../models/WishList");
const Cart = require("../models/Cart");

/**
 * Admin Dashboard Analytics
 */
const getAdminDashboardAnalytics = async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Product.countDocuments(),
    ]);

    const totalRevenueData = await Order.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;

    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: "paid",
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$deliveryStatus",
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts,
        monthlySales,
        ordersByStatus,
      },
      message: "Dashboard analytics fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
    });
  }
};

/**
 * Users with delivery stats and earnings
 */
const getUsersWithDeliveryStatsAndEarnings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments({ role: "user" });

    const users = await User.find({ role: "user" })
      .select("_id name email phone isBlocked profileImage")
      .skip(skip)
      .limit(limit);

    const deliveryStats = await Order.aggregate([
      {
        $group: {
          _id: { vendor: "$vendor_id", deliveryStatus: "$deliveryStatus" },
          count: { $sum: 1 },
        },
      },
    ]);

    const earnings = await Order.aggregate([
      {
        $match: { status: "paid" },
      },
      {
        $group: {
          _id: "$vendor_id",
          totalEarning: { $sum: "$amount" },
        },
      },
    ]);

    const userData = users.map((user) => {
      const userDeliveryStatus = {};
      deliveryStats
        .filter((d) => String(d._id.vendor) === String(user._id))
        .forEach((d) => {
          userDeliveryStatus[d._id.deliveryStatus] = d.count;
        });

      const earningObj = earnings.find(
        (e) => String(e._id) === String(user._id)
      );

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profile: user.profileImage,
        isBlocked: user.isBlocked,
        deliveryStats: userDeliveryStatus,
        totalEarning: earningObj?.totalEarning || 0,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        users: userData,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
      },
      message: "Users fetched successfully",
    });
  } catch (error) {
    console.error("Error in fetching user delivery stats:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
    });
  }
};

/**
 * Block or Unblock a user
 */
const toggleUserBlockStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      success: true,
      data: { isBlocked: user.isBlocked },
      message: `User has been ${user.isBlocked ? "blocked" : "unblocked"}`,
    });
  } catch (error) {
    console.error("Error toggling user block status:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
    });
  }
};

/**
 * Delete a user
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user)
      return res.status(404).json({
        success: false,
        data: null,
        message: "User not found",
      });

    // Optional cleanup
    await Product.deleteMany({ vendor: userId });
    await Order.deleteMany({ vendor_id: userId });

    res.status(200).json({
      success: true,
      data: null,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error",
    });
  }
};

const listAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalProducts = await Product.countDocuments();

    const products = await Product.find()
      .populate("vendor", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const formatted = products.map((p) => ({
      _id: p._id,
      name: p.title, // use `title` as per schema
      price: p.price,
      category: p.category,
      status: p.status,
      image: p.images?.[0] || "", // first image
      createdAt: p.createdAt,
      vendorName: p.vendor?.name || "Unknown Vendor",
      vendorEmail: p.vendor?.email || "-",
    }));

    res.status(200).json({
      success: true,
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      data: formatted,
      message: "Products fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * DELETE: Admin - Delete product by ID
 */
const deleteProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    // ✅ Step 1: Delete the product
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ✅ Step 2: Remove product from all user carts
    await Cart.updateMany(
      {},
      {
        $pull: { items: { product: productId } },
      }
    );

    // ✅ Step 3: Remove product from all user wishlists
    await Wishlist.updateMany(
      {},
      {
        $pull: { products: productId },
      }
    );

    // ✅ Step 4: Cancel all pending orders with this product
    await Order.updateMany(
      {
        product_id: productId,
        status: "pending",
      },
      {
        status: "canceled",
        deliveryStatus: "cancelled",
      }
    );

    // ✅ Step 5: Notify affected users (whose orders were canceled)
    const affectedOrders = await Order.find({
      product_id: productId,
      status: "canceled",
    });

    for (const order of affectedOrders) {
      await Notification.create({
        userId: order.customer_id,
        title: "Order Canceled",
        message: `Your order for a product (${product.title}) has been canceled because it was removed by the admin.`,
      });
    }

    // ✅ (Optional) Handle image or file cleanup here if stored in cloud/local

    return res.status(200).json({
      success: true,
      message: "Product deleted and cleaned up from all related collections.",
    });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  getAdminDashboardAnalytics,
  getUsersWithDeliveryStatsAndEarnings,
  toggleUserBlockStatus,
  deleteUser,
  listAllProducts,
  deleteProductById,
};
