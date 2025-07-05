import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import PostWishlist from "../../../components/wishlist/PostWishlist";
import PostCart from "../../../components/cart/PostCart";
import FollowButton from "../../../components/button/FollowButton";
import { Link } from "react-router-dom";
import BuyNowButton from "../../../components/BuyNowButton/BuyNowButton";
import { FiLoader } from "react-icons/fi";
import { IoIosArrowRoundForward } from "react-icons/io";
const BASE_URL = import.meta.env.VITE_BASE_URL;
import { FiWifiOff } from "react-icons/fi";
import NetworkError from "../../../../components/ErrorScreens/NetworkError";
import ProductCard from "../../../components/ProductCard";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const user = useSelector((state) => state.user.user);

  const fetchProducts = async (pageNum) => {
    try {
      const response = await axios.get(`${BASE_URL}/products?page=${pageNum}`);
      const filtered = user
        ? response.data.data.filter(
            (product) => product.vendor?._id !== user?._id
          )
        : response.data.data;

      setProducts((prev) => [...prev, ...filtered]);
      setHasMore(response.data.data.length > 0);
    } catch (err) {
      setError("Network Issue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page);
  }, [page]);

  const lastProductRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-black text-6xl" />
      </div>
    );
  }

  if (error) {
    return <NetworkError />;
  }

  return (
    <>
      <div className="lg:px-16 p-3 h-auto flex flex-col relative">
        <div className="flex items-center mb-6 justify-between relative">
          <h4 className="font-horizon font-semibold uppercase text-black lg:text-3xl text-xl">
            New Arrivals
          </h4>

          {/* Mobile Arrow Icon only */}
          <Link
            to="/products"
            className="bg-white border border-black p-2 rounded-full shadow-md lg:hidden"
          >
            <IoIosArrowRoundForward className="text-black" size={22} />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="hidden sm:grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.slice(0, 4).map((product, index) => (
            <ProductCard key={product._id} product={product} user={user} />
          ))}
        </div>
        <div className="grid sm:hidden grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.slice(0, 2).map((product, index) => (
            <ProductCard key={product._id} product={product} user={user} />
          ))}
        </div>

        {/* Desktop Arrow Icon (Hidden on Mobile) */}
        <div className="hidden lg:flex items-center">
          <Link
            to="/products"
            className="absolute right-4 top-6 lg:top-1/2 z-10 bg-white border border-black p-2 rounded-full shadow-md"
          >
            <IoIosArrowRoundForward className="text-black" size={22} />
          </Link>
        </div>
      </div>
    </>
  );
};

export default AllProducts;
