import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../../redux/auth/userSlice";
import { showToast, ToastComponent } from "../../../components/Toast/Toast";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FollowButton = ({ vendorId, largeBtn }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  const userFollowing = Array.isArray(user?.following) ? user.following : [];

  useEffect(() => {
    if (vendorId) {
      setIsFollowing(userFollowing.includes(vendorId));
    }
  }, [vendorId, userFollowing]);

  const handleFollowToggle = async () => {
    if (!vendorId) {
      console.error("Vendor ID is missing!");
      return;
    }

    if (!token) {
      showToast("error", "Please log in to follow Sellers.");
      setTimeout(() => navigate("/login"), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(
        `${BASE_URL}/user/follow/${vendorId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const updatedFollowing =
          response.data?.data?.myProfile?.following || [];

        if (!Array.isArray(updatedFollowing)) {
          console.error(
            "API returned an invalid following list:",
            updatedFollowing
          );
          return;
        }

        setIsFollowing(updatedFollowing.includes(vendorId));
        dispatch(updateUser(response.data.data.myProfile));
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "An error occurred. Please try again.";
      showToast("error", errorMessage);
      console.error("API Error:", error.response?.data || error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <ToastComponent />
      <div className={`${largeBtn ? "" : "text-sm"} p-1 sm:p-2 `}>
        <button
          onClick={handleFollowToggle}
          className={` px-2 lg:px-3 py-1 rounded-md border transition ${
            isFollowing
              ? "bg-white text-black border-black hover:bg-black hover:text-white"
              : "bg-black text-white border-black hover:bg-white hover:text-black"
          }`}
          disabled={loading}
        >
          {loading ? "Processing..." : isFollowing ? "Unfollow" : "Follow"}
        </button>
      </div>
    </>
  );
};

export default FollowButton;
