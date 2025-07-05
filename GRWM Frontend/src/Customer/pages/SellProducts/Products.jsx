import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import { showToast, ToastComponent } from "../../../components/Toast/Toast";
import BoostButton from "../../components/button/BoostButton";
import { FaEdit } from "react-icons/fa";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import { Plus } from "lucide-react";

const Products = () => {
  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/vendor-products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Fetched Products:", response.data?.data); // Debugging
        setProducts(response.data?.data || []);

        // Show success toast when products load successfully
        showToast("success", "Products loaded successfully.");
      } catch (err) {
        setError("Failed to load products");
        showToast("error", "Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleBoostProduct = async (productId) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/product/boost/${productId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data?.success) {
        showToast("success", "Product boosted successfully!");
      } else {
        showToast("error", "Failed to boost product.");
      }
    } catch (error) {
      showToast("error", "Something went wrong. Try again!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="lg:px-16 mx-auto p-4 pb-20">
      <ToastComponent /> {/* Toast component added */}
      <div className="lg:flex space-y-4 justify-between mb-10">
        <div>
          <h2 className="text-4xl">My Products ({products.length})</h2>
        </div>
        <div>
          <Link
            to="/addproducts"
            className="border border-black text-black px-4 py-2 flex items-center gap-2 rounded-sm hover:bg-gray-100 transition-transform transform hover:scale-105"
          >
            <Plus size={18} />
            Upload New Product
          </Link>
        </div>
      </div>
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white shadow-md border border-gray-400 rounded-xl p-6">
          <p className="text-black text-2xl font-semibold mb-6">
            No products found.
          </p>
          <Link
            to="/addproducts"
            className="bg-black text-white px-10 py-3 rounded-md hover:bg-gray-900 transition-transform transform hover:scale-105"
          >
            Upload New Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4  gap-10">
          {products.map((product) => (
            <div
              key={product._id}
              className="relative rounded-sm overflow-hidden shadow-sm bg-white border border-gray-200 transition hover:shadow-2xl"
            >
              <img
                src={product.images?.[0] || "https://via.placeholder.com/450"}
                alt={product.title}
                className="w-full h-[350px] object-cover"
              />

              <div className="p-4">
                <h3 className="text-lg font-semibold truncate">
                  {product.title}
                </h3>
                <p className="text-lg font-bold text-gray-900">
                  ₹{product.price}
                </p>
                <p className="text-sm text-black">
                  <span className="font-medium">Category:</span>{" "}
                  {product.category?.categoryName || "N/A"}
                </p>
                <p className="text-sm text-black">
                  <span className="font-medium">Subcategory:</span>{" "}
                  {product.subcategory?.subcategoryName || "N/A"}
                </p>

                {/* Boost Now Button with API Call */}
                <BoostButton token={token} product={product} profile={user} />

                {/* Edit Icon */}
                <Link
                  to={`/product/edit/${product._id}`}
                  className="absolute top-3 right-3 bg-gray-100 p-3 rounded-full shadow hover:bg-gray-200"
                >
                  <FaEdit className="w-6 h-6 text-black" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
