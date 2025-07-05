import React, { useEffect, useState } from "react";
import axios from "axios";
import PostCart from "../../../components/cart/PostCart";
import PostWishlist from "../../../components/wishlist/PostWishlist";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import BuyNowButton from "../../../components/BuyNowButton/BuyNowButton";
import FollowButton from "../../../components/button/FollowButton";
import { FiLoader } from "react-icons/fi";
import { IoIosArrowRoundForward } from "react-icons/io";
import ProductCard from "../../../components/ProductCard";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const Spotlight = () => {
  const [section, setSection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchSection = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/section`);
        console.log("Spotlight API Response:", response.data);

        const sectionData = response.data.data[0];
        setSection(sectionData);

        let allProducts = sectionData?.products || [];
        allProducts = allProducts.filter(
          (product) => product.vendor !== user?._id
        );

        const boostedProducts = allProducts.filter(
          (product) => product.isBoosted
        );
        const normalProducts = allProducts.filter(
          (product) => !product.isBoosted
        );
        setProducts([...boostedProducts, ...normalProducts]);
      } catch (err) {
        console.error("Failed to fetch section data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSection();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-black text-5xl" />
      </div>
    );
  }

  if (!section || products.length === 0) {
    return null;
  }

  return (
    <div className="bg-black p-3 sm:p-6 lg:px-16  py-5 sm:py-6 relative">
      <div className="flex  flex-col">
        <div className="flex justify-between">
          <h2 className="lg:text-3xl -mt-1  sm:text-lg font-horizon uppercase text-white">
            {section?.title}
          </h2>
          <Link
            to="/seller/hub"
            className="bg-white h-fit font-openSans text-sm sm:text-xl text-black px-4 sm:px-5 md:px-10  py-1 md:py-2 rounded-lg hover:bg-gray-300 transition shadow-md"
          >
            Boost
          </Link>
        </div>
        <div>
          <p className="text-gray-300 text-sm sm:text-lg mb-2 md:mb-4 mt-2">
            Sellers can boost their wardrobe’s visibility by investing in
            spotlight features — making their listings stand out and reach the
            right buyers.
          </p>
        </div>
      </div>
      <div className="flex w-full justify-end  md:hidden mb-2">
        <Link
          to="/Wardrobe/products"
          className="bg-white border border-black p-2 rounded-full shadow-md"
        >
          <IoIosArrowRoundForward className="text-black" size={20} />
        </Link>
      </div>
      <div
        className={`grid sm:hidden ${
          products?.length === 1 ? "grid-cols-1" : "grid-cols-2"
        }  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3`}
      >
        {products.slice(0, 2).map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            user={user}
            cartTexttoShow={products?.length === 1 ? true : false}
          />
        ))}
      </div>
      <div
        className={`hidden sm:grid ${
          products?.length === 1 ? "grid-cols-1" : "grid-cols-2"
        }  sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3`}
      >
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            user={user}
            cartTexttoShow={products?.length === 1 ? true : false}
          />
        ))}
      </div>

      <div className="md:flex justify-end hidden  md:mt-0 top-28 absolute right-4 md:top-1/2 md:-translate-y-1/2">
        <Link
          to="/Wardrobe/products"
          className="bg-white border mt-8 border-black p-2 rounded-full shadow-md"
        >
          <IoIosArrowRoundForward className="text-black" size={20} />
        </Link>
      </div>
    </div>
  );
};

export default Spotlight;
