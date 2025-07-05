import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../../../components/style/style.css";

const Menu = () => {
  const [items, setItems] = useState([]);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
  const [hoveredSubcategoryId, setHoveredSubcategoryId] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/items`
        );
        setItems(response.data.data);
      } catch (err) {
        console.error("Failed to fetch menu items:", err);
      }
    };

    fetchMenuItems();

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setHoveredItem(null);
        setHoveredCategoryId(null);
        setHoveredSubcategoryId(null);
      }
    };

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleMouseEnter = (itemName) => {
    setHoveredItem(itemName);
  };

  const handleCategoryMouseEnter = (categoryId) => {
    setHoveredCategoryId(categoryId);
  };

  const handleSubcategoryMouseEnter = (subcategoryId) => {
    setHoveredSubcategoryId(subcategoryId);
  };

  const handleSubcategoryClick = (item, category, sub) => {
    navigate(
      `/products?item=${item.itemName}&category=${category.categoryName}&subcategory=${sub.subcategoryName}`
    );
  };

  return (
    <nav className="relative z-50   w-full" ref={menuRef}>
      <ul className="flex w-full items-center font-helveticaWorld  justify-center lg:px-0 space-x-3.5 lg:space-x-10 text-black font-medium  text-[15px] md:text-[18px] ">
        {items.map((item) => (
          <li
            key={item._id}
            className="relative cursor-pointer group transition-all duration-300 ease-in-out"
            onMouseEnter={() => handleMouseEnter(item.itemName)}
          >
            <span className="hover:font-semibold transition">
              {item.itemName}
            </span>

            {hoveredItem === item.itemName &&
              item.categories &&
              item.categories.length > 0 && (
                <div
                  className={`${
                    isDesktop
                      ? "absolute top-full mt-3 left-0 lg:-left-10"
                      : "fixed top-10 left-1/2 -translate-x-1/2"
                  } w-[250px] bg-white shadow-xl border border-gray-100 rounded-lg z-[1000] transition-all duration-300 ease-in-out`}
                  onMouseEnter={() => handleCategoryMouseEnter(item.itemName)}
                >
                  <div className="max-h-80 mb-2 overflow-y-auto hide-scrollbar w-full pr-1">
                    {item.categories.map((category) => (
                      <div key={category._id}>
                        <div
                          className="px-6 py-3 text-[15px]  text-gray-800 hover:bg-gray-100  rounded-md flex justify-between items-center transition-all duration-200 ease-in-out truncate-text cursor-pointer"
                          title={category.categoryName}
                          onClick={() =>
                            navigate(
                              `/products?item=${item.itemName}&category=${category.categoryName}`
                            )
                          }
                          onMouseEnter={() =>
                            handleCategoryMouseEnter(category._id)
                          }
                        >
                          {category.categoryName}
                          {category.subcategories.length > 0 && isDesktop && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-4 h-4 text-gray-500 ml-2"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          )}
                        </div>

                        {isDesktop &&
                          hoveredCategoryId === category._id &&
                          category.subcategories.length > 0 && (
                            <div
                              className="absolute left-full top-4 w-[240px] max-h-80 overflow-y-auto hide-scrollbar bg-white shadow-lg border border-gray-100 rounded-lg z-[1000] transition-all duration-300 ease-in-out"
                              onMouseEnter={() =>
                                handleSubcategoryMouseEnter(category._id)
                              }
                            >
                              {category.subcategories.map((sub) => (
                                <div
                                  key={sub._id}
                                  className="px-6 py-3 text-[14px] font-normal text-gray-700 hover:bg-gray-100  rounded-md cursor-pointer transition duration-200 ease-in-out truncate-text"
                                  title={sub.subcategoryName}
                                  onClick={() =>
                                    handleSubcategoryClick(item, category, sub)
                                  }
                                >
                                  {sub.subcategoryName}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Menu;
