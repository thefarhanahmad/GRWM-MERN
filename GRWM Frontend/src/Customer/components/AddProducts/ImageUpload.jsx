import React, { useState, useRef } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaTimes } from "react-icons/fa";

const MAX_IMAGES = 6;

const ImageUpload = ({
  previewImages,
  productImages,
  setPreviewImages,
  setProductImages,
  errors,
  showToast,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef(null);
  const zoomRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const previewsCopy = [...previewImages];
    const productsCopy = [...productImages];
    const emptyIndexes = [];

    previewsCopy.forEach((img, idx) => {
      if (!img) emptyIndexes.push(idx);
    });

    const availableSlots = MAX_IMAGES - previewsCopy.filter(Boolean).length;
    const allowedFiles = files.slice(0, availableSlots);

    if (allowedFiles.length === 0) {
      showToast("error", `You can upload up to ${MAX_IMAGES} images only.`);
      return;
    }

    let readCount = 0;

    allowedFiles.forEach((file, fileIdx) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const targetIndex = emptyIndexes[fileIdx];
        previewsCopy[targetIndex] = event.target.result;
        productsCopy[targetIndex] = file;
        readCount++;

        if (readCount === allowedFiles.length) {
          setPreviewImages([...previewsCopy]);
          setProductImages([...productsCopy]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setPreviewImages((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
    setProductImages((prev) => {
      const updated = [...prev];
      updated[index] = null;
      return updated;
    });
    if (selectedImageIndex === index) {
      setSelectedImageIndex(0);
    }
  };

  const canAddMore = previewImages.filter(Boolean).length < MAX_IMAGES;
  const filledCount = previewImages.filter(Boolean).length;
  const nextSlotToShow =
    filledCount < MAX_IMAGES ? filledCount + 1 : MAX_IMAGES;

  const displaySlots = Array(MAX_IMAGES).fill(null);
  previewImages.forEach((img, idx) => {
    displaySlots[idx] = img;
  });

  const handleMouseMove = (e) => {
    const { left, top, width, height } = imgRef.current.getBoundingClientRect();
    const x = e.pageX - left - window.scrollX;
    const y = e.pageY - top - window.scrollY;
    const bgX = (x / width) * 100;
    const bgY = (y / height) * 100;

    zoomRef.current.style.backgroundPosition = `${bgX}% ${bgY}%`;
    setMagnifierPos({ x, y });
  };

  return (
    <div
      className="p-4 border border-gray-200 rounded-xl max-w-[1100px] mt-5 bg-white shadow-sm"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <h3 className="text-md font-semibold text-gray-800 mb-4">
        Add up to {MAX_IMAGES} images to showcase your product
      </h3>

      <div className="flex flex-col gap-6">
        {/* 🔍 Main Image with Zoom */}
        <div className="relative w-full">
          <div
            className="relative rounded-xl overflow-hidden w-full h-[350px]"
            ref={imgRef}
            onMouseEnter={() => setShowMagnifier(true)}
            onMouseLeave={() => setShowMagnifier(false)}
            onMouseMove={handleMouseMove}
          >
            {displaySlots[0] ? (
              <>
                <img
                  src={displaySlots[selectedImageIndex]}
                  alt="Main"
                  className="w-full h-full object-contain rounded-lg"
                />
                {showMagnifier && (
                  <div
                    ref={zoomRef}
                    className="absolute w-[200px] h-[200px] border border-gray-300 rounded-md shadow-lg pointer-events-none z-50"
                    style={{
                      top: magnifierPos.y - 100,
                      left: magnifierPos.x - 100,
                      backgroundImage: `url(${displaySlots[selectedImageIndex]})`,
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "250%",
                    }}
                  />
                )}
              </>
            ) : (
              <label
                htmlFor="fileInput"
                className="w-full h-full flex flex-col items-center justify-center text-gray-500 text-sm cursor-pointer hover:bg-gray-100 transition-colors rounded-xl"
              >
                <CiCirclePlus className="w-12 h-12 mb-2" />
                <span className="text-gray-600 font-medium">
                  Drag & drop or click to upload
                </span>
                {/* <span className="text-gray-500 text-sm mt-1">
                  Recommended size: 1200x900 pixels
                </span> */}
              </label>
            )}
          </div>
        </div>

        {/* 🖼 Thumbnails Row (Scrollable) */}
        {displaySlots[0] && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {displaySlots.map((img, i) =>
              i < nextSlotToShow ? (
                <div
                  key={i}
                  className={`flex-shrink-0 w-24 h-24 aspect-square rounded-lg cursor-pointer overflow-hidden border-2 relative transition-all ${
                    i === selectedImageIndex
                      ? "border-blue-500 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  } ${!img ? "bg-gray-100" : ""}`}
                  onClick={() => img && setSelectedImageIndex(i)}
                >
                  {img ? (
                    <>
                      <img
                        src={img}
                        alt={`Thumb ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(i);
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    canAddMore && (
                      <label
                        htmlFor="fileInput"
                        className="cursor-pointer w-full h-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        <CiCirclePlus className="w-6 h-6 text-gray-500" />
                      </label>
                    )
                  )}
                </div>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* 👇 Hidden Input */}
      <input
        type="file"
        id="fileInput"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* ❌ Error Display */}
      {errors.image && (
        <div className="mt-4 text-red-600 text-sm flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          {errors.image}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
