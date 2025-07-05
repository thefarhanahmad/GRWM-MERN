import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import verifyOtpService from "../services/auth/verifyOtp";
import { showToast, ToastComponent } from "../components/Toast/Toast";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/auth/userSlice";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const dispatch = useDispatch();
  const handleVerify = async () => {
    if (!otp || !email) {
      showToast("error", "Please enter OTP & email is missing!");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyOtpService(email, otp);
      showToast("success", response.message || "OTP Verified!");

      const { user, token } = response;

      if (!user || !token) {
        throw new Error("Invalid user data received.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(loginSuccess({ user, token }));
      const role = user?.role?.toLowerCase();

      setTimeout(() => {
        if (role === "user") {
          navigate("/");
        } else if (role === "admin") {
          navigate("/admin/dashboard");
        } else {
          showToast("error", "Invalid role, contact support!");
        }
      }, 1000);
    } catch (error) {
      showToast("error", error.message || "OTP verification failed!");
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
      showToast(
        "success",
        response.data?.message || "OTP resent successfully!"
      );
    } catch (error) {
      console.error(
        "❌ Resend OTP Error:",
        error.response?.data || error.message
      );
      showToast(
        "error",
        error.response?.data?.message || "Failed to resend OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-center mb-6">Verify OTP</h2>
        <p className="text-center text-gray-600 mb-4">
          OTP sent to: <strong>{email}</strong>
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full p-3 border border-gray-400 rounded mb-4"
        />
        <button
          onClick={handleVerify}
          className={`bg-black text-white w-full py-3 rounded hover:bg-gray-800 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="text-center mt-4">
          <button
            onClick={handleResendOtp}
            className="text-red-600 hover:underline"
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

export default VerifyOtp;
