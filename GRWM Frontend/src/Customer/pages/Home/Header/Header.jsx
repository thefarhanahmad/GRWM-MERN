import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { BiSearch } from "react-icons/bi";
import Menu from "./Menu";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const ITEMS_URL = `${BASE_URL}/items`;

const Header = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [allData, setAllData] = useState([]); // full hierarchy
  const [suggestions, setSuggestions] = useState([]);
  const [placeholders, setPlaceholders] = useState([]);
  const [currentPlaceholder, setCurrentPlaceholder] = useState(
    "Search for products..."
  );
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHierarchy = async () => {
      try {
        const response = await axios.get(ITEMS_URL);
        if (response.data.success) {
          setAllData(response.data.data || []);
          const itemNames = response.data.data.map((item) => item.itemName);
          setPlaceholders(itemNames);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchHierarchy();
  }, []);

  useEffect(() => {
    if (!placeholders.length) return;
    let index = 0;
    const interval = setInterval(() => {
      setCurrentPlaceholder(`Search for ${placeholders[index]}...`);
      index = (index + 1) % placeholders.length;
    }, 3000);
    return () => clearInterval(interval);
  }, [placeholders]);

  useEffect(() => {
    const delay = setTimeout(() => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) {
        setIsSearching(false);
        setSuggestions([]);
        return;
      }

      const result = [];

      for (const item of allData) {
        const itemMatch = item.itemName.toLowerCase().includes(query);
        if (itemMatch) {
          result.push({
            type: "item",
            label: item.itemName,
            link: `/products?item=${item.itemName}`,
          });
        }

        for (const category of item.categories || []) {
          const catMatch = category.categoryName.toLowerCase().includes(query);
          if (catMatch) {
            result.push({
              type: "category",
              label: category.categoryName,
              link: `/products?category=${category.categoryName}`,
            });
          }

          for (const sub of category.subcategories || []) {
            const subMatch = sub.subcategoryName.toLowerCase().includes(query);
            if (subMatch) {
              result.push({
                type: "subcategory",
                label: sub.subcategoryName,
                link: `/products?subcategory=${sub.subcategoryName}`,
              });
            }
          }
        }
      }

      setSuggestions(result);
      setIsSearching(true);
    }, 300);
    return () => clearTimeout(delay);
  }, [searchTerm, allData]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (searchTerm.trim()) {
        navigate(`/products?search=${searchTerm.trim()}`);
        setSearchTerm("");
        setIsSearching(false);
      }
    }
  };

  const highlight = (text, term) => {
    if (!term) return <span>{text}</span>;
    const regex = new RegExp(`(${term})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <span key={i} className="text-black font-semibold">
          {part}
        </span>
      ) : (
        <span key={i} className="text-gray-600">
          {part}
        </span>
      )
    );
  };

  return (
    <div className="lg:px-12 bg-[#f1f2f3] px-3 md:px-0">
      <div className="lg:flex items-center lg:justify-center py-3 relative">
        {/* Centered Menu */}
        <div className=" flex justify-center lg:absolute lg:top-3 lg:left-1/2 lg:-translate-x-1/2 lg:z-10">
          <Menu />
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-[360px] [@media(min-width:1020px)]:w-[280px] [@media(min-width:1249px)]:w-[360px] sm:mt-4 mt-8 lg:mt-0 lg:ml-auto">
          <div className="relative w-full">
            <div className="flex items-center border-b-2 font-helveticaWorld border-black pb-1 px-2">
              <BiSearch className="text-black text-2xl mr-3" />
              <input
                type="text"
                placeholder={currentPlaceholder}
                className="outline-none w-full text-md bg-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Suggestions Dropdown */}
            {isSearching && suggestions.length > 0 && (
              <div
                className="absolute top-full left-0 mt-2 w-full z-50 bg-white text-black border rounded shadow-lg"
                style={{
                  maxHeight: "20rem",
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                <style>
                  {`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}
                </style>
                <ul>
                  {suggestions.map((item, index) => (
                    <Link
                      to={item.link}
                      key={index}
                      onClick={() => {
                        setSearchTerm("");
                        setIsSearching(false);
                      }}
                    >
                      <li className="flex gap-3 items-center p-3 hover:bg-gray-100 cursor-pointer text-md border-b">
                        <span className="text-sm font-medium text-black capitalize">
                          {highlight(item.label, searchTerm)}
                        </span>
                      </li>
                    </Link>
                  ))}
                </ul>
              </div>
            )}

            {isSearching && suggestions.length === 0 && (
              <div className="absolute top-full left-0 mt-2 w-full z-50 bg-white text-black border rounded shadow-lg">
                <div className="p-3 text-gray-500">No matches found.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
