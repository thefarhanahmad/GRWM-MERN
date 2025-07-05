import React, { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

const ReturnModal = ({ order, onClose, token }) => {
  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    email: "",
    bankDetails: {
      accountNumber: "",
      ifsc: "",
      accountHolder: "",
    },
    reason: "",
    productDescription: "",
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name in form.bankDetails) {
      setForm((prev) => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, [name]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    if (images.length === 0) {
      alert("Please upload at least one payment screenshot.");
      return;
    }

    const formData = new FormData();
    formData.append("customerName", form.customerName);
    formData.append("phoneNumber", form.phoneNumber);
    formData.append("email", form.email);
    formData.append("bankDetails", JSON.stringify(form.bankDetails));
    formData.append("product", order?.product_id?.title || "");
    formData.append("productDescription", form.productDescription);
    formData.append("sellerName", order?.vendor_id?.name || "");
    formData.append("reason", form.reason);
    formData.append("requestTo", order?.vendor_id?._id || "");
    formData.append("productId", order?.product_id?._id || "");
    images.forEach((img) => formData.append("paymentScreenshot", img));

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/return-request`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 font-openSans flex items-center justify-center z-50 px-3">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl md:p-6 p-4 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Submit Return Request
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="grid gap-4">
          {/* Customer Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Customer Name
            </label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleInputChange}
              className="w-full border rounded-md p-2 mt-1"
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2 mt-1"
                placeholder="9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="w-full border rounded-md p-2 mt-1"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Bank Details */}
          <div className="pt-2">
            <h3 className="text-md font-semibold text-gray-800 mb-1">
              Bank Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Account Number</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={form.bankDetails.accountNumber}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2 mt-1"
                  placeholder="e.g. 123456789012"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">IFSC Code</label>
                <input
                  type="text"
                  name="ifsc"
                  value={form.bankDetails.ifsc}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2 mt-1"
                  placeholder="e.g. SBIN0001234"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="text-sm text-gray-600">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  name="accountHolder"
                  value={form.bankDetails.accountHolder}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-2 mt-1"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>
            </div>
          </div>

          {/* Reason & Description */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Reason for Return
            </label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleInputChange}
              rows={3}
              className="w-full border rounded-md p-2 mt-1"
              placeholder="Why are you returning the product?"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Product Description
            </label>
            <textarea
              name="productDescription"
              value={form.productDescription}
              onChange={handleInputChange}
              rows={3}
              className="w-full border rounded-md p-2 mt-1"
              placeholder="Optional description of the product"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Payment Screenshot(s)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border rounded-md p-2"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-end mt-6 gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 bg-black text-white hover:bg-gray-900 rounded-md"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;
