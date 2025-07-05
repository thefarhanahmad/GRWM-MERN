import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { Link } from "react-router-dom";
import { showToast, ToastComponent } from "../../../components/Toast/Toast";
import { FaEdit, FaTrash, FaTimes } from "react-icons/fa"; // FaTimes for close icon
import { Plus } from "lucide-react";
import BoostButton from "../../components/button/BoostButton";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Products = () => {
  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);

  // Quick View states
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewImages, setQuickViewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/vendor-products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(response.data?.data || []);
      } catch (err) {
        setError("Failed to load products");
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

  const handleDeleteProduct = async () => {
    if (!deleteProductId) return;
    try {
      const response = await axios.delete(
        `${BASE_URL}/product/${deleteProductId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data?.success) {
        showToast("success", "Product deleted successfully!");
        setProducts(
          products.filter((product) => product._id !== deleteProductId)
        );
      } else {
        showToast("error", "Failed to delete product.");
      }
    } catch (error) {
      showToast("error", "Something went wrong. Try again!");
    }
    setDeleteProductId(null);
  };

  // Open Quick View modal with images and initial index
  const openQuickView = (images, index = 0) => {
    setQuickViewImages(images);
    setCurrentImageIndex(index);
    setIsQuickViewOpen(true);
  };

  // Close Quick View modal
  const closeQuickView = () => {
    setIsQuickViewOpen(false);
    setQuickViewImages([]);
    setCurrentImageIndex(0);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="mx-auto p-4 lg:px-20">
      <ToastComponent />

      <div className="flex justify-center sm:mb-5">
        <div className="flex justify-between  sm:items-center w-full ">
          <h2 className="text-sm md:text-3xl -mt-1 text-nowrap text-start font-semibold font-horizon mb-6 text-black">
            My Products ({products.length})
          </h2>

          <Link
            to="/addproducts"
            className="border border-black text-black p-1 sm:p-2 flex  h-fit items-center gap-1 sm:gap-2 rounded-sm hover:bg-gray-100 transition-transform transform hover:scale-105"
          >
            {/* Icon always visible */}
            <span className="hidden sm:block">
              <Plus size={18} />
            </span>
            <span className="block sm:hidden">
              <Plus size={16} />
            </span>
            <span className="block text-xs md:hidden">Upload</span>
            <span className="hidden md:block">Upload New Product</span>
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
            className="bg-black text-white px-10 py-3 rounded-sm hover:bg-gray-900 transition-transform transform hover:scale-105"
          >
            Add Product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              className="rounded-sm overflow-hidden font-helveticaWorld shadow-md bg-white border border-gray-200 transition hover:shadow-2xl relative"
            >
              <div>
                {/* Main image - open quick view modal on click */}
                <img
                  src={product.images?.[0] || "https://via.placeholder.com/450"}
                  alt={product.title}
                  className="w-full h-[250px] object-cover rounded-md cursor-pointer"
                  onClick={() => openQuickView(product.images, 0)}
                />
              </div>

              <div className="p-2">
                <h3 className="text-lg ">
                  {product.title.length > 25
                    ? `${product.title.slice(0, 25)}...`
                    : product.title}
                </h3>
                <p className="text-md  mb-1 text-gray-900">₹{product.price}</p>
                <p className="text-sm  text-black">
                  <span className="font-medium">Category:</span>{" "}
                  {product.category?.categoryName || "N/A"}
                </p>
                {product.subcategory?.subcategoryName && (
                  <p className="text-sm  text-black">
                    <span className="font-medium">Subcategory:</span>{" "}
                    {product.subcategory.subcategoryName}
                  </p>
                )}

                <BoostButton token={token} product={product} profile={user} />
              </div>

              <Link
                to={`/product/edit/${product._id}`}
                className="absolute top-3 right-3 bg-gray-100 p-3 rounded-full shadow hover:bg-gray-200"
              >
                <FaEdit className="w-6 h-6 text-black" />
              </Link>

              <button
                onClick={() => setDeleteProductId(product._id)}
                className="absolute left-3 top-3 bg-gray-100 p-3 rounded-full shadow hover:bg-gray-200"
              >
                <FaTrash className="w-6 h-6 text-green-600" />
              </button>
            </div>
          ))}

          {/* Delete Confirmation Modal */}
          {deleteProductId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-md shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
                <p className="mb-6">
                  Are you sure you want to delete this product?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setDeleteProductId(null)}
                    className="px-4 py-2 bg-white text-black border border-black rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    className="px-4 py-2 bg-black text-white rounded-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick View Modal */}
          {isQuickViewOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4"
              onClick={closeQuickView}
            >
              <div
                className="bg-white rounded-sm shadow-lg max-w-xl w-full p-6 relative"
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
              >
                {/* Close button */}
                <button
                  onClick={closeQuickView}
                  className="absolute top-3 right-3 text-gray-800 hover:text-black text-xl"
                  aria-label="Close modal"
                >
                  <FaTimes />
                </button>

                {/* Large image */}
                <img
                  src={quickViewImages[currentImageIndex]}
                  alt={`Product Image ${currentImageIndex + 1}`}
                  className="w-full max-h-[300px] object-contain rounded-md mb-4"
                />

                {/* Thumbnails to switch images */}
                <div className="flex gap-4 justify-center overflow-x-auto">
                  {quickViewImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-20 w-20 object-cover rounded-md border cursor-pointer ${
                        idx === currentImageIndex
                          ? "border-black"
                          : "border-transparent"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Products;
