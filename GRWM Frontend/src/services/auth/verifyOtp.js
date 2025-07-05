import axios from "axios";

const verifyOtpService = async (email, otp) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/auth/verify-otp`,
      { email, otp }
    );
    console.log("✅ OTP Verify Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ OTP Verify Error:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "OTP verification failed!"
    );
  }
};

export default verifyOtpService;
