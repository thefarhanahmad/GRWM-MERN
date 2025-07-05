const express = require("express");
const productController = require("../controllers/productController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../config/multer");
const {
  boostProduct,
  createBoostOrder,
  verifyPaymentAndBoost,
} = require("../controllers/categoryDataController");

const router = express.Router();

// ************* Products ************
router.post(
  "/product",
  authMiddleware,
  upload.array("images", 10),
  productController.createProduct
);
router.get("/all-products", productController.getAllProducts);
router.get("/product/:id", productController.getProductById);
router.put(
  "/product/:id",
  authMiddleware,

  upload.array("images", 10),
  productController.updateProduct
);
router.delete("/product/:id", authMiddleware, productController.deleteProduct);

router.get(
  "/vendor-products",
  authMiddleware,
  productController.getProductsByVendor
);
router.get("/products", productController.getProductsByQuery);
router.get("/search", productController.searchProducts);
router.get("/get-Occasions", productController.getOccasionsWithLatestImages);
// Get own products by occasisom
router.get(
  "/own-products-by-occasion",
  authMiddleware,
  productController.getOwnProductsByOccasion
);
router.get(
  "/user-occassion-products/:userId",
  productController.getUserProductsByOccasion
);

// router.post("/product/boost/:productId", authMiddleware, boostProduct);

router.post("/create-boost-order", authMiddleware, createBoostOrder);
router.post("/payment-boost", authMiddleware, verifyPaymentAndBoost);

module.exports = router;
