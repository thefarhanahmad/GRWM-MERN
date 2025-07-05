import React, { useState, useEffect } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Address from "../Address/Address";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const BuyNow = () => {
  const { product_id } = useParams();
  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [amount, setAmount] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(null);
  const [error, setError] = useState("");
  const [sellerReviews, setSellerReviews] = useState({
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  console.log("products in location : ", location);

  // Load product(s)
  useEffect(() => {
    if (location.state?.products?.length > 0) {
      setProducts(location.state.products);
      setAmount(location.state.amount || 0);
    } else {
      fetchSingleProduct();
    }
  }, [location.state, product_id]);

  // Single product fetch fallback
  const fetchSingleProduct = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/product/${product_id}`);
      const data = response.data?.data;
      setProduct(data);
      setProducts([
        {
          product_id: data._id,
          title: data.title,
          price: data.price,
          size: data.size,
          color: data.color,
          condition: data.condition,
          image: data.images?.[0],
          vendor: data.vendor,
        },
      ]);
      setAmount(data.price);
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  };

  // Seller reviews (only for first product vendor)
  useEffect(() => {
    const vendorId = products?.[0]?.vendor?._id || product?.vendor?._id || null;
    if (!vendorId) return;

    const fetchSellerReviews = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/sellers-reviews`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { data } = response.data;
        setSellerReviews({
          averageRating: Number(data.averageRating) || 0,
          totalReviews: data.totalReviews || 0,
          reviews: data.reviews || [],
        });
      } catch (error) {
        console.error("Error fetching seller reviews:", error);
      }
    };

    fetchSellerReviews();
  }, [products, product, token]);

  // ✅ Apply Coupon
  const applyCoupon = async () => {
    setError("");
    setDiscount(null);

    try {
      let payload;

      if (products.length === 1) {
        // ✅ Single product checkout
        payload = {
          couponCode,
          productId: products[0].product_id,
        };
      } else {
        // ✅ Multiple products (cart checkout)
        payload = {
          couponCode,
          products: products.map((p) => ({
            productId: p.product_id,
          })),
        };
      }

      const response = await axios.post(`${BASE_URL}/apply-coupon`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data.data;
      setDiscount(data.discount);

      // ✅ Update amount based on type
      if (products.length === 1) {
        setAmount(data.discountedPrice); // comes from backend
      } else {
        setAmount(data.totalAfterDiscount); // comes from backend
      }

      toast.success(`Coupon Applied! ${data.discount}% discount added.`);
    } catch (err) {
      console.log("Error applying coupon:", err);
      setError(err.response?.data?.message || "Failed to apply coupon.");
    }
  };

  const handlePhonePePayment = async () => {
    if (!selectedAddress) {
      toast.error("Please select a delivery address.");
      return;
    }

    try {
      setIsLoading(true);

      const payload = {
        addressId: selectedAddress,
        amount: amount + 50 + 10 + 5,
        products: products.map((p) => ({
          product_id: p.product_id,
          price: p.price,
        })),
      };

      const response = await axios.post(`${BASE_URL}/buy-product`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const redirectUrl = response.data?.redirectUrl;

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        toast.error("Failed to initiate payment.");
      }
    } catch (error) {
      console.error("PhonePe Checkout Error:", error);

      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  // Replacing the "Loading..." div with a spinner
  if (!product && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="md:w-11/12 mx-auto p-3 lg:p-16 overflow-x-hidden">
      <h1 className="text-sm md:text-3xl  text-start font-semibold font-horizon mb-6 text-black">
        Checkout
      </h1>

      <div className="lg:flex justify-between ">
        <Address onSelectAddress={(address) => setSelectedAddress(address)} />

        <div
          className="bg-white border border-gray-300 rounded-sm p-3 sm:p-6 w-full max-w-md mx-auto flex flex-col"
          style={{ maxHeight: "80vh" }}
        >
          {/* Seller Info */}
          <div className="flex items-center space-x-3 border-b pb-3">
            <img
              src={
                products?.[0]?.vendor?.profileImage ||
                "https://i.pinimg.com/736x/a4/d3/db/a4d3dbae52f3f640785979f090705ac2.jpg"
              }
              alt={products?.[0]?.vendor?.name || "User"}
              className="w-16 h-16 rounded-full object-cover border"
            />
            <div>
              <p className="text-lg font-semibold text-black">
                {products?.[0]?.vendor?.name}
              </p>
              {sellerReviews.totalReviews > 0 && (
                <div className="flex items-center space-x-3">
                  <div className="flex text-yellow-500 text-md">
                    {Array.from(
                      {
                        length: Math.floor(Number(sellerReviews.averageRating)),
                      },
                      (_, i) => (
                        <span key={i}>★</span>
                      )
                    )}
                  </div>
                  <div className="bg-red-200 text-red-600 px-4 rounded-md text-md font-semibold">
                    {Number(sellerReviews.averageRating).toFixed(1)}
                  </div>
                  <span className="text-black hidden sm:inline text-md">
                    {sellerReviews.totalReviews} Reviews
                  </span>
                </div>
              )}
              <span className="text-black inline sm:hidden text-md">
                {sellerReviews.totalReviews} Reviews
              </span>
            </div>
          </div>

          {/* Scrollable Product List */}
          <div className="overflow-y-auto flex-1 mt-3 space-y-3 pr-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {products.map((product, index) => (
              <div
                key={index}
                className="flex items-start py-4 space-x-4 border-b border-gray-300"
              >
                <img
                  src={product.image || "https://via.placeholder.com/100"}
                  alt="Product"
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="flex-1">
                  <p className="text-lg text-black">{product.title}</p>
                  <p className="text-md text-black font-medium">
                    Size: {product.size || "N/A"}
                  </p>
                  <p className="text-md text-black font-medium">
                    Color: {product.color || "N/A"}
                  </p>
                </div>
                <p className="text-lg font-semibold text-black">
                  ₹{product.price}
                </p>
              </div>
            ))}
          </div>

          {/* Coupon and Price Summary (Sticky Bottom Section) */}
          <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-black">Apply Coupon</h3>
            <div className="flex mt-2">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
              />
              <button
                onClick={applyCoupon}
                className="ml-3 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
              >
                Apply
              </button>
            </div>

            {discount !== null && (
              <p className="mt-2 mb-3 text-green-600">
                🎉 Coupon applied! {discount}% discount added.
              </p>
            )}
            {error && <p className="mt-2 pb-3 text-red-500">{error}</p>}

            {/* Price Breakdown */}
            <div className="text-md text-gray-900 space-y-2 pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹50.00</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between font-semibold text-black text-lg mt-1 border-t pt-3">
              <span>Total to Pay</span>
              <span>₹{(amount + 50).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Purchase Button */}
      <div className="flex justify-end mt-5 md:mt-12">
        <button
          className="px-12 py-3 bg-black text-white rounded-sm transition duration-300"
          onClick={handlePhonePePayment}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default BuyNow;
