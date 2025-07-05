import axios from "axios";
import React, { useState, useEffect } from "react";

const DiscountCoupon = () => {
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const [coupons, setCoupons] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token"); // Replace with actual token

  // ✅ Fetch Coupons
  const fetchCoupons = async () => {
    try {
      const response = await axios.get(`${baseUrl}/get-coupon`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(response.data.data);
    } catch (err) {
      setError("Failed to fetch coupons.");
    }
  };

  // ✅ Add Coupon
  const addCoupon = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `${baseUrl}/add-coupon`,
        { code: couponCode, discount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCouponCode("");
      setDiscount("");
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add coupon.");
    }
    setLoading(false);
  };

  // ✅ Handle Delete Click (Show Confirmation Modal)
  const handleDeleteClick = (coupon) => {
    setSelectedCoupon(coupon);
    setDeleteModalOpen(true);
  };

  // ✅ Delete Coupon
  const deleteCoupon = async () => {
    if (!selectedCoupon) return;
    try {
      await axios.delete(`${baseUrl}/delete-coupon/${selectedCoupon._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteModalOpen(false);
      fetchCoupons();
    } catch (err) {
      setError("Failed to delete coupon.");
    }
  };

  // ✅ Load coupons on component mount
  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-md rounded-sm lg:ml-20 mt-8 relative">
      {/* 🔹 Add Coupon Button */}
      <button
        onClick={() => setModalOpen(true)}
        className="absolute right-8 px-5 py-3 bg-black text-white  rounded-lg shadow-md hover:bg-gray-800 transition"
      >
        + Add Coupons
      </button>

      {/* 🔹 Modal for Adding Coupon */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
          <div className="bg-white text-black p-6 rounded-lg w-96 shadow-lg animate-fade-in">
            <h3 className="text-2xl font-bold mb-4">Add Discount Coupon</h3>
            <form onSubmit={addCoupon} className="space-y-4">
              <input
                type="text"
                placeholder="Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
              />
              <input
                type="number"
                placeholder="Discount (%)"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
              />
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
                >
                  {loading ? "Adding..." : "Add Coupon"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔹 Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
          <div className="bg-white text-black p-6 rounded-lg w-96 shadow-lg animate-fade-in">
            <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedCoupon?.code}</strong>?
            </p>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={deleteCoupon}
                className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Error Message */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* 🔹 Coupons Listing */}
      <h3 className="text-sm md:text-3xl text-start font-semibold font-horizon mb-6 text-black">
        Coupons
      </h3>
      <div className="mt-9 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-6 gap-8">
        {coupons.map((coupon) => (
          <div
            key={coupon._id}
            className="p-5 bg-white shadow-lg rounded-lg items-center border border-gray-300"
          >
            <div>
              <h3 className="text-lg  mb-2 font-medium ">{coupon.code}</h3>
              <p className="text-black font-semibold">{coupon.discount}% Off</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleDeleteClick(coupon)}
                className="px-4 py-1 bg-black text-white rounded-md hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscountCoupon;
