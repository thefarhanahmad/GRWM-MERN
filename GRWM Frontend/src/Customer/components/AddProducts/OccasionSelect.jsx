import React, { useState } from "react";
import { Info, X } from "lucide-react";

const OccasionSelect = ({ value, onChange, itemType }) => {
  const [showOccasionInfo, setShowOccasionInfo] = useState(false);

  const occasionOptions = [
    "Casual",
    "Formal",
    "Party",
    "Smart Casual",
    "Streetwear / Athleisure",
    "Vacation / Resort",
  ];

  return (
    <div className="relative">
      {/* Label with Info Icon */}
      <label
        htmlFor="occasion"
        className="flex items-center text-md font-medium text-gray-900 mb-1"
      >
        Occasion{" "}
        <span className="text-black ml-1">
          {itemType === "680af67079e7f7670b39168d" ? "" : ""}
        </span>
        <Info
          className="w-4 h-4  cursor-pointer"
          onClick={() => setShowOccasionInfo(true)}
        />
      </label>

      {/* Dropdown */}
      <select
        id="occasion"
        name="occasion"
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border border-black rounded-lg text-sm focus:outline-none ${
          value ? "text-black" : "text-gray-600"
        }`}
        disabled={itemType === "680af67079e7f7670b39168d"}
      >
        <option value="">Select Occasion</option>
        {occasionOptions.map((occasion) => (
          <option key={occasion} value={occasion}>
            {occasion}
          </option>
        ))}
      </select>

      {/* Modal for Occasion Info */}
      {showOccasionInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-[1000] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-xl p-6 relative max-h-[80vh] overflow-y-auto">
            {/* Close Icon */}
            <button
              onClick={() => setShowOccasionInfo(false)}
              className="absolute top-4 right-4 text-red-600 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal Content */}
            <h2 className="text-xl font-bold mb-8">Occasion Guide</h2>
            <ul className="space-y-4 text-sm text-black">
              <li>
                <strong>1. Formal:</strong> Structured, work-appropriate or officewear.<br />
                <em>Examples:</em> Blazers, suit pants, pencil skirts.
              </li>
              <li>
                <strong>2. Casual:</strong> Everyday relaxed styles for comfort.<br />
                <em>Examples:</em> T-shirts, jeans, hoodies.
              </li>
              <li>
                <strong>3. Party:</strong> Bold, trendy or night-out ready outfits.<br />
                <em>Examples:</em> Bodycon dresses, corset tops, leather pants.
              </li>
              <li>
                <strong>4. Smart Casual:</strong> Polished yet relaxed — desk to dinner looks.<br />
                <em>Examples:</em> Polos, chinos, midi skirts.
              </li>
              <li>
                <strong>5. Streetwear / Athleisure:</strong> Sporty, oversized or urban-inspired fashion.<br />
                <em>Examples:</em> Oversized tees, joggers, varsity jackets.
              </li>
              <li>
                <strong>6. Vacation / Resort:</strong> Breezy, lightweight fits for travel & holidays.<br />
                <em>Examples:</em> Linen shirts, flowy dresses, co-ord sets.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default OccasionSelect;
