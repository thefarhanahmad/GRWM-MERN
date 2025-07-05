import React from "react";

const ColorSelect = ({ value, onChange, disabled }) => {
  const colorOptions = [
    "Beige", "Black", "Blue", "Brown", "Dark Blue", "Dark Green", "Gold",
    "Green", "Grey", "Khaki", "Light Blue", "Light Green", "Light Pink",
    "Maroon", "Metallic", "Multicolour", "Off White", "Olive", "Orange",
    "Pink", "Purple", "Red", "Silver", "White", "Yellow",
  ];

  return (
    <div>
      <label className="block text-md font-medium text-gray-900 mb-1">
        Colour *
      </label>
      <select
        name="color"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full px-4 py-3 border border-black rounded-lg focus:outline-none placeholder:text-sm"
      >
        <option value="">Select Colour</option>
        {colorOptions.map((color) => (
          <option key={color} value={color}>
            {color}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ColorSelect;
