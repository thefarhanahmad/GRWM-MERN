import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Orders from "../Orders/Orders";
import SellProducts from "../SellProducts/SellProducts";
import Products from "../Seller_AllProducts/Products";
import StarRating from "../../components/profile/StarRating";
import ToggleHoliday from "../../components/profile/ToggleHoliday";
import OccassionProducts from "../../components/profile/OccassionProducts";
import BoostProducts from "../../components/profile/BoostProducts";
import Achievements from "../../components/profile/Achievements";
import FollowersFollowingModal from "../../components/FollowersFollowingModal/FollowersFollowingModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("all");
  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState("followers");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await axios.get(`${BASE_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data.data);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, navigate]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;
  console.log("profile  :", profile);
  return (
    <>
      <div className="lg:flex flex-col pt-10 md:pt-0">
        <div className="lg:pr-16  lg:flex justify-between items-end">
          <div className="flex flex-row  lg:justify-start w-full lg:px-16 lg:py-0 lg:mb-6 px-2 sm:pt-6 lg:pl-14 items-start lg:items-center gap-6 md:gap-10 lg:pt-20 lg:-b0">
            <img
              src={
                profile.profileImage ||
                "https://i.pinimg.com/736x/a4/d3/db/a4d3dbae52f3f640785979f090705ac2.jpg"
              }
              alt="Profile"
              className="w-20  h-20 lg:h-36 lg:w-36 rounded-full object-cover border"
            />
            <div>
              <h2 className="text-xl md:text-3xl font-semibold ">
                {profile.name}
              </h2>
              <div className="flex gap-4 mt-2">
                <span
                  className="font-semibold text-nowrap cursor-pointer hover:underline"
                  onClick={() => {
                    setModalActiveTab("followers");
                    setIsModalOpen(true);
                  }}
                >
                  {profile.followers.length} Followers
                </span>
                <span
                  className="font-semibold text-nowrap cursor-pointer hover:underline"
                  onClick={() => {
                    setModalActiveTab("following");
                    setIsModalOpen(true);
                  }}
                >
                  {profile.following.length} Following
                </span>
              </div>

              <div className="font-semibold mt-2">
                <StarRating rating={profile.ratings?.averageRating || 0} />
              </div>

              {profile.ratings?.averageRating > 0 && (
                <div className="font-bold mt-4 flex items-center gap-4">
                  <p className="bg-green-200 text-green-600 px-3 rounded-lg">
                    {profile?.ratings?.averageRating} / 5
                  </p>
                  <p>{profile.ratings?.numberOfRatings} Reviews</p>
                </div>
              )}
            </div>
          </div>
          <div>
            <ToggleHoliday token={token} baseUrl={BASE_URL} profile={profile} />
          </div>
        </div>
      </div>

      <div>
        <BoostProducts token={token} baseUrl={BASE_URL} profile={profile} />
      </div>

      <div>
        <Achievements token={token} baseUrl={BASE_URL} profile={profile} />
      </div>

      <div className="flex lg:mx-16 gap-5 border-b border-black mx-4 lg:gap-3 my-6">
        <button
          className={`lg:px-8 text-nowrap px-1 py-2 text-xs lg:text-lg rounded-sm ${
            activeSection === "all"
              ? " font-bold border-b border-black md:border-0"
              : ""
          }`}
          onClick={() => setActiveSection("all")}
        >
          {/* Show "All" on small screens, "All Products" on large */}
          <span className="block text-sm lg:hidden">All</span>
          <span className="hidden  lg:block">All Products</span>
        </button>

        <button
          className={`lg:px-8 text-nowrap px-1 py-2 text-sm lg:text-lg rounded-sm ${
            activeSection === "occassion"
              ? " font-bold border-b border-black md:border-0"
              : ""
          }`}
          onClick={() => setActiveSection("occassion")}
        >
          Occassions
        </button>

        <button
          className={`lg:px-8 text-nowrap px-1 py-2 text-sm lg:text-lg rounded-sm ${
            activeSection === "sell"
              ? " font-bold border-b border-black md:border-0"
              : ""
          }`}
          onClick={() => setActiveSection("sell")}
        >
          <span className="block text-sm lg:hidden">Sold</span>
          <span className="hidden lg:block">Sold Products</span>
        </button>

        <button
          className={`lg:px-8 text-nowrap px-1 py-2 text-sm lg:text-lg rounded-sm ${
            activeSection === "orders"
              ? " font-bold border-b border-black md:border-0"
              : ""
          }`}
          onClick={() => setActiveSection("orders")}
        >
          Purchases
        </button>
      </div>

      <div>
        {activeSection === "all" && <Products />}
        {activeSection === "occassion" && (
          <OccassionProducts token={token} baseUrl={BASE_URL} />
        )}
        {activeSection === "orders" && <Orders />}
        {activeSection === "sell" && <SellProducts />}
      </div>

      {isModalOpen && (
        <FollowersFollowingModal
          vendorId={profile._id}
          activeTab={modalActiveTab}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

export default Profile;
