import React, { useEffect } from "react";
import { X, Sparkles } from "lucide-react";

const CleanReminderPopup = ({ show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-transparent pointer-events-none">
      <div
        className="absolute top-6 right-6 bg-white max-w-sm w-[90%] sm:w-96 rounded-xl p-4 shadow-xl border border-gray-200 pointer-events-auto flex items-start gap-3"
      >
        {/* Icon */}
        <div className="mt-1 text-blue-500">
          <Sparkles className="w-6 h-6" />
        </div>

        {/* Message */}
        <div className="flex-1 text-black text-sm sm:text-md text-left pr-6">
          <strong>No one likes a dirty drop —</strong> make sure your fits are fresh & clean before uploading!
        </div>

        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CleanReminderPopup;
