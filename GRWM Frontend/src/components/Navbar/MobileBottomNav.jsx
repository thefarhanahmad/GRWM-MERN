import React from "react";
import { Link } from "react-router-dom";
import { BsBag } from "react-icons/bs";
import { LuMail } from "react-icons/lu";
import { FaRegHeart, FaHome } from "react-icons/fa";
import { useSelector } from "react-redux";

const MobileBottomNav = () => {
  const cartCount = useSelector((state) => state.cart.totalItems);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  return (
    <div className="fixed bottom-0 font-helveticaWorld  left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-md max-xs:block hidden">
      <div className="flex justify-between items-center py-2 px-3">
        {/* 🏠 Home */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <Link
            to="/"
            className="flex flex-col justify-center relative items-center hover:text-gray-600 transition"
          >
            <FaHome size={22} />
            <span className="text-xs mt-1">Home</span>
          </Link>
        </div>

        {/* 💬 Chat */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <Link
            to="/chat/buyer"
            className="flex flex-col justify-center relative items-center hover:text-gray-600 transition"
          >
            <LuMail size={24} />
            <span className="text-xs mt-1">Chat</span>
          </Link>
        </div>

        {/* ❤️ Wishlist */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <Link
            to="/wishlist"
            className="flex flex-col justify-center relative items-center hover:text-gray-600 transition"
          >
            <FaRegHeart size={24} />
            {wishlistItems.length > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {wishlistItems.length}
              </span>
            )}
            <span className="text-xs mt-1">Wishlist</span>
          </Link>
        </div>

        {/* 🛍 Cart */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          <Link
            to="/cart"
            className="flex flex-col justify-center relative items-center hover:text-gray-600 transition"
          >
            <BsBag size={24} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
            <span className="text-xs mt-1">Cart</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
