import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CustomArrow = ({ onClick, direction, isDisabled }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`absolute top-1/2 -translate-y-1/2 z-10 p-2 rounded-full border border-black bg-white   shadow transition
      ${direction === "left" ? "left-0 lg:-left-6" : "right-0 lg:-right-6"}
      ${
        isDisabled
          ? "opacity-60  cursor-not-allowed text-black font-semibold"
          : "hover:bg-gray-100 text-black font-semibold"
      }
    `}
  >
    {direction === "left" ? (
      <BsChevronLeft size={18} />
    ) : (
      <BsChevronRight size={18} />
    )}
  </button>
);

const OccassionProducts = () => {
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  useEffect(() => {
    const fetchOccasions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/get-Occasions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setOccasions(response.data.data);
        } else {
          console.error(response.data.message || "Failed to fetch occasions.");
        }
      } catch (err) {
        console.error("An error occurred while fetching occasions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOccasions();
  }, []);

  const slidesToShow = 4;

  const settings = {
    dots: false,
    infinite: false,
    speed: 600,
    slidesToShow,
    slidesToScroll: 1,
    beforeChange: (_, next) => setCurrentSlide(next),
    prevArrow: (
      <CustomArrow
        direction="left"
        onClick={() => sliderRef.current?.slickPrev()}
        isDisabled={currentSlide === 0}
      />
    ),
    nextArrow: (
      <CustomArrow
        direction="right"
        onClick={() => sliderRef.current?.slickNext()}
        isDisabled={currentSlide >= occasions.length - slidesToShow}
      />
    ),
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
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (loading || occasions.length === 0) return null;

  return (
    <div className="p-3 lg:px-16 pt-5 md:pt-9 relative w-full overflow-x-hidden">
      <h2 className="lg:text-3xl text-xl font-horizon uppercase font-bold mb-5 mt-3">
        Pick Your Occasion
      </h2>

      <Slider
        {...settings}
        ref={sliderRef}
        className="gap-8 font-openSans md:shadow md:rounded"
      >
        {occasions.map((item, index) => (
          <div key={index} className="px-2">
            <Link
              to={`/products?occasion=${item.occasion}`}
              className="block group"
            >
              <div className="relative w-full h-[210px] lg:h-[350px] overflow-hidden rounded-md shadow">
                <img
                  src={`${item.image}`}
                  alt={item.occasion}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-60 text-white text-center py-2 text-sm sm:text-lg lg:text-xl font-semibold">
                  {item.occasion}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default OccassionProducts;
