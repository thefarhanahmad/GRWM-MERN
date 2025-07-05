import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import ProductCard from "../../components/ProductCard";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FollowedSellers = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSmOrLarger, setIsSmOrLarger] = useState(false);
  const user = useSelector((state) => state.user.user);
  const following = user?.following || [];
  const token = user?.token || localStorage.getItem("token");

  useEffect(() => {
    const fetchProducts = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${BASE_URL}/followed-sellers/products`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.success) {
          setProducts(response.data.data);
        } else {
          console.error(response.data.message || "Failed to fetch products.");
        }
      } catch (err) {
        console.error("An error occurred while fetching products:", err);
      }

      setLoading(false);
    };

    fetchProducts();
  }, [following]);

  // Check screen size on initial render and on resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmOrLarger(window.innerWidth >= 640); // Tailwind's `sm:` = 640px
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const CustomArrow = ({ onClick, direction }) => (
    <button
      onClick={onClick}
      className={`absolute top-52 lg:top-1/2 -translate-y-1/2 z-[1000] bg-white border border-black p-2 rounded-full shadow-md 
        ${direction === "left"
          ? "lg:left-[-32px] left-2"
          : "lg:right-[-32px] right-2"
        }
        hover:bg-gray-200`}
    >
      {direction === "left" ? (
        <BsChevronLeft size={18} />
      ) : (
        <BsChevronRight size={18} />
      )}
    </button>
  );

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    prevArrow: <CustomArrow direction="left" />,
    nextArrow: <CustomArrow direction="right" />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 740,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (loading || following.length === 0 || products.length === 0) {
    return null;
  }

  return (
    <div className="p-3 lg:px-16 pt-5 md:pt-9  relative">
      <h2 className="lg:text-3xl text-xl font-horizon uppercase font-bold mb-5 mt-3">
        Products from Followed Sellers
      </h2>

      {products.length > 1 && isSmOrLarger ? (
        <Slider {...sliderSettings} className="gap-8 md:shadow-sm md:rounded">
          {products.map((product) => (
            <div key={product._id} className="px-2">
              <ProductCard product={product} user={user} />
            </div>
          ))}
        </Slider>
      ) : products.length === 1 ? (
        <div className="flex justify-start">
          <div className="lg:w-[350px] sm:w-[300px]">
            <ProductCard product={products[0]} user={user} />
          </div>
        </div>
      ) : (
        <>
          <div className="hidden sm:grid grid-cols-2 sm:grid-cols-2 gap-4">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product._id} product={product} user={user} />
            ))}
          </div>
          <div className="sm:hidden grid grid-cols-2 sm:grid-cols-2 gap-4">
            {products.slice(0, 2).map((product) => (
              <ProductCard key={product._id} product={product} user={user} />
            ))}
          </div>
        </>
      )}
    </div>
  );

};

export default FollowedSellers;
