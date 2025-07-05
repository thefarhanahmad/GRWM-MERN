import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BsBag, BsTrash } from "react-icons/bs";
import { MdClose } from "react-icons/md";
import { showToast, ToastComponent } from "../../../components/Toast/Toast";
import { FiLoader } from "react-icons/fi";
import CartEmpty from "../../../assets/Image/cartEmpty.jpeg";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Cart = () => {
  const [cartBundles, setCartBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      setTimeout(() => navigate("/login"), 1000);
      return;
    }

    const fetchCartItems = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/cart/items`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCartBundles(response.data?.data?.bundles || []);
      } catch (err) {
        console.error("Error in cart page", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user, token]);

  const handleRemoveItem = async (productId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/cart/remove`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setCartBundles((prev) =>
          prev
            .map((bundle) => ({
              ...bundle,
              items: bundle.items.filter(
                (item) => item.productId !== productId
              ),
            }))
            .filter((bundle) => bundle.items.length > 0)
        );
        showToast("success", "Item removed successfully!");
      } else {
        showToast("error", "Failed to remove item.");
      }
    } catch (err) {
      showToast("error", "Error removing item.");
    } finally {
      setDeleteProductId(null);
    }
  };

  const moveToFavorite = async (productId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/wishlist/add`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        showToast("success", "Item moved to wishlist!");
        handleRemoveItem(productId);
      } else {
        showToast(
          "error",
          response.data.message || "Failed to move item to wishlist."
        );
      }
    } catch (err) {
      showToast(
        "error",
        err.response?.data?.message || "Failed to move item to wishlist."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-black text-5xl" />
      </div>
    );
  }

  return (
    <div className="lg:p-12 p-3 ml-1 bg-gray-100">
      <ToastComponent />
      <div className="lg:flex justify-between lg:gap-10">
        <div className="w-full border border-gray-300 lg:w-4/3">
          <div className="mb-4 shadow-lg">
            <div className="bg-white flex justify-between items-center px-3 md:px-10 p-2 py-4">
              <h2 className="text-xl font-horizon">Cart</h2>
              <BsBag className="text-2xl text-black cursor-pointer" />
            </div>
          </div>

          {cartBundles.length === 0 ? (
            <div className="flex flex-col font-helveticaWorld justify-center items-center h-80 bg-white shadow-md rounded-lg">
              <img src={CartEmpty} alt="empty" className="h-12 mb-2" />
              <h3 className="text-black text-2xl mb-3 text-center">
                Your cart is currently empty
              </h3>
              <p className="text-gray-600 text-lg mb-3 text-center">
                Start adding items to your cart and enjoy a seamless shopping
                experience!
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-black text-white px-8 py-3 rounded-sm hover:bg-gray-800 transition"
              >
                Explore Products
              </button>
            </div>
          ) : (
            <div className="font-helveticaWorld space-y-6">
              {cartBundles.map((bundle) => (
                <div
                  key={bundle.vendorId}
                  className="bg-white shadow-md border"
                >
                  {/* Vendor Header */}
                  {/* <div className="p-4 flex items-center gap-4 border-b">
                    <img
                      src={bundle.vendorProfileImage}
                      alt={bundle.vendorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <h3 className="text-lg font-bold text-black">
                      {bundle.vendorName}
                    </h3>
                  </div> */}

                  {/* Grid of Items */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-2 p-1">
                    {bundle.items.map((item) => (
                      <div
                        key={item.productId}
                        className="border border-gray-200 rounded-md p-3 flex flex-col bg-white"
                      >
                        <Link
                          to={`/product/details/${item.productId}`}
                          className="block mx-auto"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-40 object-cover rounded-md mb-3"
                          />
                        </Link>

                        <div>
                          <h3 className="text-md font-semibold text-black mb-1">
                            {item.title.length > 20
                              ? `${item.title.slice(0, 20)}...`
                              : item.title}
                          </h3>
                          <p className="text-black text-sm mb-1">
                            Size: {item.size || "N/A"}
                          </p>
                          <p className="text-black text-sm mb-1">
                            Price: ₹{item.price}
                          </p>

                          <button
                            onClick={() => setDeleteProductId(item.productId)}
                            className="text-gray-800 mt-2 hover:text-black"
                          >
                            <BsTrash className="text-lg" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Vendor Total Price + Checkout */}
                  <div className="text-right p-4 border-t">
                    <span className="text-black font-semibold">
                      Total Price : ₹{bundle.vendorTotalPrice.toFixed(2)}
                    </span>
                    <button
                      onClick={() =>
                        navigate("/buynow", {
                          state: {
                            products: bundle.items.map((item) => ({
                              product_id: item.productId,
                              title: item.title,
                              price: item.price,
                              size: item.size || null,
                              color: item.color || null,
                              condition: item.condition || null,
                              image: item.image || item.images?.[0] || null,
                              vendor: {
                                name: bundle.vendorName,
                                profileImage: bundle.vendorProfileImage,
                                _id: bundle.vendorId,
                              },
                            })),
                            amount: bundle.vendorTotalPrice,
                          },
                        })
                      }
                      className="ml-4 text-black border border-black px-4 py-2 rounded-md hover:bg-gray-800 hover:text-white transition"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {deleteProductId && (
            <div className="fixed inset-0 px-8 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <button
                  className="absolute top-2 right-4 text-red-600 font-bold hover:text-black"
                  onClick={() => setDeleteProductId(null)}
                >
                  <MdClose size={22} />
                </button>
                <h3 className="mb-6 mt-4 text-md">
                  Do you really want to remove this item from your cart?
                </h3>
                <div className="flex justify-center gap-4">
                  <button
                    className="bg-black text-white px-2 py-2 rounded-sm"
                    onClick={() => moveToFavorite(deleteProductId)}
                  >
                    Move to Favourites
                  </button>
                  <button
                    className="bg-black text-white px-4 py-2 rounded-sm"
                    onClick={() => handleRemoveItem(deleteProductId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
