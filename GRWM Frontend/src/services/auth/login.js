import axios from "axios";


const loginService = async (email, password) => {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/auth/login`, 
            { email, password }
        );

        console.log("🔥 API Response:", response.data); // Debugging ke liye

        const { data } = response;
        if (!data || !data.data || !data.data.user || !data.data.token) {
            throw new Error("Invalid response format. Please check API.");
        }

        return { user: data.data.user, token: data.data.token }; // ✅ Fix: Corrected path
    } catch (error) {
        console.error("❌ API Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Something went wrong! Try again.");
    }
};


const forgotPasswordService = async (email) => {
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BASE_URL}/auth/forgot-password`,
            { email }
        );

        console.log("📧 Forgot Password API Response:", response.data);

        const { data } = response;
        if (!data || !data.message) {
            throw new Error("Invalid response from server.");
        }

        return data.message;
    } catch (error) {
        console.error("❌ Forgot Password Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to send reset email.");
    }
};




export { loginService, forgotPasswordService };

