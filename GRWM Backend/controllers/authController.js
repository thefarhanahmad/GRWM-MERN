const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendWelcomeEmail, sendOTPToEmail } = require("../config/sendOTP");
const OTP = require("../models/OTP");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register a new user
exports.register = async (req, res) => {
  const { name, email, password, address } = req.body;

  // Manual validation
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long.",
    });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format.",
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with isVerified false
    const newUser = new User({
      name,
      email,
      password: hashedPassword,

      address,
    });

    await newUser.save();

    // Send OTP to email
    const { success } = await sendOTPToEmail(email);
    if (!success) {
      return res.status(500).json({
        success: false,
        message: "User created, but failed to send OTP. Try resending.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registered. OTP sent to email for verification.",
      data: {
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        isVerified: newUser.isVerified,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later.",
    });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // ✅ Check if user is verified
    if (!user.isVerified) {
      // Delete old OTPs
      await OTP.deleteMany({ email });

      // Send new OTP
      const { success } = await sendOTPToEmail(email);
      if (!success) {
        return res.status(500).json({
          success: false,
          message: "You are not verified yet. Failed to send OTP. Try again.",
        });
      }

      return res.status(401).json({
        success: false,
        message:
          "Your account is not verified. We've sent a new OTP to your email.",
        data: { email },
      });
    }

    // ✅ Verified → proceed to login
    const payload = {
      userId: user._id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    user.password = undefined;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Verify OTP and User
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  // Input check
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required.",
    });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified.",
      });
    }

    // Get OTP from DB
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired or does not exist.",
      });
    }

    // Match OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Delete OTP
    await OTP.deleteOne({ email });

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    // Don't expose password
    user.password = undefined;

    await sendWelcomeEmail(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "OTP verified. User is now verified and logged in.",
      data: {
        token,
        user,
      },
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified. Please login.",
      });
    }

    // Delete any existing OTP for clean slate
    await OTP.deleteMany({ email });

    // Send new OTP
    const { success } = await sendOTPToEmail(email);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: "Failed to resend OTP. Try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "New OTP sent to email.",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Try again later.",
    });
  }
};

// Forget password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Delete old OTPs
    await OTP.deleteMany({ email });

    // Send new OTP
    const { success } = await sendOTPToEmail(email);
    if (!success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Try again later.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Use it to reset your password.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required.",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long.",
    });
  }

  try {
    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete OTP
    await OTP.deleteOne({ email });

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Login with Google
exports.googleLogin = async (req, res) => {
  const { token } = req.body; // Frontend se Google ka ID token

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Google token is required.",
    });
  }

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Your Google Client ID from the Google Developer Console
    });

    // Payload se user data nikaal rahe hain
    const payload = ticket.getPayload();
    const { email, name, sub } = payload; // sub = Google ka unique user ID

    // Check if user already exists in DB
    let user = await User.findOne({ email });

    // Agar user nahi milta hai, toh naya user create karna
    if (!user) {
      user = new User({
        name,
        email,
        googleId: sub, // Store the Google ID
      });

      await user.save(); // Save the new user to the database
    }

    // Generate JWT token for authentication
    const authToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "15d",
      }
    );

    // Return response with JWT token and user data
    user.password = undefined; // Don't expose password

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        token: authToken,
        user,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};

// Verify Google User (Without OTP)
exports.verifyGoogleUser = async (req, res) => {
  const { email } = req.body;

  // ✅ Input validation
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required.",
    });
  }

  try {
    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ✅ Already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified.",
      });
    }

    // ✅ Mark user as verified
    user.isVerified = true;
    await user.save();

    // ✅ Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );

    user.password = undefined;
    await sendWelcomeEmail(user.email, user.name);

    return res.status(200).json({
      success: true,
      message: "User successfully verified.",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error("Google user verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again.",
    });
  }
};
