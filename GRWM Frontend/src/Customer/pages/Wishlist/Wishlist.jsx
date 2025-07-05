import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { showToast } from "../../../components/Toast/Toast";
import { BsHeart, BsTrash, BsBag } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { FiLoader } from "react-icons/fi";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");
  console.log("User wishlist:", user);
  console.log("Token wishlist:", token);

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      setTimeout(() => navigate("/login"), 2000);
      return;
    }

    const fetchWishlist = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/wishlists`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const filteredWishlist = response.data.data?.products.filter(
          (product) => product.vendor !== user?._id
        );

        setWishlist(filteredWishlist || []);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [token, user]);

  const removeFromWishlist = async (productId) => {
    if (!token) {
      showToast(
        "error",
        "You must be logged in to remove items from the wishlist."
      );
      return;
    }

    try {
      await axios.post(
        `${BASE_URL}/wishlist/remove`,
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      showToast("success", "Removed from wishlist.");
    } catch (error) {
      showToast("error", "Failed to remove from wishlist.");
    }
    setDeleteProductId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-black text-5xl" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="lg:p-12 p-3 bg-gray-100">
      <div className="lg:flex justify-between lg:gap-10">
        <div className="w-full border border-gray-300 lg:w-4/3">
          <div className="mb-4 shadow-lg">
            <div className="bg-white flex justify-between items-center px-3 md:px-10 p-2 py-4">
              <h2 className="font-horizon text-xl">Favourites</h2>
              <div className="relative">
                <BsHeart className="text-2xl text-black cursor-pointer" />
              </div>
            </div>
          </div>

          {wishlist.length === 0 ? (
            <div className="flex flex-col font-helveticaWorld justify-center items-center h-80 bg-white shadow-md rounded-lg p-6">
              <BsBag className="text-6xl mb-6" />
              <h3 className="text-black text-2xl mb-2 text-center">
                Your wishlist is empty
              </h3>
              <p className="text-gray-600 text-lg mb-3 text-center">
                Save your favorite products here and shop later!
              </p>
              <button
                className="bg-black text-white mb-2 px-8 py-3 mt-3 rounded-sm hover:bg-gray-800 transition"
                onClick={() => navigate("/")}
              >
                Explore Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 font-helveticaWorld sm:grid-cols-1 gap-4">
              {wishlist.map((product) => (
                <div
                  key={product._id}
                  className="border-t border-gray-300 bg-white p-4 relative shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row gap-4">
                    <Link to={`/product/details/${product._id}`}>
                      <img
                        src={
                          product.images?.[0] ||
                          "https://via.placeholder.com/250"
                        }
                        alt={product.title}
                        className="w-full  object-cover rounded-md lg:w-28 h-28"
                      />
                    </Link>

                    <div className="flex-1">
                      <h3 className="text-xl text-black font-serif mb-2 font-semibold">
                        {product.title}
                      </h3>
                      <p className="text-black mb-1 text-md">
                        Price: ₹{product.price}
                      </p>
                      <button
                        onClick={() => setDeleteProductId(product._id)}
                        className="mt-2 text-gray-800 hover:text-black"
                      >
                        <BsTrash className="text-xl" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-right lg:absolute lg:bottom-4 lg:right-6">
                    {product.soldStatus === false ? (
                      <Link to={`/buynow/${product._id}`}>
                        <button className="bg-white text-black border border-black px-3 md:px-6 py-2 rounded-lg transition">
                          Checkout
                        </button>
                      </Link>
                    ) : (
                      <button
                        className="bg-red-200 text-red-500 px-4 py-2 rounded-sm cursor-not-allowed"
                        disabled
                      >
                        Sold Out
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteProductId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="mb-6">
              Do you really want to remove this item from your wishlist?
            </h3>
            <div className="flex justify-center gap-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded-sm hover:bg-gray-400 transition"
                onClick={() => setDeleteProductId(null)}
              >
                Cancel
              </button>
              <button
                className="bg-black text-white px-4 py-2 rounded-sm transition"
                onClick={() => removeFromWishlist(deleteProductId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
