import React from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const HomePopupModal = ({ show, onClose }) => {
  const navigate = useNavigate();

  if (!show) return null;

  const handleStartSelling = () => {
    onClose();
    navigate("/addproducts");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="relative bg-white overflow-y-auto  sm:h-auto text-black rounded-2xl shadow-2xl p-6 md:p-10 max-w-3xl w-full mx-4 animate-fadeIn">
        {/* Close button top-right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200"
          aria-label="Close"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-lg sm:text-2xl font-horizon font-extrabold mb-2 tracking-wide text-center">
          Welcome to GRWM!
        </h2>

        <p className="text-sm sm:text-xl mb-2 text-justify">
          We’re so glad you’re here — you just unlocked the coolest corner of
          the internet.
        </p>

        <ul className="list-disc list-inside text-left mb-6 space-y-2 text-black">
          <li>👕 thrift iconic fits</li>
          <li>📦 clear out your closet & cash in</li>
          <li>💅 curated drops, unique pieces, no boring basics</li>
          <li>
            💬 join a community that’s all about style, sustainability & main
            character energy
          </li>
        </ul>

        <div className="flex flex-col  sm:flex-row gap-3 sm:gap-4 items-center justify-center">
          <button
            onClick={onClose}
            className="p-2 bg-black w-36 text-nowrap text-white rounded-md font-medium hover:bg-gray-900 transition-colors duration-200"
          >
            Start Shopping
          </button>
          <button
            onClick={handleStartSelling}
            className="p-2 bg-gray-200 w-36 text-nowrap text-black rounded-md font-medium hover:bg-gray-300 transition-colors duration-200"
          >
            Start Selling
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePopupModal;
