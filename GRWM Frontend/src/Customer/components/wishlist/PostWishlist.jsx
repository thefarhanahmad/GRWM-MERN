import React from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { CiHeart } from "react-icons/ci";
import { showToast } from "./ToastComponent";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const PostWishlist = ({
  productId,
  productTitle,
  productImage,
  productPrice,
  productSize,
}) => {
  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");
  const navigate = useNavigate();

  const addToWishlist = async () => {
    if (!token) {
      showToast("error", "You must be logged in to add items to the wishlist.");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/wishlist/add`,
        { productId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Wishlist Response:", response.data); // Debugging ke liye

      if (response.data.success) {
        showToast("success", "Added to Favorites!", {
          id: productId,
          title: productTitle,
          image: productImage,
          price: productPrice,
          size: productSize,
        });
      } else {
        showToast(
          "error",
          response.data.message || "Failed to add to wishlist."
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to add to wishlist.";

      console.error("Error adding to wishlist:", error.response?.data || error);

      showToast("error", message);

      // ✅ Redirect if message mentions phone verification
      if (message.toLowerCase().includes("verify your phone number")) {
        setTimeout(() => {
          navigate("/settings");
        }, 1000); // Delay for toast visibility
      }
    }
  };

  return (
    <button
      onClick={addToWishlist}
      className="absolute bottom-6 right-6 bg-white p-2 rounded-full shadow-lg"
    >
      <CiHeart size={24} className="text-black font-bold" />
    </button>
  );
};

export default PostWishlist;
