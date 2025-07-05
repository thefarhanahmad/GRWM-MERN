import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import PostWishlist from "../../components/wishlist/PostWishlist";
import PostCart from "../../components/cart/PostCart";
// import { ToastComponent } from "../../../components/Toast/Toast";
import BuyNowButton from "../../components/BuyNowButton/BuyNowButton";
import FollowButton from "../../components/button/FollowButton";
import { FiLoader } from "react-icons/fi";
import VendorOccasions from "./VendorOccasions";
import FollowersFollowingModal from "../../components/FollowersFollowingModal/FollowersFollowingModal";

import { useSelector } from "react-redux";
import ProductCard from "../../components/ProductCard";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const VendorProfile = () => {
  const { id } = useParams();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("products");
  const user = useSelector((state) => state.user.user);
  const [modalTab, setModalTab] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = (tab) => {
    setModalTab(tab);
    setModalOpen(true);
  };

  // Handler to close modal
  const closeModal = () => {
    setModalOpen(false);
    setModalTab(null);
  };

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/user/${id}`);
        console.log("Vendor Data:", response.data);
        console.log("Occasions Data:", response.data.occasions);
        setVendor(response.data);
      } catch (err) {
        setError("Failed to load vendor profile.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVendor();
    }
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-black text-5xl" />
      </div>
    );
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <>
      {/* <ToastComponent /> */}
      <div className="flex flex-col overflow-hidden">
        <div className="lg:pr-16 flex justify-between items-end">
          <div className="flex justify-start lg:w-3/4 lg:px-16 p-3 items-start lg:items-center gap-6 lg:gap-12 py-8 md:py-20">
            <img
              src={
                vendor.user?.profileImage ||
                "https://i.pinimg.com/736x/a4/d3/db/a4d3dbae52f3f640785979f090705ac2.jpg"
              }
              alt={vendor.user?.name}
              className="w-20  h-20 lg:h-36 lg:w-36 rounded-full object-cover border"
            />
            <div>
              <div className="flex gap-2 sm:gap-3 lg:gap-10  items-center">
                <h2 className="sm:text-xl text-lg text-nowrap md:text-3xl font-semibold">
                  {vendor.user?.name}
                </h2>
                <FollowButton vendorId={vendor.user._id} />
              </div>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => openModal("followers")}
                  className="font-semibold hover:underline cursor-pointer"
                >
                  {vendor.user?.followers?.length || 0} Followers
                </button>
                <button
                  onClick={() => openModal("following")}
                  className="font-semibold hover:underline cursor-pointer"
                >
                  {vendor.user?.following?.length || 0} Following
                </button>
              </div>

              {vendor.user?.ratings?.averageRating > 0 && (
                <div className="flex gap-1 mt-2 mb-1 items-center">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      xmlns="http://www.w3.org/2000/svg"
                      fill={
                        index < vendor.user?.ratings?.averageRating
                          ? "currentColor"
                          : "none"
                      }
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-4 h-4 text-gray-800"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"
                      />
                    </svg>
                  ))}
                </div>
              )}

              {vendor.user?.ratings?.averageRating > 0 && (
                <div className="font-bold mt-4 flex items-center gap-4">
                  <p className="bg-green-200 text-green-600 px-3 rounded-lg">
                    {vendor.user?.ratings?.averageRating} / 5
                  </p>
                  <p>{vendor.user?.ratings?.numberOfRatings} Reviews</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pb-20 lg:mx-16 px-3  gap-3 ">
        <div className="flex lg:gap-10 border-b border-black">
          <h2
            onClick={() => setActiveTab("products")}
            className={`cursor-pointer text-sm md:text-lg  font-normal pb-2 px-4 transition-all duration-300 
                        ${
                          activeTab === "products"
                            ? "border-b-2 border-black text-black font-semibold"
                            : "text-gray-600"
                        }
                        `}
          >
            Products
          </h2>

          <h2
            onClick={() => setActiveTab("occasions")}
            className={`cursor-pointer  text-sm md:text-lg  font-normal pb-2 px-4 transition-all duration-300 
                        ${
                          activeTab === "occasions"
                            ? "border-b-2 border-black text-black font-semibold"
                            : "text-gray-600"
                        }
                        `}
          >
            Occasions
          </h2>
        </div>

        {activeTab === "products" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-12">
            {vendor.products?.length > 0 ? (
              vendor.products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  user={user}
                  hideFollowBtn={true}
                />
              ))
            ) : (
              <p>No products available.</p>
            )}
          </div>
        ) : (
          <VendorOccasions
            token={user?.token}
            baseUrl={BASE_URL}
            vendorId={vendor?.user?._id}
          />
        )}
      </div>

      {modalOpen && (
        <FollowersFollowingModal
          vendorId={vendor.user._id}
          activeTab={modalTab}
          onClose={closeModal}
        />
      )}
    </>
  );
};

export default VendorProfile;
