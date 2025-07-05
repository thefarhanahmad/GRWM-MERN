const OTP = require("../models/OTP");
const User = require("../models/User");
const twilioClient = require("../config/twilioClient");

// Send SMS with OTP
exports.sendPhoneOTP = async (req, res) => {
  const { phone } = req.body;

  console.log("pone in sms sent : ", phone);

  if (!phone) {
    return res
      .status(400)
      .json({ success: false, message: "Phone number is required." });
  }

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save or update OTP in DB
    await OTP.findOneAndUpdate(
      { phone },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send SMS using Twilio
    await twilioClient.messages.create({
      body: `📱 To verify your phone number on GRWM, use this code: ${otpCode}. It’s valid for 5 minutes. Never share this code with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone.startsWith("+91") ? phone : `+91${phone}`,
    });

    return res
      .status(200)
      .json({ success: true, message: "OTP sent to phone number." });
  } catch (err) {
    console.error("Error sending phone OTP:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP." });
  }
};

// Verify phone OTP
exports.verifyPhoneOTP = async (req, res) => {
  const { phone, otp } = req.body;
  console.log("phone in sms verify : ", phone, otp);

  if (!phone || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Phone and OTP are required." });
  }

  try {
    // Check OTP in DB (stored with full +91 format)
    const otpRecord = await OTP.findOne({ phone });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "OTP not found or expired." });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }

    // Remove +91 prefix before checking in User model
    const plainPhone = phone.replace(/^\+91/, "");

    // Update phoneVerified flag in user document
    const user = await User.findOneAndUpdate(
      { phone: plainPhone },
      { phoneVerified: true },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Delete OTP record after successful verification
    await OTP.deleteOne({ phone });

    return res.status(200).json({
      success: true,
      message: "Phone number verified successfully.",
      data: { user },
    });
  } catch (err) {
    console.error("Error verifying OTP:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
