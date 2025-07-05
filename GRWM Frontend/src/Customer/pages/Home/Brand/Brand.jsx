import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const Brand = () => {
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const brandContainerRef = useRef(null);
  const brandItemRef = useRef(null);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/brands`
        );
        if (response.data && response.data.data) {
          setBrand(response.data.data);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (err) {
        setError(true); // Just set error flag, no UI message
      } finally {
        setLoading(false);
      }
    };

    fetchBrand();
  }, []);

  const scrollBrandContainer = (direction) => {
    const container = brandContainerRef.current;
    const item = brandItemRef.current;

    if (!container || !item) return;

    // Get the actual gap between items (e.g., Tailwind's gap-8 = 2rem = 32px)
    const gap =
      parseInt(
        getComputedStyle(container).columnGap ||
          getComputedStyle(container).gap ||
          0,
        10
      ) || 0;

    const screenWidth = window.innerWidth;
    let itemsToScroll = 1;

    if (screenWidth >= 1024) {
      // lg and xl
      container.scrollBy({
        left: direction === "left" ? -1000 : 1000,
        behavior: "smooth",
      });
      return;
    } else if (screenWidth >= 768) {
      // md
      itemsToScroll = 5;
    } else if (screenWidth >= 640) {
      // sm
      itemsToScroll = 3;
    } else {
      // xs
      itemsToScroll = 1;
    }

    const scrollAmount = (item.offsetWidth + gap) * itemsToScroll;

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // If loading or error, render nothing (hide UI)
  if (loading || error) return null;

  return (
    <div className="p-3 lg:px-16 py-7 md:py-9  relative">
      <h2 className="lg:text-3xl text-xl font-horizon font-bold lg:mb-4 mb-0 mt-3">
        SHOP BY BRANDS
      </h2>

      {/* Left Arrow Button */}
      <button
        onClick={() => scrollBrandContainer("left")}
        className="absolute left-2 lg:left-8 bottom-14 md:bottom-[4.5rem] transform -translate-y-1/2 z-10 bg-white border border-black p-2 rounded-full shadow-md"
      >
        <FaChevronLeft className="text-black" size={16} />
      </button>

      {/* Brand List Container */}
      <div
        ref={brandContainerRef}
        className="flex overflow-x-auto gap-8 lg:gap-0 lg:px-0 px-4 scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {Array.isArray(brand) ? (
          brand.map((b, index) => (
            <Link
               to={`/products?brand=${encodeURIComponent(b.brandName)}`}
              key={b._id}
              ref={index === 0 ? brandItemRef : null}
              className="flex flex-col  items-center transition"
              style={{ flex: "0 0 calc(16.666% - 10px)" }}
            >
              <div className="w-28 h-28 md:w-[8rem] md:h-[8rem] flex items-center justify-center ">
                <img
                  src={b.brandLogo}
                  alt={b.brandName}
                  className="w-full h-full object-contain "
                />
              </div>
            </Link>
          ))
        ) : brand && typeof brand === "object" ? (
          <div className="flex flex-col bg-green-500  items-center border p-4 rounded-lg shadow-md hover:shadow-lg transition">
            <Link to={`/products?brand=${brand.brandName}`}>
              <img
                src={brand.brandLogo}
                alt={brand.brandName}
                className="w-20 h-20 object-contain"
              />
              <p className="mt-2 font-semibold">{brand.brandName}</p>
            </Link>
          </div>
        ) : null}
      </div>

      {/* Right Arrow Button */}
      <button
        onClick={() => scrollBrandContainer("right")}
        className="absolute right-2 lg:right-12 bottom-14 md:bottom-[4.5rem] transform -translate-y-1/2 z-10 bg-white border border-black p-2 rounded-full shadow-md"
      >
        <FaChevronRight className="text-black" size={16} />
      </button>

      {/* Custom CSS for hiding scrollbar */}
      <style>
        {`
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    .scrollbar-hide {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
  `}
      </style>
    </div>
  );
};

export default Brand;
