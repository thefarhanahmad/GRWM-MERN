import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { showToast, ToastComponent } from "../components/Toast/Toast";
import Img from "../assets/Image/e-commerce-Background1.jpg";
import Logo from "../assets/Logo/GRMW-Logo1.png";
import axios from "axios";
import { useLocation } from "react-router-dom";



const VerifyOtpResetPassword = () => {

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState(location?.state?.email || "");

    const handleResetPassword = async () => {
        if (!email || !otp || !newPassword) {
            showToast("error", "Please fill all fields!");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/auth/reset-password`,
                { email, otp, newPassword }
            );

            console.log("✅ Password Reset Response:", response.data);
            showToast("success", response.data?.message || "Password reset successful!");
            navigate("/login");
        } catch (err) {
            console.error("❌ Reset Error:", err.response?.data || err.message);
            showToast("error", err.response?.data?.message || "Failed to reset password.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (!email) {
            showToast("error", "Email is missing!");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/auth/resend-otp`,
                { email }
            );

            console.log("📨 Resend OTP Response:", response.data);
            showToast("success", response.data?.message || "OTP resent successfully!");
        } catch (error) {
            console.error("❌ Resend OTP Error:", error.response?.data || error.message);
            showToast("error", error.response?.data?.message || "Failed to resend OTP.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="relative min-h-screen flex flex-col justify-center sm:items-end p-6 sm:p-8">
            <img src={Img} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black opacity-50"></div>

            <div className="relative z-10 w-full sm:max-w-[450px] bg-white px-10 pt-4 pb-8 rounded-sm mx-auto sm:mr-20">
                <div className="mb-8 flex justify-center">
                    <img src={Logo} alt="Logo" className="w-40" />
                </div>

                <div className="flex flex-col gap-4">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Email"
                        className="w-full p-3 border border-black rounded-lg focus:outline-none"
                    />
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="Enter OTP"
                        className="w-full p-3 border border-black rounded-lg focus:outline-none"
                    />
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter New Password"
                        className="w-full p-3 border border-black rounded-lg focus:outline-none"
                    />
                </div>

                <button
                    onClick={handleResetPassword}
                    className={`bg-black text-lg text-white py-3 px-4 rounded-sm w-full mt-8 transition transform hover:scale-105 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={loading}
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
                <div className="text-center mt-4">
                    <button
                        onClick={handleResendOtp}
                        className="text-red-600 hover:underline text-md"
                        disabled={loading}
                    >
                        Resend OTP
                    </button>
                </div>

            </div>
            <ToastComponent />
        </div>
    );
};

export default VerifyOtpResetPassword;
