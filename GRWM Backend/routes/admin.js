const express = require("express");
const CategoryController = require("../controllers/categoryController");
const categoryDataController = require("../controllers/categoryDataController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middlewares/authMiddleware");
const brandController = require("../controllers/brandController");
const upload = require("../config/multer");
const {
  createItem,
  getItems,
  updateItem,
  deleteItem,
  getItemById,
} = require("../controllers/itemController");
const {
  createSlider,
  getSliders,
  updateSlider,
  deleteSlider,
} = require("../controllers/sliderController");
const {
  createCoupon,
  applyCoupon,
  deleteCoupon,
  getCoupon,
} = require("../controllers/couponController");
const {
  getAdminDashboardAnalytics,
  getUsersWithDeliveryStatsAndEarnings,
  toggleUserBlockStatus,
  deleteUser,
  listAllProducts,
  deleteProductById,
} = require("../controllers/adminDashboardController");
const {
  getAllReturnRequestsForAdmin,
  updateReturnRequestStatus,
} = require("../controllers/orderPaymentController");

const router = express.Router();

// ======= Slider Routes =======
router.post(
  "/slider",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  createSlider
);
router.get("/slider", getSliders);
router.put(
  "/slider/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateSlider
);
router.delete("/slider/:id", authMiddleware, adminMiddleware, deleteSlider);

// ======= Items Routes =======
router.post("/items", authMiddleware, adminMiddleware, createItem);
router.get("/items", getItems);
router.get("/items/:id", getItemById);
router.put("/items/:id", authMiddleware, adminMiddleware, updateItem);
router.delete("/items/:id", authMiddleware, adminMiddleware, deleteItem);

// ======= Category Routes =======
router.post(
  "/categories",
  authMiddleware,
  adminMiddleware,
  CategoryController.createCategory
);

router.get("/categories", CategoryController.getAllCategories);

router.get("/categories/:id", CategoryController.getCategoryById);
router.put("/categories/:categoryId", CategoryController.editCategory);
router.delete(
  "/categories/:id",
  authMiddleware,
  adminMiddleware,
  CategoryController.deleteCategory
);

// ======= Subcategory Routes =======

// Create a new subcategory under a specific category
router.post(
  "/subcategories",
  authMiddleware,
  adminMiddleware,
  CategoryController.createSubcategory
);

router.get("/subcategories", CategoryController.getAllSubcategories);

router.get("/subcategories/:id", CategoryController.getSubcategoryById);

router.put(
  "/subcategories/:subcategoryId",
  authMiddleware,
  adminMiddleware,
  CategoryController.editSubcategory
);
router.delete(
  "/subcategories/:id",
  authMiddleware,
  adminMiddleware,
  CategoryController.deleteSubcategory
);

// ======= Brand Routes =======
router.post(
  "/brands",
  authMiddleware,
  adminMiddleware,
  upload.single("brandLogo"),
  brandController.createBrand
);
router.get("/brands", brandController.getAllBrands);
router.get("/brands/:id", brandController.getBrandById);
router.put(
  "/brands/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("brandLogo"),
  brandController.updateBrand
);
router.delete(
  "/brands/:id",
  authMiddleware,
  adminMiddleware,
  brandController.deleteBrand
);

// *******Category Data ********
// Routes
router.post(
  "/section",
  authMiddleware,
  adminMiddleware,
  categoryDataController.createCategory
);
router.get("/section", categoryDataController.getAllCategories);
router.get("/section/:id", categoryDataController.getCategoryById);
router.put(
  "/section/:id",
  authMiddleware,
  adminMiddleware,
  categoryDataController.updateCategory
);
router.delete(
  "/section/:id",
  authMiddleware,
  adminMiddleware,
  categoryDataController.deleteCategory
);

// Remove boosted product
router.put(
  "/product/boost/:productId",
  authMiddleware,
  adminMiddleware,
  categoryDataController.removeProductFromCategory
);

// Discount Coupon
router.post("/add-coupon", authMiddleware, createCoupon);
router.get("/get-coupon", authMiddleware, getCoupon);
router.delete("/delete-coupon/:couponId", authMiddleware, deleteCoupon);
router.post("/apply-coupon", authMiddleware, applyCoupon);

// Dashboard analytics

router.get(
  "/dashboard-analytics",
  authMiddleware,
  adminMiddleware,
  getAdminDashboardAnalytics
);
router.get(
  "/all-users",
  authMiddleware,
  adminMiddleware,
  getUsersWithDeliveryStatsAndEarnings
);

router.put(
  "/user/:userId/toggle-block",
  authMiddleware,
  adminMiddleware,
  toggleUserBlockStatus
);
router.delete("/user/:userId", authMiddleware, adminMiddleware, deleteUser);

router.get(
  "/show-all-products",
  authMiddleware,
  adminMiddleware,
  listAllProducts
);
router.delete(
  "/product-dlt/:productId",
  authMiddleware,
  adminMiddleware,
  deleteProductById
);
router.get(
  "/all-return-requests",
  authMiddleware,
  adminMiddleware,
  getAllReturnRequestsForAdmin
);

router.put(
  "/return-request/:requestId/status",
  authMiddleware,
  adminMiddleware,
  updateReturnRequestStatus
);

module.exports = router;
