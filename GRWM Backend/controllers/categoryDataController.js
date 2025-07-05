const CategoryData = require("../models/CategoryData");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const BoostProduct = require("../models/BoostProduct");
const User = require("../models/User");
const { default: axios } = require("axios");

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { title, products, description } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Title is required.",
      });
    }

    const newCategory = new CategoryData({ title, products, description });
    await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Section created successfully.",
      data: newCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryData.find().populate({
      path: "products",
      populate: {
        path: "vendor",
        select: "_id name profileImage holidayMode",
      },
    });

    // Step 2: Filter out sold products and those with vendor on holiday
    const filteredCategories = categories.map((category) => {
      const filteredProducts = category.products.filter((product) => {
        const isSold = product.soldStatus === true;
        const isVendorOnHoliday = product.vendor?.holidayMode === true;
        return !isSold && !isVendorOnHoliday;
      });

      return {
        ...category.toObject(),
        products: filteredProducts,
      };
    });

    res.status(200).json({
      success: true,
      message: "Sections retrieved successfully.",
      length: filteredCategories.length,
      data: filteredCategories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// Get a single category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CategoryData.findById(id).populate("products");
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Section not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Section retrieved successfully.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// Update a category by ID
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, products, description } = req.body;

    const updatedCategory = await CategoryData.findByIdAndUpdate(
      id,
      { title, products, description },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Section not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Section updated successfully.",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

// Delete a category by ID
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await CategoryData.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({
        success: false,
        message: "Section not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Section deleted successfully.",
      data: deletedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

exports.removeProductFromCategory = async (req, res) => {
  try {
    const { productId } = req.params;
    const title = "Wardrobe Spotlight"; // Or get from req.body if needed

    console.log("Removing productId:", productId);

    // Validate inputs
    if (!title || !productId) {
      return res.status(400).json({
        success: false,
        message: "Title and Product ID are required.",
      });
    }

    // Check if productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID format.",
      });
    }

    // Find the category by title
    const category = await CategoryData.findOne({ title });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Section not found.",
      });
    }

    // Check if product exists in the category
    if (!category.products.includes(productId)) {
      return res.status(404).json({
        success: false,
        message: "Product not found in this section.",
      });
    }

    // Remove product from category's products array
    category.products = category.products.filter(
      (id) => id.toString() !== productId.toString()
    );

    await category.save();

    res.status(200).json({
      success: true,
      message: "Product removed from section successfully.",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.createBoostOrder = async (req, res) => {
  try {
    const { price, products, duration } = req.body;
    const userId = req.user.userId; // Get user ID from authenticated request

    // Validate input
    if (!products || products.length === 0 || !price || !duration) {
      return res.status(400).json({
        success: false,
        message: "Products, price, and duration are required.",
      });
    }

    const user = await User.findById(userId);

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    if (!user?.phoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your phone number before proceeding.",
      });
    }

    const merchantTransactionId = `boost_${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}`;

    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: userId.toString(),
      amount: price * 100,
      redirectUrl: `${process.env.PHONEPE_REDIRECT_URL}?txnId=${merchantTransactionId}&boost=true`,
      redirectMode: "GET",
      callbackUrl: process.env.PHONEPE_BOOST_CALLBACK_URL,
      mobileNumber: user.phone,
      paymentInstrument: { type: "PAY_PAGE" },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString(
      "base64"
    );
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;

    const xVerify =
      crypto
        .createHash("sha256")
        .update(base64Payload + "/pg/v1/pay" + saltKey)
        .digest("hex") +
      "###" +
      saltIndex;

    const response = await axios.post(
      `${process.env.PHONEPE_BASE_URL}/apis/pg-sandbox/pg/v1/pay`,
      { request: base64Payload },
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": process.env.PHONEPE_MERCHANT_ID,
        },
      }
    );

    if (
      !response.data.success ||
      !response.data.data?.instrumentResponse?.redirectInfo?.url
    ) {
      return res.status(500).json({
        success: false,
        message: "PhonePe order creation failed.",
        response: response.data,
      });
    }

    return res.status(200).json({
      success: true,
      txnId: merchantTransactionId,
      redirectUrl: response.data.data.instrumentResponse.redirectInfo.url,
    });
  } catch (error) {
    console.error("Error creating PhonePe boost order:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create boost order.",
      error: error.message,
    });
  }
};

exports.verifyPaymentAndBoost = async (req, res) => {
  try {
    const { txnId, products, duration, price } = req.body;
    const userId = req.user.userId;

    if (!txnId || !products || products.length === 0 || !duration || !price) {
      return res.status(400).json({
        success: false,
        message: "Missing transaction or product details.",
      });
    }

    const merchantId = process.env.PHONEPE_MERCHANT_ID;
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;

    const xVerify =
      crypto
        .createHash("sha256")
        .update(`/pg/v1/status/${merchantId}/${txnId}` + saltKey)
        .digest("hex") +
      "###" +
      saltIndex;

    const response = await axios.get(
      `${process.env.PHONEPE_BASE_URL}/apis/pg-sandbox/pg/v1/status/${merchantId}/${txnId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": xVerify,
          "X-MERCHANT-ID": merchantId,
        },
      }
    );

    const status = response?.data?.data?.state;
    if (status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed.",
      });
    }

    const validProducts = products.filter((id) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    if (validProducts.length !== products.length) {
      return res.status(400).json({
        success: false,
        message: "Some product IDs are invalid.",
      });
    }

    const foundProducts = await Product.find({ _id: { $in: validProducts } });
    if (foundProducts.length !== products.length) {
      return res.status(404).json({
        success: false,
        message: "Some products were not found.",
      });
    }

    const newBoost = new BoostProduct({
      userId,
      products: validProducts,
      plan: { duration, price },
    });

    await newBoost.save();

    await CategoryData.updateOne(
      {},
      { $pull: { products: { $in: validProducts } } }
    );

    await CategoryData.updateOne(
      {},
      { $push: { products: { $each: validProducts } } },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified, products boosted successfully!",
      boostData: newBoost,
    });
  } catch (error) {
    console.error("Error verifying boost payment:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};
