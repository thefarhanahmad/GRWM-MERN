const express = require("express");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const {
  toggleFollowUser,
  getUserProfile,
  toggleHolidayMode,
  getUserByIdAndTheirProducts,
  editUserAddress,
  editUserProfile,
  changePassword,
  getFollowersAndFollowing,
} = require("../controllers/userController");
const {
  addToCart,
  removeFromCart,
  getCartItems,
} = require("../controllers/cartController");
const {
  getCategoriesAndSubcategoriesByItemType,
  getRelatedProducts,
  getFollowedSellersProducts,
} = require("../controllers/productController");
const { getItemByName } = require("../controllers/itemController");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishListController");
const {
  createOrder,
  verifyPayment,
  getUserOrders,
  getSellerOrders,
  updateOrderStatus,
  cancelOrder,
  getUserAddresses,
  createUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getVendorEarnings,
  createReturnRequest,
  getReturnRequestsForSeller,
} = require("../controllers/orderPaymentController");
const {
  getUserNotifications,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");
const {
  addReview,
  getSellerReviews,
} = require("../controllers/reviewController");
const {
  startChat,
  getMessages,
  getUserChats,
  markMessagesAsSeen,
  sendMessage,
} = require("../controllers/chatController");
const upload = require("../config/multer");
const {
  createAccountDetails,
  updateAccountDetails,
  getAccountDetails,
  deleteAccountDetails,
} = require("../controllers/accountController");
const {
  getUserAchievements,
  markAchievementPopupSeen,
} = require("../controllers/achievementController");
const {
  getTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonialsControllers");
const {
  createContactMessage,
  getAllContactMessages,
} = require("../controllers/contactController");
const ReturnRequest = require("../models/ReturnRequest");
const router = express.Router();

// Protected Route to Get User Profile
router.get("/profile", authMiddleware, getUserProfile);

// Categories by items
router.get("/menu-items", getItemByName);

// ****** Cart ********
router.post("/cart/add", authMiddleware, addToCart);
router.get("/cart/items", authMiddleware, getCartItems);
router.post("/cart/remove", authMiddleware, removeFromCart);

// ****** Cart ********
// Add product to wishlist
router.post("/wishlist/add", authMiddleware, addToWishlist);

// Get user's wishlist
router.get("/wishlists", authMiddleware, getWishlist);

// Remove product from wishlist
router.post("/wishlist/remove", authMiddleware, removeFromWishlist);

// Follow Unfollow User
router.put("/user/follow/:targetUserId", authMiddleware, toggleFollowUser);

// Get Related Products
router.get("/related/products/:productId", getRelatedProducts);

// Get Followed Sellers Products
router.get(
  "/followed-sellers/products",
  authMiddleware,
  getFollowedSellersProducts
);

// Buy Products
router.post("/buy-product", authMiddleware, createOrder);
router.post("/verify-payment", verifyPayment);
router.get("/customer-orders", authMiddleware, getUserOrders);
router.get("/seller-orders", authMiddleware, getSellerOrders);
router.patch(
  "/update-order-status/:orderId",
  authMiddleware,
  updateOrderStatus
);

router.put("/cancel/order/:orderId", authMiddleware, cancelOrder);
router.post(
  "/return-request",
  upload.array("paymentScreenshot", 5),
  authMiddleware,
  createReturnRequest
);
router.get(
  "/return-requests/seller",
  authMiddleware,
  getReturnRequestsForSeller
);

router.get("/addresses", authMiddleware, getUserAddresses);
router.post("/address", authMiddleware, createUserAddress);
router.put("/address/:addressId", authMiddleware, updateUserAddress);
router.delete("/address/:addressId", authMiddleware, deleteUserAddress);

// Notifications
router.get("/notifications", authMiddleware, getUserNotifications);
router.patch(
  "/notifications/mark-all-read",
  authMiddleware,
  markAllNotificationsAsRead
);

// Ratings and Reviews
router.post("/rating-reviews", authMiddleware, addReview);
router.get("/sellers-reviews", authMiddleware, getSellerReviews);

// Toggle Holiday Mode
router.put("/toggle-holiday", authMiddleware, toggleHolidayMode);

// Earning
router.get("/vendor-earnings", authMiddleware, getVendorEarnings);

// Chatting apis

// 📝 Send a message in a chat
router.post("/send-msg", authMiddleware, sendMessage);

// 💬 Get all messages in a chat
router.get("/messages/:receiverId", authMiddleware, getMessages);

// 📜 Get all chats of the logged-in user (Chat List in Sidebar)
router.get("/my-chats", authMiddleware, getUserChats);

// Chatting apis

router.get("/user/:userId", getUserByIdAndTheirProducts);
router.put(
  "/update-profile",
  authMiddleware,
  upload.single("profileImage"),
  editUserProfile
);

router.post("/user/change-password", authMiddleware, changePassword);

// Account Details
router.post("/account-detail", authMiddleware, createAccountDetails);
router.put("/account-detail", authMiddleware, updateAccountDetails);
router.get("/account-detail", authMiddleware, getAccountDetails);
router.delete("/account-detail", authMiddleware, deleteAccountDetails);

// show achievements
router.get("/achievements/:userId", getUserAchievements);
router.put("/achievement/seen/:userId", markAchievementPopupSeen);

// Testimonials
router.get("/testimonial", getTestimonials);

// 🔐 Protected Routes – require user login
router.post("/testimonial", authMiddleware, addTestimonial);
router.put(
  "/testimonial/:id",
  authMiddleware,
  adminMiddleware,
  updateTestimonial
);
router.delete(
  "/testimonial/:id",
  authMiddleware,
  adminMiddleware,
  deleteTestimonial
);

router.get("/followers-following/:userId", getFollowersAndFollowing);
router.post("/contact-form", createContactMessage);
router.get("/contact-form", getAllContactMessages);

module.exports = router;
