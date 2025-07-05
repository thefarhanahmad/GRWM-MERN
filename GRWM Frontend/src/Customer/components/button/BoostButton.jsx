import React, { useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import toast from "react-hot-toast";

const BoostButton = ({ product, token, profile }) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const packages = [
    { duration: 1, price: 100 },
    { duration: 3, price: 250 },
    { duration: 5, price: 350 },
  ];

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📌 Handle Package Selection
  const handlePackageSelection = (pkg) => {
    setSelectedPackage(pkg);
  };

  // 📌 Handle Boost Payment
  const handleBoostPayment = async () => {
    if (!selectedPackage) {
      toast.error("Please select a package.");
      return;
    }

    setLoading(true);

    try {
      const { duration, price } = selectedPackage;

      const response = await axios.post(
        `${BASE_URL}/create-boost-order`,
        {
          price,
          products: [product._id], // assuming `product` is defined
          duration,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (
        !response.data.success ||
        !response.data.redirectUrl ||
        !response.data.txnId
      ) {
        throw new Error("Failed to create boost order.");
      }

      const { redirectUrl, txnId } = response.data;

      // 📌 Step 2: Save txn info to localStorage for verification after redirect
      localStorage.setItem(
        "boostTxnInfo",
        JSON.stringify({
          txnId,
          products: [product._id],
          duration,
          price,
        })
      );

      // 📌 Step 3: Redirect to PhonePe Payment Page
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("❌ PhonePe Payment Error:", error);
      toast.error(
        error?.response?.data?.message || "Error processing payment."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 🟢 Boost Now Button */}
      <button
        className="mt-4 w-full bg-black text-white py-2 rounded-sm transition-all"
        onClick={() => setModalOpen(true)}
      >
        Boost Now
      </button>

      {/* 🟢 Boost Package Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setModalOpen(false);
          setSelectedPackage(null);
        }}
        className="modal"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            width: "80vw",
            // height: "30vh",
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "10px",
            background: "white",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* ❌ Close Button */}
        <button
          onClick={() => setModalOpen(false)}
          className="absolute top-2 right-2 text-gray-600 hover:text-black bg-gray-200 hover:bg-gray-300 rounded-full p-2"
        >
          ❌
        </button>

        {/* 🟢 Packages Selection */}
        <h2 className="text-lg font-semibold mb-4">Select a Boost Package</h2>
        <div className="grid grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.duration}
              className={`border p-4 cursor-pointer text-center ${
                selectedPackage?.duration === pkg.duration
                  ? "border-black bg-gray-100"
                  : ""
              }`}
              onClick={() => handlePackageSelection(pkg)}
            >
              <p className="text-lg font-semibold">₹{pkg.price}</p>
              <p className="text-sm text-gray-600">{pkg.duration} Days</p>
            </div>
          ))}
        </div>

        {/* 🟢 Boost Now Button */}
        <button
          onClick={handleBoostPayment}
          className="bg-black text-white px-4 py-2 mt-4 w-full"
          disabled={loading}
        >
          {loading ? "Processing..." : "Boost Now"}
        </button>
      </Modal>
    </div>
  );
};

export default BoostButton;
