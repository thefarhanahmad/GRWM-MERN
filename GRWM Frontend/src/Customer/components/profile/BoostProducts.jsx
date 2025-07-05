import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import toast from "react-hot-toast"; // Import toast for notifications
import { RiFireFill } from "react-icons/ri";

Modal.setAppElement("#root");

const BoostProducts = ({ token, baseUrl, profile }) => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalWidth, setModalWidth] = useState("80vw");

  useEffect(() => {
    const updateModalWidth = () => {
      setModalWidth(window.innerWidth < 768 ? "95vw" : "80vw");
    };

    updateModalWidth();
    window.addEventListener("resize", updateModalWidth);

    return () => window.removeEventListener("resize", updateModalWidth);
  }, []);

  const packages = [
    { duration: 1, price: 100 },
    { duration: 3, price: 250 },
    { duration: 5, price: 350 },
  ];

  // 📌 Fetch All Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/vendor-products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
          setProducts(response.data.data);
        } else {
          setError("Failed to fetch products.");
        }
      } catch (error) {
        setError(error.response?.data?.message || "Error fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [baseUrl, token]);

  // 📌 Open the Modal
  const openModal = () => {
    setSelectedProducts([]); // Clear selected products
    setSelectedPackage(packages[0]); // ✅ Default to first package
    setCalculatedPrice(packages[0].price); // ✅ Show initial package price
    setModalOpen(true);
  };

  // 📌 Select Products (Toggle)
  const toggleProductSelection = (productId) => {
    setSelectedProducts((prev) => {
      const updatedSelection = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      // ✅ Calculate price dynamically
      if (selectedPackage) {
        setCalculatedPrice(
          selectedPackage.price * updatedSelection.length ||
            selectedPackage.price
        );
      }

      return updatedSelection;
    });
  };

  // 📌 Update Price Dynamically on Package Change
  const handlePackageSelection = (pkg) => {
    setSelectedPackage(pkg);
    setCalculatedPrice(pkg.price * selectedProducts.length || pkg.price); // ✅ Show base price if no product selected
  };

  // 📌 Handle Payment & Boosting
  const handleBoostPayment = async () => {
    if (!selectedPackage) {
      toast.error("Please select a package.");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product.");
      return;
    }

    try {
      setLoading(true);
      const { duration } = selectedPackage;
      const finalPrice = calculatedPrice;

      console.log("⏳ Creating Boost Order with Data:", {
        finalPrice,
        products: selectedProducts,
        duration,
      });

      // 📌 Step 1: Create Razorpay Order
      const orderResponse = await axios.post(
        `${baseUrl}/create-boost-order`,
        { price: finalPrice, products: selectedProducts, duration },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!orderResponse.data.success) {
        throw new Error("Failed to create boost order.");
      }

      const { redirectUrl, txnId } = orderResponse.data;

      // 📌 Step 2: Redirect to PhonePe payment page
      localStorage.setItem(
        "boostTxnInfo",
        JSON.stringify({
          txnId,
          products: selectedProducts,
          duration,
          price: finalPrice,
        })
      );

      window.location.href = redirectUrl;
    } catch (error) {
      console.error("PhonePe payment error:", error);
      toast.error(error.response?.data?.message || "Error processing payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:px-16  font-openSans mx-auto p-3">
      <div className="text-center flex gap-3 sm:gap-4 bg-gray-100 rounded-md shadow-md">
        <span className="text-lg w-24 font-semibold border flex justify-center items-center bg-gray-300 p-4 text-gray-900">
          <RiFireFill className="lg:text-6xl text-3xl" />
        </span>
        <div className="flex flex-col py-3 sm:p-3">
          <p className="text-gray-700 text-left text-xs sm:text-lg">
            Increase visibility & get featured in the <b>Wardrobe Spotlight</b>{" "}
            to reach ideal buyers.
          </p>
          <button
            className="mt-3 text-nowrap w-36 p-3 self-start bg-black text-white font-semibold  rounded-md transition transform text-xs sm:text-sm hover:scale-105 shadow-lg"
            onClick={openModal}
          >
            Boost Items
          </button>
        </div>
      </div>

      {/*Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setModalOpen(false);
          setSelectedProducts([]);
          setSelectedPackage(null);
          setCalculatedPrice(0);
        }}
        className="modal"
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            width: modalWidth,
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "10px",
            background: "white",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          },
        }}
      >
        <button
          onClick={() => setModalOpen(false)}
          className="absolute top-2 right-2 text-gray-600 hover:text-black bg-gray-200 hover:bg-gray-300 rounded-full p-2"
        >
          ❌
        </button>

        {/* Products Section */}
        <h2 className="text-sm md:text-3xl text-start font-semibold font-horizon mb-6 text-black">
          Select Products to Boost
        </h2>
        <div
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 overflow-y-auto"
          style={{ maxHeight: "50vh" }}
        >
          {products.map((product) => (
            <div
              key={product._id}
              className={`border p-2 cursor-pointer flex flex-col items-center ${
                selectedProducts.includes(product._id)
                  ? "border-black bg-gray-100"
                  : "border-gray-300"
              }`}
              onClick={() => toggleProductSelection(product._id)}
            >
              <img
                src={product.images[0]}
                className="w-full h-32 object-cover mb-2 rounded-md"
              />
              <p className="text-sm text-center">{product.title}</p>
            </div>
          ))}
        </div>

        {/* Packages Section */}
        <h2 className="text-lg font-semibold mt-6 mb-3">Select a Package</h2>
        <div className="grid grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.duration}
              className={`border p-2 flex justify-center items-center flex-col sm:p-4 cursor-pointer ${
                selectedPackage?.duration === pkg.duration
                  ? "border-black bg-gray-100"
                  : ""
              }`}
              onClick={() => handlePackageSelection(pkg)}
            >
              <p className="text-lg font-semibold">
                ₹{pkg.price * selectedProducts.length || pkg.price}
              </p>
              <p className="text-sm text-gray-600 text-nowrap">
                {pkg.duration} Days
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={handleBoostPayment}
          className="bg-black text-white px-4 py-2 mt-4 w-full"
        >
          Boost Now
        </button>
      </Modal>
    </div>
  );
};

export default BoostProducts;
