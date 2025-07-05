import React, { useState, useEffect, useRef } from "react";
import Filter from "./Filter";
import ProductsPage from "./ProductsPage";
import { SlidersHorizontal, ChevronDown, LayoutGrid, List } from "lucide-react";

const FilterProducts = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSort, setActiveSort] = useState("New Arrivals");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isGridView, setIsGridView] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize on mount

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousemove", handleClickOutside);
    return () => document.removeEventListener("mousemove", handleClickOutside);
  }, []);

  const handleFilterOptionClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const sortOptions = [
    "New Arrivals",
    "Price: Low to High",
    "Price: High to Low",
  ];

  return (
    <div>
      <div className="flex justify-between items-center lg:px-20 mb-4 mt-8 px-4">
        {/* Filter Button */}
        <button
          className="px-7 rounded-full py-2 text-[16px] border border-black text-gray-900 font-merriweather flex items-center gap-4"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filter
        </button>
        <div className="flex gap-6">
          {/* Grid/List View */}
          <button
            className="p-2 border hidden lg:block rounded-full"
            onClick={() => setIsGridView(!isGridView)}
            title={isGridView ? "Switch to List View" : "Switch to Grid View"}
          >
            {isGridView ? (
              <List className="w-7 h-7 text-gray-800" />
            ) : (
              <LayoutGrid className="w-7 h-7 text-gray-800" />
            )}
          </button>

          {/* Sorting Options */}
          <div className="hidden lg:flex items-center gap-4">
            <p className="font-merriweather text-[17px] text-gray-900">
              Sort By :
            </p>
            <div
              ref={dropdownRef}
              className="px-4 rounded-full py-2 text-md border border-black text-black flex items-center gap-2 relative"
            >
              <div
                className="bg-white rounded-full cursor-pointer flex font-merriweather items-center gap-2  text-[16px] text-gray-900"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {activeSort}
                <ChevronDown className="w-5 h-5" />
              </div>
              {isDropdownOpen && (
                <div className="absolute top-full w-48 right-2 bg-white text-md  font-merriweather shadow-md rounded-md z-[1000]">
                  {sortOptions.map((option) => (
                    <div
                      key={option}
                      className="px-6  py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setActiveSort(option);
                        setIsDropdownOpen(false);
                      }}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col sm:flex-row gap-0">
        {/* Left Side: Filter */}
        <div
          className={`transition-all duration-300 ${
            isSidebarOpen
              ? "w-full sm:w-80 h-full lg:sticky top-0"
              : "w-0 overflow-hidden"
          }`}
        >
          <Filter
            isSidebarOpen={isSidebarOpen}
            setIsSidebarOpen={setIsSidebarOpen}
            onOptionClick={handleFilterOptionClick}
          />
        </div>

        {/* Right Side: Show Products */}
        <div className="flex-1 min-w-0 transition-all duration-300">
          <ProductsPage
            isGridView={isGridView}
            isSidebarOpen={isSidebarOpen}
            activeSort={activeSort}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterProducts;
