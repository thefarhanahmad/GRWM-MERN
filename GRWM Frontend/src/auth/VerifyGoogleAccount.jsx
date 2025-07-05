import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/auth/userSlice";
import { showToast } from "../components/Toast/Toast";

const API_BASE_URL = `${import.meta.env.VITE_BASE_URL}/auth/verify-google-user`;

const VerifyGoogleAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const email = location.state?.email;

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!email) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(API_BASE_URL, { email });
      const { success, data, message } = res?.data;

      if (!success) {
        setError(message || "Verification failed.");
        setLoading(false);
        return;
      }

      const { user, token } = data;

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
    } catch (err) {
      console.error("Verification error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-16 p-6 rounded-md shadow-md bg-white text-black font-sans">
      <h2 className="border-b border-gray-600 pb-2 text-xl font-semibold">
        Verify Your Google Account
      </h2>
      {email ? (
        <>
          <p className="mt-4">
            You are verifying the account associated with:{" "}
            <strong className="text-black">{email}</strong>
          </p>

          <div className="mt-6 flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="cursor-pointer"
            />
            <label htmlFor="terms" className="ml-3 cursor-pointer text-black">
              I accept the{" "}
              <a
                href="/terms&conditions"
                target="_blank"
                rel="noreferrer"
                className="underline text-black"
              >
                Terms and Conditions
              </a>
              .
            </label>
          </div>

          <button
            onClick={handleVerify}
            disabled={!accepted || loading}
            className={`mt-6 w-full py-3 font-bold rounded ${
              accepted && !loading
                ? "bg-black text-white cursor-pointer"
                : "bg-gray-600 text-gray-400 cursor-not-allowed"
            } transition-colors duration-300`}
          >
            {loading ? "Verifying..." : "Continue"}
          </button>

          {error && <p className="text-red-500 mt-4 font-semibold">{error}</p>}
        </>
      ) : (
        <p className="mt-4">Email not found. Please try logging in again.</p>
      )}
    </div>
  );
};

export default VerifyGoogleAccount;
