import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import RelatedProducts from "./RelatedProducts";
import FollowButton from "../../../components/button/FollowButton";
import { useSelector } from "react-redux";
import BuyNowButton from "../../../components/BuyNowButton/BuyNowButton";
import PostCart from "../../../components/cart/PostCart";
import { Info, MessageCircle } from "lucide-react";
import PostWishlist from "../../../components/wishlist/PostWishlist";
import { FiLoader } from "react-icons/fi";
import NetworkError from "../../../../components/ErrorScreens/NetworkError";
import ProductImagesWithZoom from "./ProductImagesWithZoom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ProductDetails = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [error, setError] = useState(null);

  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/product/${productId}`);
        setProduct(response.data?.data || null);
      } catch (err) {
        setError("Network Error");
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-black text-5xl" />
      </div>
    );
  }

  if (error) {
    return <NetworkError />;
  }

  if (!product) {
    return (
      <div className="text-center text-gray-500 py-10">Product not found.</div>
    );
  }

  const protectionAmount = (product?.finalPrice - product?.price).toFixed(2);
  const protectionFee = ((protectionAmount / product?.price) * 100).toFixed(0);

  return (
    <div>
      <div className="mx-auto px-3 lg:p-16 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Product Images */}
          <div>
            <ProductImagesWithZoom product={product} />
          </div>

          {/* Product Details */}
          <div className="lg:w-[490px] font-helveticaWorld lg:p-8 p-3 rounded-md border border-gray-300 sticky top-10 h-fit">
            {/* Vendor Info */}
            <div className="mb-4">
              <div className="flex w-full items-start sm:items-center justify-between">
                <div>
                  <Link to={`/vendor/profile/${product.vendor?._id}`}>
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          product.vendor.profileImage ||
                          "https://i.pinimg.com/736x/a4/d3/db/a4d3dbae52f3f640785979f090705ac2.jpg"
                        }
                        alt={product.vendor.name || "User"}
                        className="w-16 h-16 rounded-full object-contain border border-gray-400"
                      />
                      <div className="space-y-2">
                        <span className="text-md font-semibold capitalize">
                          {product.vendor.name}
                        </span>
                        {product.vendor?.ratings?.numberOfRatings > 0 && (
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-200 text-green-600 px-4 py-[6px] rounded-md text-md font-semibold leading-none flex items-center justify-center">
                              <p className="m-0 pb-1">
                                {product.vendor.ratings.averageRating.toFixed(
                                  1
                                )}
                              </p>
                            </div>

                            <div className="flex text-yellow-500 text-lg">
                              {Array.from(
                                {
                                  length: Math.floor(
                                    product.vendor.ratings.averageRating
                                  ),
                                },
                                (_, i) => (
                                  <span key={i}>★</span>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
                <FollowButton largeBtn={true} vendorId={product.vendor?._id} />
              </div>
            </div>

            {/* Title and Price */}
            <h3 className="text-lg mt-2 text-black">{product.title}</h3>
            <div className="flex flex-col sm:flex-row sm:justify-between mt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <p className="text-lg font-semibold text-gray-900">
                    ₹{product.price}
                  </p>
                  <button onClick={() => setShowBreakdownModal(true)}>
                    <Info size={16} className="text-blue-600" />
                  </button>
                </div>
                {product.originalPrice > product.price && (
                  <>
                    <p className="text-lg font-semibold text-gray-500 line-through">
                      ₹{product.originalPrice}
                    </p>
                    <p className="text-md font-semibold text-red-500">
                      {Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100
                      )}
                      % OFF
                    </p>
                  </>
                )}
              </div>
              <p className="text-green-600 text-lg mt-2 sm:mt-0">
                {product.condition}
              </p>
            </div>

            <div className="border border-gray-300 my-4" />

            {/* Extra Details */}
            <div className="text-black text-md font-medium grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {product.size && (
                <div>
                  <p>
                    <span className="font-semibold">Size:</span> {product.size}
                  </p>
                </div>
              )}
              {product.color && (
                <div>
                  <p>
                    <span className="font-semibold">Color:</span>{" "}
                    {product.color}
                  </p>
                </div>
              )}
              {product.brand && (
                <div>
                  <p>
                    <span className="font-semibold">Brand:</span>{" "}
                    {product?.brand?.brandName || "H&M"}
                  </p>
                </div>
              )}
              {product.occasion && (
                <div>
                  <p>
                    <span className="font-semibold">Occasion:</span>{" "}
                    {product.occasion}
                  </p>
                </div>
              )}
              {product.category?.categoryName && (
                <div>
                  <p>
                    <span className="font-semibold">Category:</span>{" "}
                    {product.category.categoryName}
                  </p>
                </div>
              )}
              {product.subcategory?.subcategoryName && (
                <div>
                  <p>
                    <span className="font-semibold">Subcategory:</span>{" "}
                    {product.subcategory.subcategoryName}
                  </p>
                </div>
              )}
            </div>

            <div className="border border-gray-300 my-4" />

            {/* Description */}
            <p className="text-black text-md my-4">{product.description}</p>

            <div className="border border-gray-300 my-4" />

            {/* Terms & Conditions */}
            <p
              className="text-gray-700 text-md flex items-center cursor-pointer"
              onClick={() => setShowTermsModal(true)}
            >
              <Info size={24} className="mr-2 text-green-600" />
              <span>
                Purchases through GRWM are covered by buyer protection fees -{" "}
                <span className="text-xs">T&C applied</span>
              </span>
            </p>

            {/* Action Buttons */}
            <div className="lg:px-3 pb-3 mt-8 gap-3 flex flex-wrap justify-between items-center">
              <PostCart
                productId={product._id}
                productTitle={product.title}
                productImage={product.images?.[0] || ""}
                productPrice={product.price}
                productSize={product.size}
                toShow={true}
              />
              {product.soldStatus === false ? (
                <BuyNowButton toShow={true} product={product} user={user} />
              ) : (
                <div className="w-full flex justify-center">
                  <span className="text-red-500 text-center font-semibold">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Message Seller Button */}
            <Link
              to={token ? `/chat/buyer/${product?.vendor?._id}` : "/login"}
              className="flex items-center justify-center gap-2 bg-green-600 sm:mx-2 py-2 mt-3 w-full rounded-md border border-green-800 text-white hover:bg-green-500 transition-all"
            >
              <MessageCircle size={20} />
              <span className="text-sm font-medium">Message Seller</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <RelatedProducts productId={product._id} />

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-[1000]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[650px] relative">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-4 right-4 text-black text-xl"
            >
              ✖
            </button>
            <h2 className="text-xl font-semibold text-black mb-4 mt-2">
              Terms & Conditions
            </h2>
            <div className="text-gray-800 space-y-3 max-h-80 overflow-y-auto">
              <p>
                <strong>1. Purchase Agreement:</strong> By making a purchase,
                you agree to abide by the terms set forth in this agreement.
              </p>
              <p>
                <strong>2. Product Authenticity:</strong> All products are sold
                as described.
              </p>
              <p>
                <strong>3. Returns & Refunds:</strong> Returns are accepted
                within 7 days of delivery only if the item is damaged or
                defective.
              </p>
              <p>
                <strong>4. Shipping:</strong> Delivery times are estimated and
                may be delayed due to unforeseen circumstances.
              </p>
              <p>
                <strong>5. Payment:</strong> We ensure secure payment
                processing.
              </p>
              <p>
                <strong>6. Buyer Protection:</strong> Covered under buyer
                protection policies.
              </p>
              <p>
                <strong>7. Dispute Resolution:</strong> Contact support for
                disputes. Legal steps may follow if unresolved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Price Breakdown Modal */}
      {showBreakdownModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-[1000] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-xl p-3 md:p-6 relative">
            <button
              onClick={() => setShowBreakdownModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              ✖
            </button>

            <h2 className="text-xl font-semibold mb-4">Price breakdown</h2>

            <div className="space-y-2 text-sm text-gray-900 mb-4">
              <div className="flex justify-between">
                <span>Item</span>
                <span>₹{Number(product?.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Buyer Protection fee{" "}
                  <span className="text-gray-500 font-medium">
                    ({protectionFee}%)
                  </span>
                </span>
                <span>₹{protectionAmount}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Shipping fees and sales tax are calculated at checkout
              </p>
            </div>

            <hr className="mb-3" />
            <div className="text-xs text-gray-700 mb-6 leading-snug">
              Our Buyer Protection fee is mandatory when you purchase an item on
              this platform. It is added to every purchase made with the 'Buy
              Now' button. The item price is set by the seller and may be
              subject to negotiation.
            </div>

            <div className="text-center">
              <button
                onClick={() => setShowBreakdownModal(false)}
                className="bg-black text-white py-2 px-6 rounded-full text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
