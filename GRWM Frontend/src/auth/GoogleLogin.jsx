import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toast/Toast";
import { loginSuccess } from "../redux/auth/userSlice";

const GoogleLoginButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const responseGoogle = async (response) => {
    // If there's an error with the Google login
    if (response.error) {
      console.error("Google login error:", response.error);
      showToast("error", "Google login failed, please try again.");
      return;
    }

    const token = response.credential;

    try {
      setLoading(true);
      setError(null);

      // Send the Google token to the backend
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/auth/google-login`,
        { token }
      );

      console.log("google login response:", res);
      const { success, message, data } = res.data;

      if (!success) {
        throw new Error(message || "Login failed");
      }

      const { user, token: authToken } = data;

      console.log("user google login", user);

      if (!user.isVerified) {
        return navigate("/verify-google-account", {
          state: { email: user.email },
        });
      }

      if (!user || !authToken) {
        throw new Error("Invalid user data received.");
      }

      // Save user data and token in localStorage
      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Dispatch login success action to Redux store
      dispatch(loginSuccess({ user, token: authToken }));

      // Redirect user based on role
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
    } catch (err) {
      console.error("Google Login Error:", err);
      setError(err.message);
      showToast("error", err.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center mt-4">
      <div className="w-full max-w-xs flex flex-col items-center gap-4">
        <GoogleLogin
          onSuccess={responseGoogle}
          onError={() => showToast("error", "Google login failed")}
          useOneTap
        />

        {loading && <p className="text-gray-600 text-sm">Logging in...</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default GoogleLoginButton;
