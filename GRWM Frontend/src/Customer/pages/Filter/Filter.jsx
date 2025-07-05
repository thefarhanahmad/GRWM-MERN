import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Range } from "react-range";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import "../../../components/style/style.css";

const Filter = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [priceRange, setPriceRange] = useState([100, 10000]); // [min, max]

  const [showCategories, setShowCategories] = useState(false);
  const [showOccasions, setShowOccasions] = useState(false);
  const [showGender, setShowGender] = useState(false);
  const [showColors, setShowColors] = useState(false);

  const [showBrands, setShowBrands] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/categories`
        );
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/brands`
        );
        if (response.data.success) {
          setBrands(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      }
    };
    fetchBrands();
  }, []);

  const getCurrentFilterValue = (filterType) => {
    const params = new URLSearchParams(location.search);
    return params.get(filterType);
  };

  const handleSelection = (filterType, value) => {
    const params = new URLSearchParams();
    params.set(filterType, value); // Purane filters remove kar ke sirf naye filter set karega

    navigate({ pathname: "/products", search: params.toString() });

    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const handlePriceChange = (values) => {
    const params = new URLSearchParams(location.search);
    params.set("minPrice", values[0]);
    params.set("maxPrice", values[1]);

    navigate({ pathname: "/products", search: params.toString() });

    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const currentCategory = getCurrentFilterValue("category");
  const currentBrand = getCurrentFilterValue("brand");
  const currentSize = getCurrentFilterValue("size");
  const currentColor = getCurrentFilterValue("color");

  const sizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "6 UK",
    "7 UK",
    "8 UK",
    "9 UK",
    "10 UK",
    "11 UK",
    "Free Size",
  ];

  const colors = [
    "Beige",
    "Black",
    "Blue",
    "Brown",
    "Dark Blue",
    "Dark Green",
    "Gold",
    "Green",
    "Grey",
    "Khaki",
    "Light Blue",
    "Light Green",
    "Light Pink",
    "Maroon",
    "Metallic",
    "Multicolour",
    "Off White",
    "Olive",
    "Orange",
    "Pink",
    "Purple",
    "Red",
    "Silver",
    "White",
    "Yellow",
  ];

  return (
    <div className="relative pl:p-0 pb-8  font-openSans">
      <div
        className={`bg-white  lg:pl-20   transform transition-all duration-300 z-40 
          ${isSidebarOpen ? "w-80 p-4   " : "w-0 max-h-0  "}`}
      >
        <div>
          <p className="text-lg font-merriweather flex items-center justify-between cursor-pointer   mb-4 mt-4">
            Price
          </p>
          <div className="w-full max-w-[100%] sm:max-w-[350px]">
            <Range
              step={100}
              min={50}
              max={10000}
              values={priceRange}
              onChange={setPriceRange}
              onFinalChange={handlePriceChange}
              renderTrack={({ props, children }) => (
                <div {...props} className="h-2 bg-gray-200 rounded">
                  {children}
                </div>
              )}
              renderThumb={({ props }) => (
                <div
                  {...props}
                  className="h-5 w-5 bg-black rounded-full shadow"
                />
              )}
            />
          </div>

          <div className="flex justify-between mt-4 font-merriweather text-md text-gray-800">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>

          <div className="border mt-4 mb-4"></div>

          <p
            className="text-lg font-merriweather flex items-center justify-between cursor-pointer"
            onClick={() => setShowSizes(!showSizes)}
          >
            Shop By Size
            {showSizes ? (
              <FiChevronUp size={22} />
            ) : (
              <FiChevronDown size={22} />
            )}
          </p>

          {showSizes && (
            <ul className="space-y-2 mt-4  max-h-60 overflow-y-auto pr-2 hide-scrollbar">
              {sizes.map((size) => (
                <li
                  key={size}
                  className={`flex items-center font-merriweather space-x-2 cursor-pointer text-md
          ${
            currentSize === size ? "text-black font-semibold" : "text-gray-700"
          }`}
                  onClick={() => handleSelection("size", size)}
                >
                  {size}
                </li>
              ))}
            </ul>
          )}

          <div className="border mt-4 mb-4"></div>

          <p
            className="text-lg font-merriweather flex items-center justify-between cursor-pointer"
            onClick={() => setShowBrands(!showBrands)}
          >
            Shop By Brands
            {showBrands ? (
              <FiChevronUp size={22} />
            ) : (
              <FiChevronDown size={22} />
            )}
          </p>

          {showBrands && (
            <ul className="space-y-3 mt-4 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 hide-scrollbar scrollbar-track-gray-100">
              {brands.map((brand) => (
                <li
                  key={brand._id}
                  className={`flex items-center font-merriweather space-x-2 cursor-pointer text-md
          ${
            currentBrand === brand.brandName
              ? "text-black font-semibold"
              : "text-gray-700"
          }`}
                  onClick={() => handleSelection("brand", brand.brandName)}
                >
                  {brand.brandName}
                </li>
              ))}
            </ul>
          )}

          <div className="border mt-4 mb-4"></div>

          <p
            className="text-lg flex font-merriweather items-center justify-between cursor-pointer"
            onClick={() => setShowOccasions(!showOccasions)}
          >
            Shop By Occasion
            {showOccasions ? (
              <FiChevronUp size={22} />
            ) : (
              <FiChevronDown size={22} />
            )}
          </p>

          {showOccasions && (
            <ul className="space-y-3 mt-4 max-h-60 overflow-y-auto pr-2 hide-scrollbar">
              {[
                "Vacation",
                "Party",
                "Wedding",
                "Work",
                "Festival",
                "Casual",
                "Formal",
              ].map((occasion) => (
                <li
                  key={occasion}
                  className={`flex items-center font-merriweather space-x-2 cursor-pointer text-md ${
                    getCurrentFilterValue("occasion") === occasion
                      ? "text-black font-semibold"
                      : "text-gray-700"
                  }`}
                  onClick={() => handleSelection("occasion", occasion)}
                >
                  {occasion}
                </li>
              ))}
            </ul>
          )}
          <div className="border mt-4 mb-4"></div>

          <p
            className="text-lg font-merriweather flex items-center justify-between cursor-pointer"
            onClick={() => setShowGender(!showGender)}
          >
            Shop for
            {showGender ? (
              <FiChevronUp size={22} />
            ) : (
              <FiChevronDown size={22} />
            )}
          </p>
          {showGender && (
            <ul className="space-y-3 mt-4  max-h-60 overflow-y-auto pr-2 hide-scrollbar">
              {["Men", "Women"].map((item) => (
                <li
                  key={item}
                  className={`flex items-center font-merriweather space-x-2  cursor-pointer text-md ${
                    getCurrentFilterValue("item") === item
                      ? "text-black font-semibold"
                      : "text-gray-700"
                  }`}
                  onClick={() => handleSelection("item", item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}

          <div className="border mt-4 mb-4"></div>

          <p
            className="text-lg font-merriweather flex items-center justify-between cursor-pointer"
            onClick={() => setShowColors(!showColors)}
          >
            Shop By Colour
            {showColors ? (
              <FiChevronUp size={22} />
            ) : (
              <FiChevronDown size={22} />
            )}
          </p>

          {showColors && (
            <ul className="space-y-3 mt-4 max-h-60 overflow-y-auto pr-2 hide-scrollbar">
              {colors.map((color) => (
                <li
                  key={color}
                  className={`flex items-center font-merriweather space-x-2 cursor-pointer text-md ${
                    currentColor === color
                      ? "text-black font-semibold"
                      : "text-gray-700"
                  }`}
                  onClick={() => handleSelection("color", color)}
                >
                  {color}
                </li>
              ))}
            </ul>
          )}

          <div className="border mt-4 mb-4"></div>

          <p
            className="text-lg  font-merriweather flex items-center justify-between cursor-pointer"
            onClick={() => setShowCategories(!showCategories)}
          >
            Shop By Categories
            {showCategories ? (
              <FiChevronUp size={22} />
            ) : (
              <FiChevronDown size={22} />
            )}
          </p>

          {showCategories && (
            <ul className="space-y-3 mt-4  max-h-60 overflow-y-auto pr-2 hide-scrollbar">
              {categories.map((category) => (
                <li
                  key={category._id}
                  className={`flex items-center font-merriweather space-x-2 cursor-pointer text-md
          ${
            currentCategory === category.categoryName
              ? "text-black font-semibold"
              : "text-gray-700"
          }`}
                  onClick={() =>
                    handleSelection("category", category.categoryName)
                  }
                >
                  {category.categoryName}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Filter;
