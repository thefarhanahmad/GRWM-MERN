import React, { useEffect, useState } from "react";
import axios from "axios";

const OccasionProducts = ({ token, baseUrl }) => {
  const [products, setProducts] = useState([]);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [occasionCounts, setOccasionCounts] = useState({});
  const [occasionImages, setOccasionImages] = useState({});

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
            const response = await axios.get(
              `${baseUrl}/own-products-by-occasion?occasion=${occasion}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success && response.data.data.length > 0) {
              counts[occasion] = response.data.data.length;
              images[occasion] = response.data.data.map(
                (product) => product.images?.[0] || ""
              ); // Ensure array
            } else {
              counts[occasion] = 0;
              images[occasion] = []; // Ensure empty array
            }
          } catch (err) {
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
  }, [baseUrl, token]);

  useEffect(() => {
    if (!selectedOccasion) return;

    const fetchProducts = async () => {
      setLoading(true);
      setProducts([]);
      setError("");

      try {
        const response = await axios.get(
          `${baseUrl}/own-products-by-occasion?occasion=${selectedOccasion}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

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
  }, [selectedOccasion, baseUrl, token]);

  return (
    <div className="lg:px-16 mx-auto px-4 md:p-4 md:mt-6 pb-20">
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
                    {/* Custom 6-Grid Layout */}
                    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full">
                      {[...Array(6)].map((_, index) => {
                        const img = occasionImages[occasion]?.[index];

                        return (
                          <div
                            key={index}
                            className={`relative overflow-hidden ${
                              index === 0 ? "col-span-2 row-span-2" : "" // First image large
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
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                {/* <svg
                                className="w-8 h-8 text-gray-400"
                                viewBox="0 0 512 512"
                                fill="currentColor"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <polygon points="385.829,128 385.829,256 347.429,291.072 307.2,256 272.457,241.371 306.59,165.51" fill="#D32E2A" />
                                <polygon points="384,385.219 256,385.219 255.39,383.391 226.133,356.291 255.39,308.041 270.629,271.848 355.962,302.043" fill="#3A5BBC" />
                                <polygon points="256.61,128.61 288.305,164.901 256.61,203.959 241.371,240.152 161.524,200.253 128,126.781 256,126.781" fill="#FBBB00" />
                                <polygon points="239.543,270.629 204.495,346.843 126.171,384 126.171,256 163.962,232.558 204.8,256" fill="#28B446" />
                                <polygon points="512,256 384,385.219 270.629,271.848 307.2,256 385.829,256" fill="#518EF8" />
                                <polygon points="255.39,383.391 255.39,512 126.171,384 239.543,270.629 255.39,307.2 255.39,308.041" fill="#91C646" />
                                <polygon points="241.371,240.152 204.8,256 126.171,256 0,256 128,126.781" fill="#FFD837" />
                                <polygon points="385.829,128 272.457,241.371 256.61,204.8 256.61,203.959 256.61,128.61 256.61,0" fill="#F14336" />
                              </svg> */}
                              </div>
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

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
            <div className="flex justify-center items-center h-44">
              <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
            </div>
          )}

          {!loading && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="relative rounded-sm overflow-hidden font-helveticaWorld shadow-md bg-white border border-gray-200 transition"
                >
                  {product.images?.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.title || "Product Image"}
                      className="w-full h-[330px] object-cover"
                    />
                  ) : (
                    <div className="w-full h-[320px] flex items-center justify-center bg-gray-200 text-gray-500">
                      No Image Available
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="text-md font-semibold truncate">
                      {product.title || "Unknown Product"}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      ₹{product.price}
                    </p>
                    <p className="text-sm text-black">
                      <span className="font-medium">Color:</span>{" "}
                      {product?.color || "N/A"}
                    </p>
                    <p className="text-sm text-black">
                      <span className="font-medium">Size:</span>{" "}
                      {product?.size || "N/A"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div className="text-center h-28 flex justify-center items-center text-gray-600">
                No products found for this Occasion.
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default OccasionProducts;
