import React, { useState, useRef, useEffect } from "react";
import PostWishlist from "../../../components/wishlist/PostWishlist";
import { motion } from "framer-motion";

const ProductImagesWithZoom = ({ product }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(2.5);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });

  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const zoomRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;

    const { left, top, width, height } =
      containerRef.current.getBoundingClientRect();

    const x = e.clientX - left;
    const y = e.clientY - top;

    setMagnifierPos({ x, y });

    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;

    if (zoomRef.current) {
      zoomRef.current.style.backgroundPosition = `${bgX}% ${bgY}%`;
    }
  };

  const handleWheel = (e) => {
    if (isMobile) return;
    e.preventDefault();
    setZoomLevel((prev) =>
      Math.min(Math.max(1.5, prev + (e.deltaY > 0 ? -0.2 : 0.2)), 4)
    );
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const imageElement = imgRef.current;
    if (imageElement) {
      imageElement.addEventListener("wheel", handleWheel, { passive: false });
    }
    return () => {
      if (imageElement) {
        imageElement.removeEventListener("wheel", handleWheel);
      }
    };
  }, [isMobile]);

  return (
    <div className="w-full lg:pl-20 flex justify-center items-center">
      <div className="w-full max-w-5xl flex flex-col items-center justify-center gap-6">
        {/* Desktop View */}
        <div className="hidden md:flex items-center justify-center gap-6 relative">
          {/* Thumbnails */}
          {product.images?.length > 1 && (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[640px]">
              {product.images.slice(0, 6).map((img, index) => (
                <motion.div
                  key={index}
                  className={`w-16 h-16 md:w-24 md:h-24 rounded-lg cursor-pointer overflow-hidden border-2 relative ${
                    index === selectedImageIndex
                      ? "border-blue-500 shadow-md"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={img}
                    alt={`Thumb ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === selectedImageIndex && (
                    <div className="absolute inset-0 bg-blue-500/20 pointer-events-none" />
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Main Image with Magnifier */}
          <div
            ref={containerRef}
            className="relative sm:w-[250px] sm:h-[300px] md:w-[300px] md:h-[500px] lg:w-[580px] lg:h-[650px] bg-white rounded-lg overflow-hidden group"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.img
              ref={imgRef}
              key={selectedImageIndex}
              src={
                product.images?.[selectedImageIndex] ||
                "https://via.placeholder.com/500"
              }
              alt={product.title}
              className="w-full h-full object-contain rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* Magnifier Glass */}
            {!isMobile && isHovered && (
              <div
                className="absolute w-48 h-48 border border-black rounded bg-gray-900 bg-opacity-10 backdrop-blur-sm  pointer-events-none"
                style={{
                  top: magnifierPos.y - 64,
                  left: magnifierPos.x - 64,
                }}
              />
            )}

            <PostWishlist
              productId={product._id}
              productTitle={product.title}
              productImage={product.images?.[selectedImageIndex] || ""}
              productPrice={product.price}
              productSize={product.size}
            />
          </div>

          {/* Flipkart-style Right Side Zoom Viewer */}
          {!isMobile && isHovered && (
            <div
              ref={zoomRef}
              className="absolute top-0 left-full ml-6 w-[500px] h-full border border-gray-300 shadow-xl rounded-sm overflow-hidden z-40"
              style={{
                backgroundImage: `url(${product.images?.[selectedImageIndex]})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: `${zoomLevel * 100}%`,
                backgroundPosition: `${
                  (magnifierPos.x / containerRef.current.offsetWidth) * 100
                }% ${
                  (magnifierPos.y / containerRef.current.offsetHeight) * 100
                }%`,
              }}
            />
          )}
        </div>

        {/* Mobile View */}
        <div className="flex flex-col md:hidden items-center gap-4">
          <div className="relative w-[90vw] h-[80vw] max-w-[400px] bg-white rounded-lg overflow-hidden group">
            <motion.img
              ref={imgRef}
              key={selectedImageIndex}
              src={
                product.images?.[selectedImageIndex] ||
                "https://via.placeholder.com/500"
              }
              alt={product.title}
              className="w-full h-full object-contain rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />

            <PostWishlist
              productId={product._id}
              productTitle={product.title}
              productImage={product.images?.[selectedImageIndex] || ""}
              productPrice={product.price}
              productSize={product.size}
            />
          </div>

          {/* Thumbnails */}
          <div className="w-full px-2">
            <div className="flex gap-2 overflow-x-auto w-[300px]">
              {product.images.slice(0, 6).map((img, index) => (
                <motion.div
                  key={index}
                  className={`w-20 h-20 flex-shrink-0 rounded-lg cursor-pointer overflow-hidden border-2 relative ${
                    index === selectedImageIndex
                      ? "border-black shadow-md"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={img}
                    alt={`Thumb ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === selectedImageIndex && (
                    <div className="absolute inset-0 bg-blue-500/20 pointer-events-none" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductImagesWithZoom;
