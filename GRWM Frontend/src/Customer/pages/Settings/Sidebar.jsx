import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../../redux/auth/userSlice";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../../components/Toast/Toast";

const Sidebar = ({ name, setActivePage, profileImage, setSidebarOpen }) => {
  const [active, setActive] = useState("Personal Information");
  const [currentProfileImage, setCurrentProfileImage] = useState(profileImage);
  const [showModal, setShowModal] = useState(false);

  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    showToast("success", "Logged out successfully!");
    navigate("/");
  };

  const handleActive = (item) => {
    setActive(item);
    setActivePage(item);
  };

  useEffect(() => {
    setCurrentProfileImage(profileImage);
  }, [profileImage]);

  return (
    <div className="lg:w-80  p-4 mt-8 mb-8 space-y-8">
      <div className="p-4 bg-gray-50 lg:bg-white rounded-sm shadow-md flex items-center space-x-4">
        <img
          src={
            currentProfileImage ||
            "https://i.pinimg.com/736x/a4/d3/db/a4d3dbae52f3f640785979f090705ac2.jpg"
          }
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <p className="text-md text-gray-800">Welcome,</p>
          <h3 className="text-xl font-medium">{name}</h3>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-sm bg-gray-50 lg:bg-white shadow-md">
        <h3 className="text-[20px] text-gray-900">Account Settings</h3>
        <ul className="space-y-4 mt-4 text-gray-600 border-t border-gray-400">
          <li
            className={`mt-4 text-lg cursor-pointer ${
              active === "Personal Information"
                ? "text-black"
                : "hover:text-black"
            }`}
            onClick={() => handleActive("Personal Information")}
          >
            Personal Information
          </li>
          <li
            className={`text-lg cursor-pointer ${
              active === "Manage Addresses" ? "text-black" : "hover:text-black"
            }`}
            onClick={() => handleActive("Manage Addresses")}
          >
            Manage Addresses
          </li>
          <li
            className={`text-lg cursor-pointer ${
              active === "Change Password" ? "text-black" : "hover:text-black"
            }`}
            onClick={() => handleActive("Change Password")}
          >
            Change Password
          </li>
          <li
            className={`text-lg cursor-pointer ${
              active === "Payment Details " ? "text-black" : "hover:text-black"
            }`}
            onClick={() => handleActive("Payment Details ")}
          >
            Payment Details
          </li>

          <li
            className={`text-lg cursor-pointer ${
              active === "Discount Coupon" ? "text-black" : "hover:text-black"
            }`}
            onClick={() => handleActive("Discount Coupon")}
          >
            Discount Vouchers
          </li>

          <li
            className={`text-lg cursor-pointer ${
              active === "Help & Support" ? "text-black" : "hover:text-black"
            }`}
            onClick={() => handleActive("Help & Support")}
          >
            Help & Support
          </li>

          <li
            className={`text-lg cursor-pointer ${
              active === "Terms & Conditions"
                ? "text-black"
                : "hover:text-black"
            }`}
            onClick={() => handleActive("Terms & Conditions")}
          >
            Terms & Conditions
          </li>
        </ul>

        <button
          onClick={() => setShowModal(true)}
          className="mt-6  px-8 bg-black text-white py-2 rounded-lg text-lg  hover:opacity-80 transition duration-200"
        >
          Logout
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-medium text-gray-900">Are you sure?</h2>
            <p className="text-gray-700 mt-2">Do you really want to logout?</p>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="bg-black text-white px-4 py-2 rounded-lg  transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
