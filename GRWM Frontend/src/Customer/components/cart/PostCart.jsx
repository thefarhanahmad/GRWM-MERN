import React from "react";
import axios from "axios";
import { SlBasket } from "react-icons/sl"; // ✅ Updated icon for mobile
import { useSelector } from "react-redux";
import { showToast } from "./ToastComponent";
import { useNavigate } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const PostCart = ({
  productId,
  quantity = 1,
  onSuccess,
  productTitle,
  productImage,
  productPrice,
  productSize,
  toShow,
}) => {
  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!productId) {
      showToast("error", "Invalid product ID");
      return;
    }

    if (!token) {
      showToast("error", "You must be logged in to add items to the cart.");
      return;
    }

    try {
      let cartItems = [];

      try {
        const cartResponse = await axios.get(`${BASE_URL}/cart/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cartResponse.data?.success) {
          cartItems = cartResponse.data?.data?.items || [];
        }
      } catch (error) {
        console.warn("Cart fetch failed, proceeding to add product.");
      }

      const isProductInCart = cartItems.some(
        (item) => item.product === productId
      );

      if (isProductInCart) {
        showToast("error", "This product is already in your cart.");
        return;
      }

      const response = await axios.post(
        `${BASE_URL}/cart/add`,
        { productId: productId.toString(), quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showToast("success", "Product added to cart successfully.", {
          id: productId,
          title: productTitle,
          image: productImage,
          price: productPrice,
          size: productSize,
        });

        if (onSuccess) onSuccess();
      } else {
        showToast(
          "error",
          response.data.message || "Failed to add product to cart."
        );
      }
    } catch (error) {
      console.error("Add to Cart Error:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Something went wrong. Please try again.";

      if (errorMessage.includes("verify your phone number")) {
        showToast("error", errorMessage);
        setTimeout(() => {
          navigate("/settings");
        }, 1000);
        return;
      }

      showToast("error", errorMessage);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      className=" border justify-center border-black text-black px-2 lg:px-4 py-2 rounded-lg hover:bg-black hover:text-white hover:shadow-lg transition duration-300 flex items-center gap-2"
    >
      {toShow ? (
        <span className="text-center  w-20 text-sm md:w-22 text-nowrap">
          Add to Cart
        </span>
      ) : (
        <>
          <span className="hidden sm:inline w-20 text-sm text-center md:w-22 text-nowrap">
            Add to Cart
          </span>
          <SlBasket className="inline sm:hidden text-2xl" />
        </>
      )}
    </button>
  );
};

export default PostCart;
