const express = require("express");
const {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  googleLogin,
  verifyGoogleUser,
} = require("../controllers/authController");
const {
  sendPhoneOTP,
  verifyPhoneOTP,
} = require("../controllers/smsController");

const router = express.Router();

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/verify-otp", verifyOtp);
router.post("/verify-google-user", verifyGoogleUser);
router.post("/resend-otp", resendOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/send-phone-otp", sendPhoneOTP);
router.post("/verify-phone-otp", verifyPhoneOTP);

module.exports = router;
