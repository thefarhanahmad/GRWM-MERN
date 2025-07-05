import React from "react";
import { FiWifiOff } from "react-icons/fi";

const NetworkError = ({ message = "We couldn’t load the content due to a network issue. Please check your internet connection and try again." }) => {
  return (
    <div className="h-screen flex flex-col justify-center items-center text-center px-4">
      <FiWifiOff className="text-6xl text-black mb-8 animate-pulse" />
      <p className="text-xl font-semibold text-black mb-2">Network Error</p>
      <p className="text-md text-gray-600 max-w-md">{message}</p>
    </div>
  );
};

export default NetworkError;
