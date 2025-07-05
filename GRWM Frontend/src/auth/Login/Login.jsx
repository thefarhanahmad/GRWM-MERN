import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/auth/userSlice";
import { useNavigate } from "react-router-dom";
import { loginService, forgotPasswordService } from "../../services/auth/login";
import Img from "../../assets/Image/e-commerce-Background1.jpg";
import Logo from "../../assets/Logo/GRMW-Logo1.png";
import { Link } from "react-router-dom";
import { showToast, ToastComponent } from "../../components/Toast/Toast";
import GoogleLoginButton from "../GoogleLogin";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await loginService(email, password);

      console.log("✅ Login Response:", response);
      console.log("✅ Extracted User:", response?.user);
      console.log("✅ Extracted Role:", response?.user?.role);

      const { user, token } = response;

      if (!user || !token) {
        throw new Error("Invalid user data received.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch(loginSuccess({ user, token }));

      // showToast("success", "Login successful!");

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
      console.log("❌ Login Error:", err);
      setError(err.message);
      showToast("error", err.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  // Inside handleForgotPassword in Login.jsx
  const handleForgotPassword = async () => {
    if (!email) {
      showToast("error", "Please enter your email first!");
      return;
    }

    try {
      setLoading(true);
      const message = await forgotPasswordService(email);
      showToast("success", message || "Reset link sent to your email.");

      // ✅ Navigate to verify OTP page with email (optional)
      navigate("/reset-otp", { state: { email } });
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative sm:min-h-screen flex flex-col justify-start sm:justify-center sm:items-end sm:p-8">
      <img
        src={Img}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black opacity-50"></div>

      <div className="relative z-10 w-full sm:max-w-[450px] bg-white px-5 sm:px-10 pt-4 pb-8 rounded-sm  sm:mr-20">
        <div className="mb-4 sm:mb-10 flex justify-center">
          <Link to="/">
            <img src={Logo} alt="Logo" className="w-40" />
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-0"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 border border-black rounded-lg focus:outline-none focus:ring-0"
          />
        </div>

        <button
          onClick={handleLogin}
          className={`bg-black text-lg text-white py-3 px-4 rounded-sm w-full mt-4 transition transform hover:scale-105 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <div className="w-full">
          <GoogleLoginButton />
        </div>
        <div className="text-center mt-2">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-red-600 hover:underline text-md"
          >
            Forgot Password?
          </button>
        </div>

        <p className="text-md text-gray-800 text-center mt-2">
          Don't have an account?{" "}
          <Link to="/signup" className="text-black text-md font-medium">
            Sign Up
          </Link>
        </p>
      </div>

      <ToastComponent />
    </div>
  );
};

export default Login;
