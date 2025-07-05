import React, { useState } from "react";
import { Link } from "react-router-dom";
import FollowButton from "./button/FollowButton";
import PostWishlist from "./wishlist/PostWishlist";
import PostCart from "./cart/PostCart";
import BuyNowButton from "./BuyNowButton/BuyNowButton";
import { Info, X } from "lucide-react";

const ProductCard = ({ product, user, hideFollowBtn, cartTexttoShow }) => {
  const protectionAmount = (product?.finalPrice - product?.price).toFixed(2);
  const protectionFee = ((protectionAmount / product?.price) * 100).toFixed(0);

  const [showConditionInfo, setShowConditionInfo] = useState(false);
  return (
    <div className="bg-white rounded-md font-helveticaWorld  shadow-md border-t overflow-hidden flex flex-col justify-between h-full">
      <div
        className={`${
          hideFollowBtn && "hidden"
        } flex items-center justify-between lg:px-2 pt-2`}
      >
        {product.vendor?.name && (
          <Link to={`/vendor/profile/${product.vendor?._id}`}>
            <div className="flex items-center gap-2">
              <img
                src={
                  product.vendor.profileImage ||
                  "https://i.pinimg.com/736x/a4/d3/db/a4d3dbae52f3f640785979f090705ac2.jpg"
                }
                alt={product.vendor.name || "User"}
                className="w-10 h-10 rounded-full object-cover border"
              />
              <span className="text-sm lg:block hidden font-semibold capitalize">
                {product.vendor.name}
              </span>
            </div>
          </Link>
        )}
        <FollowButton vendorId={product.vendor?._id} />
      </div>

      <div className="relative group">
        <Link to={`/product/details/${product._id}`} className="block">
          <div className="relative w-full h-[210px] lg:h-[350px] overflow-hidden">
            <img
              src={product.images?.[0] || "https://via.placeholder.com/250"}
              alt={product.title}
              className="w-full h-full object-cover transition-opacity duration-500 opacity-100 group-hover:opacity-0 absolute inset-0"
            />
            {product.images?.[1] && (
              <img
                src={product.images[1]}
                alt={product.title}
                className="w-full h-full object-cover transition-opacity duration-500 opacity-0 group-hover:opacity-100 absolute inset-0"
              />
            )}
          </div>
        </Link>
        <PostWishlist
          productId={product._id}
          productTitle={product.title}
          productImage={product.images?.length ? product.images[0] : ""}
          productPrice={product.price}
          productSize={product.size}
        />
      </div>

      <div className="p-2 md:p-4 flex-grow flex flex-col  justify-between">
        <div className="mb-2">
          <h3 className="font-medium">
            <>
              <span className="block lg:hidden">
                {product.title.length > 15
                  ? `${product.title.slice(0, 15)}...`
                  : product.title}
              </span>
              <span className="hidden lg:block">
                {product.title.length > 25
                  ? `${product.title.slice(0, 25)}...`
                  : product.title}
              </span>
            </>
          </h3>
          <p className="text-md font-medium text-black">
            {product.size || "N/A"}
          </p>
          <span className="text-md flex items-center  p-0 justify-start gap-1 font-semibold">
            ₹{product?.finalPrice || product?.price}{" "}
            <button className="mt-1" onClick={() => setShowConditionInfo(true)}>
              <Info size={16} className="text-blue-600" />
            </button>
          </span>
        </div>

        <div className="pb-3 gap-2 flex justify-between items-center">
          <PostCart
            toShow={cartTexttoShow || false}
            productId={product._id.toString()}
            productTitle={product.title}
            productImage={product.images?.length ? product.images[0] : ""}
            productPrice={product.price}
            productSize={product.size}
          />
          {product.soldStatus === false ? (
            <BuyNowButton
              product={product}
              user={user}
              toShow={cartTexttoShow || false}
            />
          ) : (
            <span className="text-red-500 font-semibold">Sold Out</span>
          )}
        </div>
      </div>
      {/* Modal */}
      {showConditionInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-[1000] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-xl p-3 md:p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowConditionInfo(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold mb-4">Price breakdown</h2>

            {/* Breakdown List */}
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

            {/* Explanation */}
            <hr className="mb-3" />
            <div className="text-xs text-gray-700 mb-6 leading-snug">
              Our Buyer Protection fee is mandatory when you purchase an item on
              this platform. It is added to every purchase made with the 'Buy
              Now' button. The item price is set by the seller and may be
              subject to negotiation.
            </div>

            {/* Footer Button */}
            <div className="text-center">
              <button
                onClick={() => setShowConditionInfo(false)}
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

export default ProductCard;
