import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiLoader } from "react-icons/fi";
import PostWishlist from "../../components/wishlist/PostWishlist";
import PostCart from "../../components/cart/PostCart";
import { ToastComponent } from "../../../components/Toast/Toast";
import FollowButton from "../../components/button/FollowButton";
import BuyNowButton from "../../components/BuyNowButton/BuyNowButton";
import ProductCard from "../../components/ProductCard";

const ProductsPage = ({ isSidebarOpen, activeSort, isGridView }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);
  const [priceRange, setPriceRange] = useState([100, 10000]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const min = parseInt(params.get("minPrice")) || 100;
    const max = parseInt(params.get("maxPrice")) || 10000;
    setPriceRange([min, max]);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setProducts([]);

      const params = new URLSearchParams(location.search);
      const category = params.get("category");
      const brand = params.get("brand");
      const itemName = params.get("item");
      const priceUnder = params.get("priceUnder");
      const minPrice = params.get("minPrice");
      const maxPrice = params.get("maxPrice");
      const size = params.get("size");
      const occasion = params.get("occasion");
      const color = params.get("color");


      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/products/`,
          {
            params: {
              category,
              brand,
              item: itemName,
              size,
              minPrice,
              maxPrice,
              priceUnder,
              occasion,
              color,
            },
          }
        );
        if (response.data.success) {
          let filteredProducts = response.data.data.filter(
            (product) => product.vendor?._id !== user?._id
          );
          setProducts(filteredProducts);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [location.search, user?._id]);

  const sortedProducts = [...products].sort((a, b) => {
    if (activeSort === "Price: Low to High") {
      return a.price - b.price;
    }
    if (activeSort === "Price: High to Low") {
      return b.price - a.price;
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-black text-5xl" />
      </div>
    );
  }

  return (
    <div className="lg:pl-20 lg:px-16 px-3 pb-6 relative">
      <ToastComponent />
      <div
        className={`${
          isGridView
            ? `grid grid-cols-2 ${
                isSidebarOpen ? "lg:grid-cols-3" : "lg:grid-cols-4"
              }`
            : "flex flex-col"
        } gap-4 lg:gap-10 lg:mt-4`}
      >
        {sortedProducts.length === 0 ? (
          <div className="w-full md:w-11/12 flex items-center mx-auto  border border-gray-300 shadow-lg rounded-lg lg:mx-16 justify-center col-span-full">
            <div className="flex flex-col items-center justify-center h-[70vh] text-center text-gray-600">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
                alt="No products"
                className="w-32 h-32 mb-6 opacity-70"
              />
              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                No Products Found
              </h2>
              <p className="mb-6 text-sm text-gray-500">
                Try adjusting your filters or browse all products.
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
              >
                Browse All Products
              </button>
            </div>
          </div>
        ) : (
          sortedProducts.map((product) => (
            <>
              {/* Grid view */}
              {isGridView ? (
                <ProductCard key={product._id} product={product} user={user} />
              ) : (
                <div
                  key={product._id}
                  className="rounded-sm relative   w-full  overflow-hidden transition-all duration-300 flex flex-col border lg:border-none lg:flex-row"
                >
                  {/* Vendor + Follow (Mobile View - above image) */}
                  <div className="flex items-center justify-between p-2 lg:hidden">
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
                          <span className="text-sm font-semibold capitalize">
                            {product.vendor.name}
                          </span>
                        </div>
                      </Link>
                    )}
                    <FollowButton vendorId={product.vendor?._id} />
                  </div>

                  {/* Left: Product Image */}
                  <Link
                    to={`/product/details/${product._id}`}
                    className="w-full lg:w-1/3 relative"
                  >
                    <div className="relative w-full h-[210px] lg:h-full rounded-sm overflow-hidden group cursor-pointer">
                      <img
                        src={
                          product.images?.[0] ||
                          "https://via.placeholder.com/250"
                        }
                        alt={product.title}
                        className="w-full h-full object-cover rounded-sm transition-opacity duration-500 opacity-100 group-hover:opacity-0 absolute inset-0"
                      />
                      {product.images?.[1] && (
                        <img
                          src={product.images[1]}
                          alt={product.title}
                          className="w-full h-full object-cover rounded-sm transition-opacity duration-500 opacity-0 group-hover:opacity-100 absolute inset-0"
                        />
                      )}
                      {/* Wishlist Button (positioned for large screens) */}
                      <div className="absolute bottom-0 right-0 hidden lg:block">
                        <PostWishlist
                          productId={product._id}
                          productTitle={product.title}
                          productImage={product.images?.[0] || ""}
                          productPrice={product.price}
                          productSize={product.size}
                        />
                      </div>
                    </div>
                  </Link>

                  {/* Right: Details */}
                  <div className="flex flex-col justify-between w-full  p-4 lg:border  lg:w-[65%] relative">
                    {/* Vendor + Follow (Desktop View - right panel) */}
                    <div className="hidden lg:flex items-center justify-between mb-2">
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
                            <span className="text-sm font-semibold capitalize">
                              {product.vendor.name}
                            </span>
                          </div>
                        </Link>
                      )}
                      <FollowButton vendorId={product.vendor?._id} />
                    </div>

                    {/* Product Details */}
                    <div className="mb-4">
                      <h3 className="font-medium">
                        <>
                          <span className="block lg:hidden">
                            {product.title.length > 15
                              ? `${product.title.slice(0, 15)}...`
                              : product.title}
                          </span>
                          <span className="hidden  font-semibold lg:block">
                            {product.title.length > 25
                              ? `${product.title.slice(0, 25)}...`
                              : product.title}
                          </span>
                          <span className="hidden  lg:block">
                            {product?.description.length > 155
                              ? `${product?.description.slice(0, 155)}...`
                              : product?.description}
                          </span>
                        </>
                      </h3>
                      <p className="text-md font-semibold">₹{product.price}</p>
                      {product.size && (
                        <p className="text-md font-medium text-black">
                          Size: {product.size}
                        </p>
                      )}
                    </div>

                    {/* Cart and BuyNow Buttons */}
                    <div className="flex justify-between items-center">
                      <PostCart
                        productId={product._id}
                        productTitle={product.title}
                        productImage={product.images?.[0] || ""}
                        productPrice={product.price}
                        productSize={product.size}
                      />
                      {product.soldStatus === false ? (
                        <BuyNowButton product={product} user={user} />
                      ) : (
                        <span className="text-red-500 font-semibold">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
