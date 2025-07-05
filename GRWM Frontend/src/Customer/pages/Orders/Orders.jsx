import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TestimonialModal from "../../components/TestimonialModal/TestimonialModal";
import { FiPlus } from "react-icons/fi";
import ReturnModal from "../../components/ReturnModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Orders = () => {
  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [orderToReturn, setOrderToReturn] = useState(null);


  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/customer-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await axios.put(
        `${BASE_URL}/cancel/order/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setOrders((prevOrders) =>
        prevOrders.filter((order) => order._id !== orderId)
      );
    } catch (error) {
      console.error(
        "Error cancelling order:",
        error.response?.data || error.message
      );
    }
  };

  const handleSubmitReview = async () => {
    if (!selectedOrder) return;

    if (!rating || rating < 1) {
      toast.error("Please select a rating.");
      return;
    }

    if (!review.trim()) {
      toast.error("Please write a review.");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/rating-reviews`,
        {
          sellerId: selectedOrder.vendor_id,
          rating,
          review,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(response.data.message || "Review submitted successfully");
      setShowModal(false);
      setRating(0);
      setReview("");
      setSelectedOrder(null);
    } catch (error) {
      const errMsg = error.response?.data?.message || "Error submitting review";
      toast.error(errMsg);
      console.error("Error submitting review:", errMsg);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto lg:px-16 p-4 pb-20">
      <ToastContainer />
      <h2 className="text-sm md:text-3xl text-start font-semibold font-horizon mb-6 text-black">
        My Orders (
        {
          orders.filter(
            (order) =>
              order.deliveryStatus.toLowerCase() === "pending" ||
              order.deliveryStatus.toLowerCase() === "delivered"
          ).length
        }
        )
      </h2>

      {orders.filter(
        (order) => order.deliveryStatus.toLowerCase() === "pending" ||
          order.deliveryStatus.toLowerCase() === "delivered"
      ).length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white shadow-md border border-gray-400 rounded-xl p-6">
          <p className="text-black text-2xl font-semibold mb-6">
            No  orders found.
          </p>
          <Link
            to="/"
            className="bg-black text-white px-10 py-3 rounded-md hover:bg-gray-900 transition-transform transform hover:scale-105"
          >
            Shop Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {orders
            .filter((order) => order.deliveryStatus.toLowerCase() === "pending")
            .map((order) => (
              <div
                key={order._id}
                className="rounded-sm overflow-hidden shadow-lg font-helveticaWorld bg-white"
              >
                <Link
                  to={`/product/details/${order.product_id?._id}`}
                  className="block"
                >
                  <img
                    src={order.product_id?.images[0]}
                    alt={order.product_id?.title}
                    className="w-full h-[380px] object-cover"
                  />
                </Link>
                <div className="p-4">
                  <div className="flex justify-between">
                    <h3 className="text-md font-semibold truncate">
                      {order.product_id?.title}
                    </h3>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full 
                      ${order.deliveryStatus === "Pending"
                          ? "bg-yellow-200 text-yellow-700"
                          : order.deliveryStatus === "Cancelled"
                            ? "bg-red-100 text-red-600"
                            : "bg-green-100 text-green-600"
                        }`}
                    >
                      {order.deliveryStatus.charAt(0).toUpperCase() +
                        order.deliveryStatus.slice(1).toLowerCase()}
                    </span>
                  </div>

                  <p className="text-lg font-semibold mt-1">₹{order.amount}</p>

                  <div className="text-sm text-gray-500">
                    {order.deliveryAddress?.city}
                    {order.deliveryAddress?.city &&
                      order.deliveryAddress?.state &&
                      ", "}
                    {order.deliveryAddress?.state}
                  </div>
                  <div className="mt-2">
                    <button
                      className="text-red-600 border border-red-600 w-full py-1 rounded-md hover:bg-red-600 hover:text-white transition-all duration-200"
                      onClick={() => {
                        setOrderToCancel(order._id);
                        setShowCancelConfirm(true);
                      }}
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4 space-x-10">
                    <button
                      className="w-full text-sm flex items-center justify-center gap-1 px-3 py-2 border border-black text-black rounded-md hover:bg-black hover:text-white transition-all duration-200"
                      onClick={() => {
                        setSelectedOrder(order);
                        setRating(0);
                        setReview("");
                        setShowModal(true);
                      }}
                    >
                      <FiPlus className="text-sm" /> Review
                    </button>

                    <button
                      className="w-full text-sm flex items-center justify-center gap-1 px-3 py-2 border border-black text-black rounded-md hover:bg-black hover:text-white transition-all duration-200"
                      onClick={() => {
                        setShowTestimonialModal(true);
                        setShowModal(false);
                      }}
                    >
                      <FiPlus className="text-sm" /> Testimonial
                    </button>


                  </div>
                  {/* ✅ Return Button */}
                  <button
                    className="w-full text-sm mt-6 flex items-center justify-center gap-1 px-3 py-2 border border-black text-black rounded-md hover:bg-black hover:text-white transition-all duration-200"
                    onClick={() => {
                      setOrderToReturn(order);
                      setShowReturnModal(true);
                     
                    }}
                     
                  >
                    Return
                  </button>

                </div>
              </div>
            ))}
        </div>
      )}

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
            <h3 className="text-lg mb-4">
              Are you sure you want to cancel this order?
            </h3>
            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => {
                  setShowCancelConfirm(false);
                  setOrderToCancel(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-black text-white"
                onClick={() => {
                  cancelOrder(orderToCancel);
                  setShowCancelConfirm(false);
                }}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showTestimonialModal && (
        <TestimonialModal
          onClose={() => setShowTestimonialModal(false)}
          token={token}
        />
      )}

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Write a Review</h2>

            <label className="block mb-2 font-medium">Rating:</label>
            <div className="flex items-center mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  size={28}
                  className={`cursor-pointer transition ${star <= rating ? "text-red-500" : "text-gray-300"
                    }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>

            <label className="block mb-2 font-medium">Review:</label>
            <textarea
              rows="4"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-black text-white hover:bg-gray-900"
                onClick={handleSubmitReview}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && orderToReturn && (
        <ReturnModal
          order={orderToReturn}
          onClose={() => {
            setShowReturnModal(false);
            setOrderToReturn(null);
          }}
          token={token}
        />
      )}

    </div>
  );
};

export default Orders;
