// components/ConditionSelect.jsx
import { Info, X } from "lucide-react";
import React, { useState } from "react";

const ConditionSelect = ({ value, onChange }) => {
    const [showConditionInfo, setShowConditionInfo] = useState(false);

    return (
        <div className="relative">
            {/* Label and Info Icon */}
            <label className="flex items-center text-md font-medium text-gray-900 mb-1">
                Condition
                <Info
                    className="w-4 h-4 ml-1 cursor-pointer"
                    onClick={() => setShowConditionInfo(true)}
                />
            </label>

            {/* Select Box */}
            <select
                name="condition"
                value={value}
                onChange={onChange}
                className={`w-full px-4 py-3 border border-black rounded-lg focus:outline-none 
                ${value ? "text-black" : "text-gray-600 text-sm"}`}
                required
            >
                <option value="">Select Condition</option>
                {[
                    "New with tags",
                    "New without tags",
                    "Very good",
                    "Good",
                    "Satisfactory",
                ].map((condition) => (
                    <option key={condition} value={condition}>
                        {condition}
                    </option>
                ))}
            </select>

            {/* Modal */}
            {showConditionInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-40 z-[1000] flex items-center justify-center">
                    <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-xl p-6 relative">
                        {/* Close Icon */}
                        <button
                            onClick={() => setShowConditionInfo(false)}
                            className="absolute top-4 right-4 text-red-600 hover:text-black"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Modal Content */}
                        <h2 className="text-xl font-bold mb-8">Condition Guide</h2>
                        <ul className="space-y-3 text-sm text-black">
                            <li>
                                <strong>1. New with tags:</strong> Just like buying it fresh from a store. The item has never been worn or used, comes with original tags and/or packaging, and is in perfect condition.
                            </li>
                            <li>
                                <strong>2. New without tags:</strong> The item is brand new and unused, but the tags or original packaging are missing. Still flawless.
                            </li>
                            <li>
                                <strong>3. Very good:</strong> Worn a couple of times but still in excellent shape. Clothing must be stain-free and freshly cleaned.
                            </li>
                            <li>
                                <strong>4. Good:</strong> Visible signs of wear — such as light pilling, minor stains, or faded areas — but still in good wearable condition. All flaws should be described and shown clearly in the listing photos.
                            </li>
                            <li>
                                <strong>5. Satisfactory:</strong> Well-used with visible wear and imperfections. These should be clearly described and shown in your listing so buyers know what to expect.
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConditionSelect;
