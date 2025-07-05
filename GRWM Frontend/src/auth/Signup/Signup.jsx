import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import signupService from "../../services/auth/signup";
import Img from "../../assets/Image/e-commerce-Background1.jpg";
import Logo from "../../assets/Logo/GRMW-Logo1.png";
import { Link } from "react-router-dom";
import { showToast, ToastComponent } from "../../components/Toast/Toast";
import GoogleLoginButton from "../GoogleLogin";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async () => {
    try {
      setError(null);
      setLoading(true);

      const userData = { name, email, phone, password };

      console.log("📤 Sending data to API:", JSON.stringify(userData, null, 2));

      const response = await signupService(userData);
      console.log("✅ API Response:", response);

      if (response.success) {
        showToast("success", response.message);
        navigate("/verify-otp", { state: { email } });
      } else {
        setError(response.message || "Signup failed.");
        showToast("error", response.message || "Signup failed.");
      }
    } catch (err) {
      console.error("❌ Signup Error:", err);
      setError(err);
      showToast("error", err || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative sm:min-h-screen flex flex-col justify-start sm:justify-center sm:items-end sm:p-8">
      <div className="absolute inset-0">
        <img
          src={Img}
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <div className="relative z-10 w-full sm:max-w-[450px] bg-white px-5 sm:px-10 pt-4 pb-8 rounded-sm  sm:mr-20">
        <div className="mb-4 sm:mb-10 flex justify-center">
          <Link to="/">
            <img src={Logo} alt="Logo" className="w-32" />
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-0"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-0"
          />
          {/* <input
            type="tel"
            value={phone}
            maxLength={10}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-0"
          /> */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-0"
          />
        </div>

        <button
          onClick={handleSignup}
          className={`bg-black text-lg text-white py-3 px-4 rounded-sm w-full mt-4 transition transform hover:scale-105 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        <div className="w-full">
          <GoogleLoginButton />
        </div>
        <p className="text-md text-gray-800 text-center mt-1">
          Already have an account?{" "}
          <Link to="/login" className="text-black text-md font-medium">
            Login
          </Link>
        </p>
      </div>
      <ToastComponent />
    </div>
  );
};

export default Signup;
