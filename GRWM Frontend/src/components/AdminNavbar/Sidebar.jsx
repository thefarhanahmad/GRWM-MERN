import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AiOutlineDashboard,
  AiOutlineLogout,
  AiOutlineMenu,
  AiOutlineAppstore,
} from "react-icons/ai";
import { MdSlideshow, MdCategory } from "react-icons/md";
import { BiCategory, BiCategoryAlt } from "react-icons/bi";
import { ListOrderedIcon, User2, X } from "lucide-react";
import { FaProductHunt } from "react-icons/fa";

const Sidebar = ({ onLinkClick, toggleSidebar }) => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      setIsOpen(isDesktop);
      toggleSidebar(isDesktop);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [toggleSidebar]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    toggleSidebar(!isOpen);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
      toggleSidebar(false);
    }
    if (onLinkClick) onLinkClick();
  };

  return (
    <>
      {/* Always visible toggle icon on desktop */}
      <div className="hidden lg:block fixed top-4 left-4 z-[1001]">
        <button
          onClick={handleToggle}
          className={isOpen ? "text-white" : "text-black"}
        >
          <AiOutlineMenu size={28} />
        </button>
      </div>


      {/* Mobile Toggle Button */}
      {!isOpen && (
        <div className="lg:hidden fixed left-0 top-4 p-4 z-[1000]">
          <button onClick={handleToggle} className="text-white">
            <AiOutlineMenu size={28} />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen bg-black text-white z-[999] transition-all duration-300 flex flex-col overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        ${isOpen ? "w-full lg:w-72" : "w-0"} 
        lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-6 border-b border-gray-400">
          {/* Mobile close button */}
          <button
            onClick={handleToggle}
            className="text-white lg:hidden ml-auto"
          >
            <X size={28} />
          </button>
        </div>

        <ul className="mt-6 flex-grow">
          {isOpen && (
            <>
              <li className="px-4 py-3 hover:bg-gray-800 transition">
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-6"
                  onClick={handleLinkClick}
                >
                  <AiOutlineDashboard size={24} />
                  <span>Dashboard</span>
                </Link>
              </li>

              <li className="px-4 py-3 hover:bg-gray-800 transition">
                <Link
                  to="/admin/users"
                  className="flex items-center gap-6"
                  onClick={handleLinkClick}
                >
                  <User2 size={24} />
                  <span>User Management</span>
                </Link>
              </li>

              <li className="px-4 py-3 hover:bg-gray-800 transition">
                <Link
                  to="/admin/products"
                  className="flex items-center gap-6"
                  onClick={handleLinkClick}
                >
                  <FaProductHunt size={24} />
                  <span>Product Management</span>
                </Link>
              </li>

              <li className="px-4 py-3 hover:bg-gray-800 transition">
                <Link
                  to="/admin/return-orders"
                  className="flex items-center gap-6"
                  onClick={handleLinkClick}
                >
                  <ListOrderedIcon size={24} />
                  <span>Return Orders</span>
                </Link>
              </li>

              <li className="px-4 py-3 hover:bg-gray-800 transition">
                <Link
                  to="/admin/slider"
                  className="flex items-center gap-6"
                  onClick={handleLinkClick}
                >
                  <MdSlideshow size={24} />
                  <span>Slider</span>
                </Link>
              </li>

              <li className="px-4 py-3 hover:bg-gray-800 transition">
                <Link
                  to="/admin/menu"
                  className="flex items-center gap-6"
                  onClick={handleLinkClick}
                >
                  <AiOutlineAppstore size={24} />
                  <span>Menu</span>
                </Link>
              </li>

              <li className="px-4 py-3 hover:bg-gray-800 transition">
                <Link
                  to="/admin/categories"
                  className="flex items-center gap-6"
                  onClick={handleLinkClick}
                >
                  <BiCategory size={24} />
                  <span>Categories</span>
                </Link>
              </li>

              <li className="px-4 py-3 hover:bg-gray-800 transition">
                <Link
                  to="/admin/subcategories"
                  className="flex items-center gap-6"
                  onClick={handleLinkClick}
                >
                  <BiCategoryAlt size={24} />
                  <span>Sub Categories</span>
                </Link>
              </li>

              <li className="px-4 py-3 hover:bg-gray-800 transition">
                <Link
                  to="/admin/brand"
                  className="flex items-center gap-6"
                  onClick={handleLinkClick}
                >
                  <MdCategory size={24} />
                  <span>Brand</span>
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Logout Button */}
        <div className="px-4 py-3 mt-auto hover:bg-gray-800 transition">
          <button className="flex items-center gap-4 w-full text-left text-red-400">
            {isOpen && <AiOutlineLogout size={24} />}
            {isOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Overlay on mobile + dashboard + sidebar open */}
      {isOpen &&
        window.innerWidth < 1024 &&
        location.pathname === "/admin/dashboard" && (
          <div className="fixed inset-0 bg-black opacity-80 z-[998]"></div>
        )}
    </>
  );
};

export default Sidebar;
