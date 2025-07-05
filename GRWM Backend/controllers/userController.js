const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const bcrypt = require("bcryptjs");

// Controller to fetch user profile
exports.getUserProfile = async (req, res) => {
  try {
    // Find the user by their ID (which was added to req.user after token verification)
    const user = await User.findById(req.user.userId).select("-password"); // Exclude password from response

    // If no user is found, send a 404 error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
      });
    }

    console.log("User profile fetched successfully:", user);
    // Send a successful response with the user data
    return res.status(200).json({
      success: true,
      message: "User profile retrieved successfully.",
      data: user,
    });
  } catch (error) {
    // Handle any server errors
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

// Follow/Unfollow a user
exports.toggleFollowUser = async (req, res) => {
  try {
    const loggedInUserId = req.user.userId; // Assuming user is authenticated
    const { targetUserId } = req.params;

    // Validation
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target user ID.",
      });
    }

    if (loggedInUserId === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow/unfollow yourself.",
      });
    }

    // Find both users
    const loggedInUser = await User.findById(loggedInUserId);
    const targetUser = await User.findById(targetUserId);

    if (!loggedInUser || !targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if already following
    const isFollowing = loggedInUser.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow user
      loggedInUser.following = loggedInUser.following.filter(
        (id) => id.toString() !== targetUserId
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== loggedInUserId
      );

      await loggedInUser.save();
      await targetUser.save();

      return res.status(200).json({
        success: true,
        message: "User unfollowed successfully.",
        data: {
          myProfile: {
            following: loggedInUser.following,
          },
          targetUser: {
            followers: targetUser.followers,
          },
        },
      });
    } else {
      // Follow user
      loggedInUser.following.push(targetUserId);
      targetUser.followers.push(loggedInUserId);

      await loggedInUser.save();
      await targetUser.save();

      return res.status(200).json({
        success: true,
        message: "User followed successfully.",
        data: {
          myProfile: {
            following: loggedInUser.following,
          },
          targetUser: {
            followers: targetUser.followers,
          },
        },
      });
    }
  } catch (error) {
    console.error("Error toggling follow status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// Controller to toggle holiday mode
exports.toggleHolidayMode = async (req, res) => {
  try {
    // Find the user by their ID (extracted from req.user after token verification)
    const user = await User.findById(req.user.userId);

    // If user is not found, return a 404 error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
        data: null,
      });
    }

    // Toggle the holidayMode value
    user.holidayMode = !user.holidayMode;

    // Save the updated user document
    await user.save();

    // Return the updated status
    return res.status(200).json({
      success: true,
      message: `Holiday mode ${
        user.holidayMode ? "enabled" : "disabled"
      } successfully.`,
      data: { holidayMode: user.holidayMode },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

exports.getUserByIdAndTheirProducts = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId format (if using MongoDB ObjectId)
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Find user by ID
    const user = await User.findById(userId).select(
      "-password -role -isVerified -holidayMode"
    );
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch user's products
    const userProducts = await Product.find({ vendor: user._id });

    // Send success response
    res.status(200).json({
      success: true,
      message: "Data fetched successfully",
      user,
      productsLength: userProducts.length,
      products: userProducts,
    });
  } catch (error) {
    console.error("Error fetching user and their products:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

exports.editUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone } = req.body;
    const updateFields = {};

    // Only update fields that are provided
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;

    // Handle profile image upload to Cloudinary
    if (req.file && req.file.path) {
      updateFields.profileImage = req.file.path;
    }

    // Check if there's anything to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No valid fields provided for update.",
      });
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, select: "-password" } // Return updated user without password
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        msg: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      msg: "Internal server error.",
      error: error.message,
    });
  }
};

// Controller to change user password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Check if both old and new passwords are provided
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old and new password are required.",
      });
    }

    // Find the user by their ID
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old password.",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password in the database
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// Get followers and following of a user by ID
exports.getFollowersAndFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(userId)
      .populate("followers", "name email profileImage") // You can customize the fields
      .populate("following", "name email profileImage");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Followers and following retrieved successfully.",
      data: {
        followers: user.followers,
        following: user.following,
      },
    });
  } catch (error) {
    console.error("Error fetching followers/following:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};
