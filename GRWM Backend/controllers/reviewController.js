const Review = require("../models/ReviewSchema");
const User = require("../models/User");

// ✅ Add a Review
exports.addReview = async (req, res) => {
  try {
    const { sellerId, rating, review } = req.body;
    const userId = req.user.userId; // Get logged-in user

    // Validation: Check required fields
    if (!sellerId || !rating) {
      return res.status(400).json({
        success: false,
        message: "Seller ID and rating are required.",
        data: null,
      });
    }

    // Ensure rating is a valid number between 1-5
    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5.",
        data: null,
      });
    }

    // Prevent self-review
    if (userId.toString() === sellerId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot review yourself.",
        data: null,
      });
    }

    // Check if the seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
        data: null,
      });
    }

    // Check if the user has already reviewed this seller
    const existingReview = await Review.findOne({
      reviewer: userId,
      seller: sellerId,
    });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this seller.",
        data: null,
      });
    }

    // Create and save new review
    const newReview = new Review({
      reviewer: userId,
      seller: sellerId,
      rating: parsedRating,
      review: review || "", // If no review is provided, store an empty string
    });

    await newReview.save();

    // Update seller's rating
    seller.ratings.totalRating += parsedRating;
    seller.ratings.numberOfRatings += 1;
    seller.ratings.averageRating =
      seller.ratings.totalRating / seller.ratings.numberOfRatings;

    await seller.save();

    return res.status(201).json({
      success: true,
      message: "Review added successfully.",
      data: newReview,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
};

// ✅ Get Seller Reviews (For Logged-in User)
exports.getSellerReviews = async (req, res) => {
  try {
    const sellerId = req.user.userId; // Get logged-in user's ID

    // Check if seller exists
    const seller = await User.findById(sellerId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found.",
        data: null,
      });
    }

    // Fetch all reviews for the logged-in user (seller)
    const reviews = await Review.find({ seller: sellerId }).populate(
      "reviewer",
      "name profileImage"
    );

    return res.status(200).json({
      success: true,
      message: "Seller reviews fetched successfully.",
      data: {
        reviews,
        averageRating: seller.ratings.averageRating.toFixed(1), // Format to 1 decimal
        totalReviews: seller.ratings.numberOfRatings,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      data: null,
    });
  }
};
