import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiLoader } from "react-icons/fi";
import PostWishlist from "../../components/wishlist/PostWishlist";
import PostCart from "../../components/cart/PostCart";
import BuyNowButton from "../../components/BuyNowButton/BuyNowButton";
import ProductCard from "../../components/ProductCard";

const VendorOccasions = ({ token, baseUrl, vendorId }) => {
  const [products, setProducts] = useState([]);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [occasionCounts, setOccasionCounts] = useState({});
  const [occasionImages, setOccasionImages] = useState({});

  const user = useSelector((state) => state.user.user);

  const occasions = [
    "Casual",
    "Formal",
    "Party",
    "Wedding",
    "Vacation",
    "Work",
    "Festival",
  ];

  useEffect(() => {
    const fetchOccasionData = async () => {
      let counts = {};
      let images = {};
      try {
        const fetchPromises = occasions.map(async (occasion) => {
          try {
            const url = `${baseUrl}/user-occassion-products/${vendorId}?occasion=${occasion}`;
            const response = await axios.get(url, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.success && response.data.data.length > 0) {
              counts[occasion] = response.data.data.length;
              images[occasion] = response.data.data.map(
                (product) => product.images?.[0] || ""
              );
            } else {
              counts[occasion] = 0;
              images[occasion] = [];
            }
          } catch {
            counts[occasion] = 0;
            images[occasion] = [];
          }
        });

        await Promise.all(fetchPromises);
        setOccasionCounts(counts);
        setOccasionImages(images);
      } catch (err) {
        console.error("Error fetching occasion data:", err);
      }
    };

    fetchOccasionData();
  }, [baseUrl, token, vendorId]);

  useEffect(() => {
    if (!selectedOccasion) return;

    const fetchProducts = async () => {
      setLoading(true);
      setProducts([]);
      setError("");

      try {
        const url = `${baseUrl}/user-occassion-products/${vendorId}?occasion=${selectedOccasion}`;
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setProducts(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedOccasion, baseUrl, token, vendorId]);

  return (
    <div className="mx-auto p-4 mt-2 md:mt-5 pb-20">
      {!selectedOccasion ? (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-8 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-8">
          {occasions.map(
            (occasion) =>
              occasionCounts[occasion] > 0 && (
                <div
                  key={occasion}
                  onClick={() => setSelectedOccasion(occasion)}
                  className="group cursor-pointer flex flex-col items-center h-full justify-between border border-gray-300 bg-white p-4 rounded-2xl sm:rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 ease-out hover:border-gray-400 hover:scale-105 relative overflow-hidden"
                >
                  <div className="w-full aspect-square relative overflow-hidden rounded-xl sm:rounded-2xl">
                    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full">
                      {[...Array(6)].map((_, index) => {
                        const img = occasionImages[occasion]?.[index];

                        return (
                          <div
                            key={index}
                            className={`relative overflow-hidden ${
                              index === 0 ? "col-span-2 row-span-2" : ""
                            }`}
                          >
                            {img ? (
                              <img
                                src={img}
                                alt={occasion}
                                className="w-full h-full object-cover absolute inset-0 transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="w-full pt-3 px-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {occasion}
                      </h3>
                      <span className="flex-shrink-0 ml-2 text-xs font-medium text-primary-800 bg-primary-100/80 px-2 py-1 rounded-full">
                        {occasionCounts[occasion]} items
                      </span>
                    </div>
                  </div>
                </div>
              )
          )}
        </div>
      ) : (
        <>
          <button
            onClick={() => setSelectedOccasion(null)}
            className="mb-6 px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-900 transition"
          >
            ← Back
          </button>

          {loading && (
            <div className="flex justify-center items-center h-screen">
              <FiLoader className="animate-spin text-black text-5xl" />
            </div>
          )}

          {!loading && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-12 lg:gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  user={user}
                  hideFollowBtn={true}
                />
              ))}
            </div>
          ) : !loading && products.length === 0 ? (
            <p className="text-center text-gray-600 mt-10">
              No products available.
            </p>
          ) : (
            <div className="text-center h-28 flex justify-center items-center text-gray-600">
              No products found for this Occasion.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VendorOccasions;
