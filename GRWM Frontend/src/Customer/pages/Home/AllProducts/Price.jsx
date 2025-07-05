import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Price = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const priceContainerRef = useRef(null);
  const [priceRanges, setPriceRanges] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [filtering, setFiltering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/products`
        );
        const productData = response.data.data;
        setProducts(productData);
        generatePriceRanges(productData);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const generatePriceRanges = () => {
    const customRanges = [
      { label: "Under ₹299", max: 299 },
      { label: "Under ₹499", max: 499 },
      { label: "Under ₹749", max: 749 },
      { label: "Under ₹999", max: 999 },
      { label: "Under ₹1499", max: 1499 },
      { label: "Under ₹2999", max: 2999 },
      { label: "Under ₹3499", max: 3499 },
      { label: "Under ₹4999", max: 4999 },
    ];

    setPriceRanges(customRanges);
  };

  const filterProductsByPrice = (maxPrice) => {
    setSelectedPrice(maxPrice);
    setFiltering(true);

    const url = `/products?priceUnder=${maxPrice}`;
    navigate(url);
  };

  const scrollPriceContainer = (direction) => {
    if (priceContainerRef.current) {
      priceContainerRef.current.scrollBy({
        left: direction === "left" ? -250 : 250,
        behavior: "smooth",
      });
    }
  };

  if (error) return null;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-3 lg:px-16 py-7 md:py-9  relative">
      <h4 className="font-horizon mb-6 mt-4 uppercase font-semibold text-black lg:text-3xl text-xl">
        Shop By Price
      </h4>

      <div className="relative">
        {/* Left Scroll Button */}
        <button
          onClick={() => scrollPriceContainer("left")}
          className="absolute lg:-left-2 left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-black p-2 rounded-full shadow-md"
        >
          <FaChevronLeft className="text-black" size={16} />
        </button>

        {/* Price Range Scrollable Container */}
        <div
          ref={priceContainerRef}
          className="flex overflow-x-auto gap-3 font-openSans lg:gap-8 px-6 sm:px-10 scroll-smooth hide-scrollbar"
        >
          {priceRanges.map((range, index) => (
            <p
              key={index}
              className={`bg-white border rounded-sm text-sm sm:text-md lg:text-lg px-4 lg:px-8 py-2 text-black cursor-pointer transition whitespace-nowrap
                ${
                  selectedPrice === range.max
                    ? "border-2 border-black"
                    : "border-gray-300"
                }`}
              onClick={() => filterProductsByPrice(range.max)}
            >
              {range.label}
            </p>
          ))}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scrollPriceContainer("right")}
          className="absolute lg:-right-4 right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-black p-2 rounded-full shadow-md"
        >
          <FaChevronRight className="text-black" size={16} />
        </button>
      </div>

      {/* Loading Spinner on filter */}
      {filtering && (
        <div className="flex justify-center items-center py-4">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Scrollbar Hide Style */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
};

export default Price;
