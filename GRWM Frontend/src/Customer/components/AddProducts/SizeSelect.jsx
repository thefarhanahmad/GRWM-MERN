import React, { useEffect, useState } from "react";

const SizeSelect = ({ value, onChange, itemType, getSizeOptions }) => {
  const [sizeOptions, setSizeOptions] = useState([]);
  
  // Function to get size options based on itemType
  const fetchSizeOptions = () => {
    const options = getSizeOptions(itemType);  // Assuming this function returns size options based on itemType
    setSizeOptions(options);  // Update size options in state
  };

  useEffect(() => {
    fetchSizeOptions();  // Fetch size options whenever itemType changes
  }, [itemType]);

  return (
    <div>
      <label className="block text-md font-medium text-gray-900 mb-1">
        Size *
      </label>

      {/* Check if sizeOptions is empty */}
      <select
        name="size"
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 border border-black rounded-lg focus:outline-none`}
        required
      >
        <option value="">Select Size</option>
        {sizeOptions.length > 0 ? (
          sizeOptions.map((size, index) => (
            <option key={index} value={size}>
              {size}
            </option>
          ))
        ) : (
          <option value="" disabled>
            No Size Available
          </option>
        )}
      </select>
    </div>
  );
};

export default SizeSelect;
