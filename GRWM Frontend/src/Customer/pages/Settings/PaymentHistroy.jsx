import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { FiLoader, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PaymentHistory = () => {
  const [accountDetails, setAccountDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    upiId: "",
  });

  const user = useSelector((state) => state.user.user);
  const token = user?.token || localStorage.getItem("token");

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BASE_URL}/account-detail`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setAccountDetails(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        toast.error("No Account Details!");
        setLoading(false);
      });
  }, [token]);

  const handleEdit = () => {
    setFormData(accountDetails);
    setShowModal(true);
    setIsEditMode(true);
  };

  const handleDelete = () => {
    axios
      .delete(`${import.meta.env.VITE_BASE_URL}/account-detail`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        toast.success(
          response.data.message || "Account details deleted successfully!"
        );
        setAccountDetails(null);
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message || "Error deleting account details!"
        );
      });
  };

  const handleAddNew = () => {
    setShowModal(true);
    setIsEditMode(false);
    setFormData({
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      bankName: "",
      upiId: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const apiCall = isEditMode
      ? axios.put(
          `${import.meta.env.VITE_BASE_URL}/account-detail`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        )
      : axios.post(
          `${import.meta.env.VITE_BASE_URL}/account-detail`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

    apiCall
      .then((response) => {
        toast.success(response.data.message || "Operation successful!");
        setShowModal(false);
        setAccountDetails(response.data.data);
      })
      .catch((error) => {
        const errorMessage =
          error.response?.data?.message || "Something went wrong!";
        toast.error(errorMessage);
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FiLoader className="animate-spin text-black text-5xl" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 shadow-md lg:ml-20 mt-10 relative">
      <ToastContainer position="top-right" autoClose={3000} />

      <h3 className="text-sm md:text-3xl text-start font-semibold font-horizon mb-6 text-black">
        Payment Details{" "}
      </h3>

      {accountDetails && Object.keys(accountDetails).length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-600">Account Holder:</span>
            <span>{accountDetails?.accountHolderName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-600">Account Number:</span>
            <span>{accountDetails?.accountNumber}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-600">IFSC Code:</span>
            <span>{accountDetails?.ifscCode}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-600">Bank Name:</span>
            <span>{accountDetails?.bankName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-600">UPI ID:</span>
            <span>{accountDetails?.upiId}</span>
          </div>

          <div className="justify-end mt-4 flex space-x-4">
            <button
              onClick={handleEdit}
              className="bg-green-600 text-white p-2 rounded-full"
            >
              <FiEdit2 size={20} />
            </button>
            <button
              onClick={handleDelete}
              className="bg-black text-white p-2 rounded-full"
            >
              <FiTrash2 size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center mt-10 flex flex-col items-center">
          <p className="text-gray-900 font-semibold">
            No account details found.
          </p>
          <button
            onClick={handleAddNew}
            className="bg-white flex gap-2 justify-center items-center text-black px-2 py-3 p-2 border border-black rounded-sm mt-6"
          >
            <FiPlus size={20} /> Add New Account Details
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-md shadow-md"
          >
            <h2 className="text-lg font-merriweather font-semibold mb-4">
              {isEditMode ? "Edit" : "Add"} Account Details
            </h2>
            <input
              type="text"
              name="accountHolderName"
              placeholder="Account Holder Name"
              value={formData.accountHolderName}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              name="accountNumber"
              placeholder="Account Number"
              value={formData.accountNumber}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              name="ifscCode"
              placeholder="IFSC Code"
              value={formData.ifscCode}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              name="bankName"
              placeholder="Bank Name"
              value={formData.bankName}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              name="upiId"
              placeholder="UPI ID"
              value={formData.upiId}
              onChange={handleInputChange}
              className="border p-2 w-full mb-2"
            />
            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="bg-gray-300 p-2 rounded"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-black text-white px-4 p-2 rounded-sm"
              >
                {isEditMode ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;
