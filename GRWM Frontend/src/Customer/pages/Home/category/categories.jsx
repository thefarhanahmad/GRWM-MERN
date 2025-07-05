import React, { useEffect, useState } from "react";
import axios from "axios";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/categories`
        );
        console.log("API Response:", response.data);

        if (response.data && Array.isArray(response.data.data)) {
          setCategories(response.data.data);
        } else {
          console.error("Unexpected API response format:", response.data);
          setCategories([]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Spinner for Loading State
  // if (loading)
  //   return (
  //     <div className="flex justify-center items-center py-6">
  //       <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
  //     </div>
  //   );

  if (error) return <p className="text-center text-red-500">Error: {error}</p>;

  // Function to capitalize first letter
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div>
      <div className="flex  gap-2">
        {categories.map((category) => (
          <div
            key={category._id}
            className="text-black px-4 py-3 rounded-lg text-md font-semibold"
          >
            {capitalizeFirstLetter(category.categoryName)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
