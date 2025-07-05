import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { showToast, ToastComponent } from "../../../components/Toast/Toast";
import { Link } from "react-router-dom";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import { BsBag } from "react-icons/bs";

const SellProducts = () => {
  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/seller-orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(response.data.data);
        if (response.data.success === false) {
          showToast("error", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching seller orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, [token]);

  const updateOrderStatus = async (orderId, status, userId) => {
    try {
      await axios.patch(
        `${BASE_URL}/update-order-status/${orderId}`,
        {
          deliveryStatus: status,
          userId: userId, // Send required userId for backend
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, deliveryStatus: status } : order
        )
      );
      showToast("success", `Order marked as ${status}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast(
        "error",
        error.response?.data?.message || "Failed to update order status"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto lg:px-16 pb-10 p-4">
      <ToastComponent />
      <h2 className="text-sm md:text-3xl text-start font-semibold font-horizon mb-6 text-black">
        Sold Products ({orders.length})
      </h2>

      {orders.length === 0 ? (
        <div className="flex flex-col justify-center items-center border sm:h-[400px] bg-white shadow-lg rounded-lg px-6 py-5">
          <BsBag className="text-6xl mb-6" />
          <p className="text-gray-800 text-lg font-semibold">
            You haven't sold any products yet.
          </p>
          <p className="text-gray-800 text-sm mb-10">
            Start listing your products and grow your business.
          </p>
          <Link to="/addproducts">
            <button className="bg-black text-white px-10 py-2 rounded-sm hover:bg-gray-800 transition duration-300">
              Start Selling
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {orders.map((order) => {
            const userId = order?.userId?._id || order?.userId;

            return (
              <div
                key={order._id}
                className="rounded-sm font-helveticaWorld overflow-hidden shadow-lg bg-white"
              >
                {order.product_id?.images?.length > 0 ? (
                  <img
                    src={order.product_id.images[0]}
                    alt={order.product_id.title || "Product Image"}
                    className="w-full h-[380px] object-cover"
                  />
                ) : (
                  <div className="w-full h-[450px] flex items-center justify-center bg-gray-200 text-gray-500">
                    No Image Available
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-md font-semibold truncate">
                    {order.product_id?.title || "Unknown Product"}
                  </h3>

                  <p className="text-lg font-semibold mt-1">₹{order.amount}</p>
                  <p className="text-sm text-gray-500">
                    Buyer: {order.customerName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state}
                  </p>
                  <span
                    className={`px-2 py-1 mt-2 inline-block text-sm font-semibold rounded-md 
                    ${
                      order.deliveryStatus === "pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : order.deliveryStatus === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : order.deliveryStatus === "shipped"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {order.deliveryStatus.charAt(0).toUpperCase() +
                      order.deliveryStatus.slice(1)}
                  </span>

                  {order.deliveryStatus === "pending" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order._id, "shipped", userId)
                      }
                      className="mt-4 w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
                    >
                      🚚 Mark as Shipped
                    </button>
                  )}

                  {order.deliveryStatus === "shipped" && (
                    <button
                      onClick={() =>
                        updateOrderStatus(order._id, "delivered", userId)
                      }
                      className="mt-3 w-full flex items-center justify-center gap-2 px-5 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all"
                    >
                      ✅ Mark as Delivered
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SellProducts;
