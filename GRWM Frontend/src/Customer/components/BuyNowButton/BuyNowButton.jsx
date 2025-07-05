import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { SlBag } from "react-icons/sl";
import { showToast } from "../../../components/Toast/Toast";

const BuyNowButton = ({ product, toShow }) => {
  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");
  const navigate = useNavigate();

  if (!product || !product._id) return null;

  const isSelfProduct = product.vendor && product.vendor._id === user?._id;

  const handleBuyNow = (e) => {
    if (!token) {
      e.preventDefault();
      showToast("error", "Please log in to continue.");
      setTimeout(() => {
        navigate("/login");
      }, 1000);
      return;
    }

    if (isSelfProduct) {
      e.preventDefault();
      showToast("error", "You cannot buy your own product.");
    }
  };

  return (
    <Link to={isSelfProduct || !token ? "#" : `/buynow/${product._id}`}>
      <button
        onClick={handleBuyNow}
        className=" border justify-center border-black text-black  px-2 lg:px-4 py-2 rounded-lg hover:bg-black hover:text-white hover:shadow-lg transition duration-300 flex items-center  gap-2"
      >
        {toShow ? (
          <span className="text-center  w-20 text-sm md:w-22 text-nowrap">
            Buy Now
          </span>
        ) : (
          <>
            <span className="hidden sm:inline w-20 text-sm md:w-22 text-nowrap">
              Buy Now
            </span>
            <SlBag className="inline sm:hidden text-2xl" />
          </>
        )}
      </button>
    </Link>
  );
};

export default BuyNowButton;
