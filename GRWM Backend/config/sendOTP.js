const OTP = require("../models/OTP");
const sendEmail = require("./sendEmail");

const sendOTPToEmail = async (email) => {
  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save or update OTP in DB
    await OTP.findOneAndUpdate(
      { email },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Format HTML message

    const message = `
<div style="background-color: #000000; color: #ffffff; padding: 30px; font-family: Arial, sans-serif; text-align: center; border-radius: 10px; max-width: 500px; margin: auto;">
  
  <img src="https://gwrm.netlify.app/assets/GRMW-Logo-D-2n0BYf.png" 
       alt="GRWM Logo" 
       style="max-width: 100px; height: auto; border-radius: 10px; margin-bottom: 10px;" />
  
  <h2 style="margin: 0 0 10px 0; font-size: 24px; color: #ffffff;">GRWM - OTP Verification</h2>
  
  <p style="font-size: 16px; margin: 10px 0; color: #ffffff;">
    Your One-Time Password (OTP) is:
  </p>
  
  <p style="font-size: 28px; font-weight: bold; margin: 20px 0; color: #ffffff;">
    ${otpCode}
  </p>
  
  <p style="font-size: 14px; margin: 10px 0; color: #ffffff;">
    This OTP is valid for <strong>5 minutes</strong>.
  </p>
  
  <hr style="margin: 30px 0; border: none; border-top: 1px solid #444;" />
  
  <p style="font-size: 12px; color: #aaaaaa; margin: 0;">
    If you did not request this, please ignore this email.
  </p>
</div>
`;

    // Send email
    await sendEmail(email, "Your OTP Code - GWRM", message);

    return { success: true };
  } catch (err) {
    console.error("Failed to send OTP:", err);
    return { success: false };
  }
};

// New: Send Welcome Email after verification
const sendWelcomeEmail = async (email, name) => {
  try {
    const message = `
      <div style="background-color: #000000; color: #ffffff; padding: 30px; font-family: Arial, sans-serif; text-align: center; border-radius: 10px; max-width: 500px; margin: auto;">
        <img src="https://gwrm.netlify.app/assets/GRMW-Logo-D-2n0BYf.png" 
             alt="GRWM Logo" 
             style="max-width: 100px; height: auto; border-radius: 10px; margin-bottom: 10px;" />
        <h2 style="margin: 0 0 10px 0; font-size: 24px; color: #ffffff;">Welcome to GRWM!</h2>
        <p style="font-size: 16px; margin: 10px 0; color: #ffffff;">
          Hi <strong>${name}</strong>, we’re thrilled to welcome you to the GRWM family!
        </p>
        <p style="font-size: 16px; margin: 10px 0; color: #ffffff;">
          We're excited to have you on board.
        </p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #444;" />
        <p style="font-size: 12px; color: #aaaaaa; margin: 0;">
          If you have any questions, feel free to reply to this email.
        </p>
      </div>
    `;

    await sendEmail(email, "Welcome to GRWM!", message);

    return { success: true };
  } catch (err) {
    console.error("Failed to send Welcome Email:", err);
    return { success: false };
  }
};

module.exports = { sendOTPToEmail, sendWelcomeEmail };
