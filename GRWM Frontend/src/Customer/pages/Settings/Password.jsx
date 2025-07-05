import React, { useState } from "react";
import axios from "axios";
import { FiLoader } from "react-icons/fi";
import { useSelector } from "react-redux";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Password = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    setLoading(true);

    axios
      .post(
        `${import.meta.env.VITE_BASE_URL}/user/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((response) => {
        toast.success("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      })
      .catch((error) => {
        console.error("Password update error:", error);
        toast.error(
          error.response?.data?.message || "Failed to update password."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="bg-white p-6 rounded-sm shadow-md lg:mx-16 mx-auto mt-8">
      <ToastContainer />
      <h3 className="text-sm md:text-3xl text-start font-semibold font-horizon mb-6 text-black">
        Change Password
      </h3>
      <form onSubmit={handleSubmit} className="space-y-5 mb-1">
        <input
          type="password"
          placeholder="Old Password"
          className="w-full border border-black p-3 rounded-md focus:outline-none"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          className="w-full border border-black p-3 rounded-md focus:outline-none"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full border border-black p-3 rounded-md focus:outline-none"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-black text-white p-3 mt-6 rounded-lg hover:bg-gray-800 transition"
          disabled={loading}
        >
          {loading ? (
            <FiLoader className="animate-spin mx-auto" />
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </div>
  );
};

export default Password;
