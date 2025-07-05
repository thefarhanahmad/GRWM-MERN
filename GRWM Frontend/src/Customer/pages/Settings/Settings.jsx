import React, { useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import Personal from "./Personal";
import Address from "./Address";
import Password from "./Password";
import HelpCenter from "./HelpCenter";
import TermsCondition from "./TermsCondition";
import DiscountCoupon from "./DiscountCoupon";
import PaymentHistory from "./PaymentHistroy";

const Settings = () => {
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [activePage, setActivePage] = useState("Personal Information");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const renderPage = useCallback(() => {
    switch (activePage) {
      case "Personal Information":
        return <Personal setName={setName} setProfileImage={setProfileImage} />;
      case "Manage Addresses":
        return <Address />;
      case "Change Password":
        return <Password />;
      case "Payment Details ":
        return <PaymentHistory />;
      case "Help & Support":
        return <HelpCenter />;
      case "Discount Coupon":
        return <DiscountCoupon />;
      case "Terms & Conditions":
        return <TermsCondition />;
      default:
        return null;
    }
  }, [activePage]);

  return (
    <>
      {/* Hamburger Icon (Mobile Only & hidden when sidebar open) */}
      {!sidebarOpen && (
        <button
          className="lg:hidden absolute top-40 left-4 z-30 bg-white p-2 rounded shadow"
          onClick={toggleSidebar}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      <div className="lg:flex bg-gray-100  lg:px-16 font-helveticaWorld min-h-screen relative">
        {/* Sidebar */}
        <div
          className={`
            z-20 lg:relative bg-white lg:bg-inherit w-full rounded lg:rounded-none lg:w-auto
            fixed top-0 left-0 h-full overflow-y-auto
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:flex
          `}
        >
          <Sidebar
            name={name || "Guest"}
            profileImage={profileImage}
            setActivePage={(page) => {
              setActivePage(page);
              setSidebarOpen(false);
            }}
            setSidebarOpen={setSidebarOpen}
          />

          {/* Close Icon */}
          <button
            className="lg:hidden p-4 absolute top-0 right-0 z-30"
            onClick={() => setSidebarOpen(false)}
          >
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Overlay for mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black opacity-50 z-10 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 pt-20 font-openSans lg:pt-4 z-0">
          {renderPage()}
        </div>
      </div>
    </>
  );
};

export default Settings;
