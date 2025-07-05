import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/Logo/GRMW-Logo.png";
import { BsBag } from "react-icons/bs";
import { LuMail } from "react-icons/lu";
import TwitterLogo from "../../assets/Image/twitter_logo.png";
import {
  FaRegHeart,
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaCopy,
  FaRegCopy,
} from "react-icons/fa";

import { useSelector, useDispatch } from "react-redux";
import { showToast, ToastComponent } from "../Toast/Toast";
import { logout } from "../../redux/auth/userSlice";
import Top from "./Top";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { clearCart, fetchCartItems } from "../../redux/slices/cartSlice";
import {
  clearWishlist,
  fetchWishlistItems,
} from "../../redux/slices/wishlistSlice";
import { closeModal } from "../../redux/slices/modalSlice";
import { fetchNotifications } from "../../redux/slices/notificationSlice";
import toast from "react-hot-toast";
import { fetchAchievements } from "../../redux/slices/achievementSlice";

// import toast from "react-hot-toast";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const cartCount = useSelector((state) => state.cart.totalItems);
  const token = user?.token || localStorage.getItem("token");
  const lastUpdated = useSelector((state) => state.cart.lastUpdated);
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistUpdated = useSelector((state) => state.wishlist.lastUpdated);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const [isMobile, setIsMobile] = useState(false);
  const { list: achievements, popupList } = useSelector(
    (state) => state.achievements
  );

  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (user?._id && token && baseUrl) {
      dispatch(fetchAchievements({ userId: user._id, token, baseUrl }));
    }
  }, [user, token, baseUrl, dispatch]);
  useEffect(() => {
    if (popupList?.length > 0) {
      popupList.forEach((ach) => {
        toast.success(
          `${ach.title} Unlocked!\nYou have achieved this badge! Go check out what’s new in the Achievements tab.`,
          {
            icon: "🏅",
            duration: 5000,
          }
        );
      });
    }
  }, [popupList, token]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (token) {
      dispatch(fetchCartItems(token));
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      dispatch(fetchWishlistItems(token));
    }
  }, [token]);
  useEffect(() => {
    if (token && user) {
      dispatch(fetchNotifications(token));
    }
  }, [token, user]);

  useEffect(() => {
    setIsDropdownOpen(false);
  }, [user]);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(closeModal());
    dispatch(clearCart());
    dispatch(clearWishlist());
    navigate("/");
  };

  const [isShareOpen, setIsShareOpen] = useState(false);

  const toggleShareDropdown = () => {
    setIsShareOpen((prev) => !prev);
  };

  // invite friend
  const shareUrl = `${import.meta.env.VITE_SHARE_URL}`;
  const message = `Hey! Check out this amazing site and shop with me: ${shareUrl}`;

  const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`;
  const facebookLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl
  )}`;
  const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    message
  )}`;

  // 📋 Copy Link for Instagram
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    showToast("success", "Link copied!");
  };

  return (
    <div className="w-full flex flex-col">
      <Top />

      <nav className="w-full flex  bg-[#f1f2f3] place-items-end md:items-center gap-2 justify-between px-2  lg:px-6  py-2">
        {/* ✅ Sell Now Button - Left Side */}
        <div className="flex w-1/3 ">
          <Link
            to="/addproducts"
            className="bg-black text-white font-helveticaWorld max-xs:w-20 text-center text-nowrap px-2 sm:px-4 lg:px-6 py-1.5 sm:py-2 text-sm md:px-10 md:py-3 md:text-lg transition"
          >
            Sell Now
          </Link>
        </div>

        {/* ✅ Logo - Center */}
        <div className="w-1/3  flex items-center justify-center">
          <Link to="/">
            <img src={Logo} alt="GRMW Logo" className="w-20 sm:w-28 md:w-36" />
          </Link>
        </div>

        {/* ✅ Icons - Right Side */}
        <div
          className={`w-1/3  flex items-end font-helveticaWorld  md:items-center justify-end gap-4`}
        >
          <Link to={`/chat/buyer`}>
            <LuMail
              className="cursor-pointer flex max-xs:hidden hover:text-gray-600 transition"
              size={24}
            />
          </Link>

          <div className="relative flex max-xs:hidden">
            <Link to="/wishlist">
              <FaRegHeart
                className="cursor-pointer hover:text-gray-600 transition"
                size={24}
              />

              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-3 bg-black  text-white text-sm font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
          </div>

          <div className="relative flex max-xs:hidden">
            <Link to="/cart">
              <BsBag
                className="cursor-pointer hover:text-gray-600 transition"
                size={24}
              />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-black  text-white text-sm font-semibold rounded-full  w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* ✅ User Profile Dropdown */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <div
                className="w-8 h-8 flex p-5 items-center justify-center rounded-full bg-black hover:opacity-80 transition cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-white text-lg font-semibold">
                  {user?.email?.charAt(0)?.toUpperCase() || ""}
                </span>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-4 w-52 bg-white shadow-lg font-helveticaWorld rounded-md border border-gray-400 z-[1000]">
                  <Link
                    onClick={() => setIsDropdownOpen(false)}
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Profile
                  </Link>
                  <Link
                    onClick={() => setIsDropdownOpen(false)}
                    to="/addproducts"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Selling Hub
                  </Link>
                  <Link
                    onClick={() => setIsDropdownOpen(false)}
                    to="/purchases"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Purchases
                  </Link>
                  <Link
                    onClick={() => setIsDropdownOpen(false)}
                    to="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Settings
                  </Link>

                  <Link
                    onClick={() => setIsDropdownOpen(false)}
                    to="/orders"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Sold Products
                  </Link>
                  <Link
                    onClick={() => setIsDropdownOpen(false)}
                    to="/notifications"
                    className="px-4 py-2 flex gap-1 items-center text-gray-700 hover:bg-gray-100 transition"
                  >
                    Notifications{""}
                    {unreadCount > 0 && ` ( ${unreadCount} )`}
                  </Link>
                  <Link
                    onClick={() => setIsDropdownOpen(false)}
                    to="/balance"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Balance
                  </Link>

                  {/* 🔽 Invite Friends Inline Dropdown */}
                  <div>
                    <button
                      onClick={toggleShareDropdown}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition flex items-center justify-between"
                    >
                      <span>Invite Friends</span>
                      {isShareOpen ? (
                        <FiChevronUp className="ml-2 text-lg" />
                      ) : (
                        <FiChevronDown className="ml-2 text-lg" />
                      )}
                    </button>

                    {isShareOpen && (
                      <div className="flex flex-wrap items-center gap-4 pl-2 py-2 ml-1 border-gray-300 mt-1">
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-500 hover:scale-110 transition transform"
                          title="Share on WhatsApp"
                        >
                          <FaWhatsapp className="text-2xl" />
                        </a>

                        <a
                          href={facebookLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:scale-110 transition transform"
                          title="Share on Facebook"
                        >
                          <FaFacebookF className="text-2xl" />
                        </a>

                        <a
                          href={twitterLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-500 hover:scale-110 transition transform"
                          title="Share on Twitter"
                        >
                          <img src={TwitterLogo} alt="" className="h-7 w-7" />
                        </a>

                        {/* ✉️ Gmail Share */}
                        <a
                          href={`mailto:?subject=${encodeURIComponent(
                            "Check this out!"
                          )}&body=${encodeURIComponent(message)}`}
                          className="text-red-500 hover:scale-110 transition transform"
                          title="Share via Gmail"
                        >
                          <LuMail className="text-2xl" />
                        </a>

                        {/* Copy button */}
                        <button
                          onClick={handleCopyToClipboard}
                          className="text-gray-800 hover:scale-110 transition transform"
                          title="Share on Instagram"
                        >
                          <FaRegCopy className="text-xl" />
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 mt-1 bg-black text-white border-t border-gray-200 hover:bg-gray-900 transition rounded-b-md"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {!user && (
                <>
                  {!isMobile ? (
                    <div className="bg-black text-white px-2 text-nowrap lg:px-3 py-2 text-sm md:px-8 md:py-3 md:text-md transition flex space-x-1 lg:space-x-2">
                      <Link to="/signup" className="hover:underline">
                        Sign Up
                      </Link>
                      <span>/</span>
                      <Link to="/login" className="hover:underline">
                        Log In
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-black text-white max-xs:w-20 px-4 text-center text-nowrap lg:px-6 py-1.5 sm:py-2 text-sm md:px-10 md:py-3 md:text-md transition">
                      <Link to="/login" className="hover:underline">
                        Log In
                      </Link>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </nav>

      <ToastComponent />
    </div>
  );
};

export default Navbar;
