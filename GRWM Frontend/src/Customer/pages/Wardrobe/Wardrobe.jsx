import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import PostWishlist from "../../components/wishlist/PostWishlist";
import PostCart from "../../components/cart/PostCart";
import { ToastComponent } from "../../../components/Toast/Toast";
import FollowButton from "../../components/button/FollowButton";
import BuyNowButton from "../../components/BuyNowButton/BuyNowButton";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Wardrobe = ({ activeSort, isSidebarOpen }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.user.user);
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/section`);
        const sectionData = response.data.data[0];
        let allProducts = sectionData?.products || [];

        allProducts = allProducts.filter(
          (product) => product.vendor !== user?._id
        );

        const boostedProducts = allProducts.filter((p) => p.isBoosted);
        const normalProducts = allProducts.filter((p) => !p.isBoosted);
        setProducts([...boostedProducts, ...normalProducts]);
      } catch (err) {
        setError("Failed to fetch section data");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [user]);

  const sortedProducts = [...products].sort((a, b) => {
    if (activeSort === "Price: Low to High") return a.price - b.price;
    if (activeSort === "Price: High to Low") return b.price - a.price;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-black text-5xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-10 text-lg">{error}</div>
    );
  }

  const gridCols = isSidebarOpen ? "lg:grid-cols-3" : "lg:grid-cols-4";

  return (
    <div className="lg:pl-20 pl-4 pr-4 pb-6 relative">
      <ToastComponent />
      <div
        className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 ${gridCols} gap-4 sm:gap-5 lg:gap-8 xl:gap-10 lg:mt-4`}
      >
        {sortedProducts.length === 0 ? (
          <div className="text-center text-gray-600 py-10 col-span-full">
            No products found.
          </div>
        ) : (
          sortedProducts.map((product) => (
            <div
              key={product._id}
              className="rounded-md relative overflow-hidden bg-white shadow-sm transition-all duration-300"
            >
              <div className="flex items-center justify-between p-2">
                <Link to={`/vendor/profile/${product.vendor?._id}`}>
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        product.vendor?.profileImage ||
                        "https://i.pinimg.com/736x/a4/d3/db/a4d3dbae52f3f640785979f090705ac2.jpg"
                      }
                      alt={product.vendor?.name || "User"}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <span className="text-sm lg:block hidden font-semibold capitalize">
                      {product.vendor?.name}
                    </span>
                  </div>
                </Link>
                <FollowButton vendorId={product.vendor?._id} />
              </div>

              <div className="relative">
                <Link to={`/product/details/${product._id}`} className="block">
                  <div className="relative w-full lg:w-[350px] h-[250px] sm:h-[350px] rounded-sm overflow-hidden group cursor-pointer">
                    <img
                      src={product.images?.[0] || "https://via.placeholder.com/250"}
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
                  </div>
                </Link>

                <PostWishlist
                  productId={product._id}
                  productTitle={product.title}
                  productImage={product.images?.[0] || ""}
                  productPrice={product.price}
                  productSize={product.size}
                />
              </div>

              <div className="p-4">
                <h3 className="text-md font-semibold font-serif">
                  <span className="block lg:hidden">
                    {product.title.length > 18
                      ? `${product.title.slice(0, 18)}...`
                      : product.title}
                  </span>
                  <span className="hidden lg:block">
                    {product.title.length > 30
                      ? `${product.title.slice(0, 30)}...`
                      : product.title}
                  </span>
                </h3>

                <p className="text-md font-medium text-black">{product.size}</p>
                <p className="text-md font-semibold">₹{product.price}</p>
              </div>

              <div className="px-4 pb-4  gap-2 flex justify-between items-center">
                {!product.soldStatus ? (
                  <>
                    <PostCart
                      productId={product._id}
                      productTitle={product.title}
                      productImage={product.images?.[0] || ""}
                      productPrice={product.price}
                      productSize={product.size}
                      className="w-full lg:w-auto"
                    />
                    <BuyNowButton
                      product={product}
                      user={user}
                      className="w-full lg:w-auto"
                    />
                  </>
                ) : (
                  <span className="text-red-500 border border-red-600 px-4 py-2  font-semibold w-full text-sm text-center">
                    Sold Out
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Wardrobe;
