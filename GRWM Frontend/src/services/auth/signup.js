import axios from "axios";

const signupService = async (userData) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/auth/register`,
      userData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Something went wrong!",
    };
  }
};

export default signupService;
